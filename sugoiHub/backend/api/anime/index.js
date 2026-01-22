const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const { pool } = require('../../db');
const authMiddleware = require('../../middleware/auth');

// Simple in-memory cache to reduce requests to Jikan (ttlSeconds) 
const cache = new Map(); // key -> { expires: number, data: any }
const DEFAULT_TTL = 60; // seconds

function hasBannedGenre(genres) {
  if (!Array.isArray(genres)) return false;
  return genres.some((g) => String(g || '').trim().toLowerCase() === 'hentai');
}

function isBannedGenreFilter(filter) {
  const s = String(filter || '').trim().toLowerCase();
  return s === 'hentai' || s.includes('hentai');
}

function setCache(key, data, ttl = DEFAULT_TTL) {
  cache.set(key, { expires: Date.now() + ttl * 1000, data });
}

function getCache(key) {
  const v = cache.get(key);
  if (!v) return null;
  if (Date.now() > v.expires) {
    cache.delete(key);
    return null;
  }
  return v.data;
}

// small sleep helper
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(url, options = {}, retries = 2, backoffMs = 500) {
  let attempt = 0;
  while (true) {
    try {
      const r = await (typeof fetch !== 'undefined' ? fetch(url, options) : (await import('node-fetch')).default(url, options));

      // Retry on rate limiting / transient upstream failures.
      if (r.status === 429 || (r.status >= 500 && r.status <= 599)) {
        attempt++;
        if (attempt > retries) return r;

        const retryAfterHeader = r.headers && typeof r.headers.get === 'function' ? r.headers.get('retry-after') : null;
        const retryAfterSec = retryAfterHeader ? Number(retryAfterHeader) : NaN;
        const waitMs = Number.isFinite(retryAfterSec)
          ? Math.max(0, retryAfterSec) * 1000
          : backoffMs * Math.pow(2, attempt - 1);

        await sleep(waitMs);
        continue;
      }

      return r;
    } catch (e) {
      attempt++;
      if (attempt > retries) throw e;
      // exponential backoff
      await sleep(backoffMs * Math.pow(2, attempt - 1));
    }
  }
}

// Search endpoint: proxy to Jikan
router.get('/search', async (req, res) => {
  try {
    const q = req.query.q || '';
    const limit = Number(req.query.limit) || 12;
    const genreFilter = req.query.genre || null;

    // Bloqueo explícito: nunca servir hentai (aunque el usuario lo pida).
    if (genreFilter && isBannedGenreFilter(genreFilter)) {
      return res.json({ results: [] });
    }

    const params = new URLSearchParams();
    if (q) params.set('q', q);
    params.set('limit', String(limit));

    const url = `https://api.jikan.moe/v4/anime?${params.toString()}`;

    // Cache key per exact URL + genreFilter (genre handled after mapping)
    const cacheKey = `search:${url}:${genreFilter || ''}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json({ results: cached });
    }

    console.log('Proxying Jikan request to:', url);
    const headers = { Accept: 'application/json', 'User-Agent': 'sugoiapp/1.0 (+https://example.com)' };
    const r = await fetchWithRetry(url, { headers }, 3, 1000);
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      console.error('Jikan search error', r.status, text);
      // Si hay datos en caché aunque estén expirados, retornarlos
      const expiredCache = cache.get(cacheKey);
      if (expiredCache) {
        console.log('Returning expired cache due to API error');
        return res.json({ ok: true, results: expiredCache.data, cached: true });
      }
      return res.status(200).json({ ok: true, results: [] });
    }

    const j = await r.json();
    const data = (j.data || []).map((it) => ({
      id: it.mal_id,
      mal_id: it.mal_id,
      title: it.title,
      title_english: it.title_english || null,
      image: it.images?.jpg?.image_url || null,
      images: it.images || null,
      genres: (it.genres || []).map((g) => g.name),
      score: it.score || null,
      synopsis: it.synopsis || null,
    }));

    // Filtro global: eliminar hentai de la API.
    const withoutHentai = data.filter((a) => !hasBannedGenre(a.genres));

    let results = withoutHentai;
    if (genreFilter) {
      const gf = String(genreFilter).toLowerCase();
      results = withoutHentai.filter((a) => (a.genres || []).some((g) => String(g).toLowerCase().includes(gf)));
    }

    // cache results (short TTL to reduce rate pressure)
    setCache(cacheKey, results, 60);

    return res.json({ ok: true, results });
  } catch (e) {
    console.error('Error in /api/anime/search', e);
    return res.status(500).json({ error: String(e) });
  }
});

function getOptionalUserId(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
    return payload?.id ?? null;
  } catch {
    return null;
  }
}

// Likes: GET /api/anime/:id/likes -> {likes, liked}
router.get('/:id/likes', async (req, res) => {
  try {
    const animeId = String(req.params.id || '').trim();
    if (!animeId) return res.status(400).json({ ok: false, error: 'Missing id' });

    const userId = getOptionalUserId(req);

    const [{ rows: countRows }, { rows: likedRows }] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS likes FROM public.anime_likes WHERE anime_id=$1', [animeId]),
      userId
        ? pool.query('SELECT 1 FROM public.anime_likes WHERE anime_id=$1 AND user_id=$2 LIMIT 1', [animeId, userId])
        : Promise.resolve({ rows: [] })
    ]);

    const likes = parseInt(countRows?.[0]?.likes ?? 0) || 0;
    const liked = userId ? likedRows.length > 0 : false;

    return res.json({ ok: true, likes, liked });
  } catch (err) {
    console.error('Anime likes GET error:', err);
    return res.status(500).json({ ok: false, error: 'Error obteniendo likes' });
  }
});

// Likes toggle: POST /api/anime/:id/likes
router.post('/:id/likes', authMiddleware, async (req, res) => {
  try {
    const animeId = String(req.params.id || '').trim();
    if (!animeId) return res.status(400).json({ ok: false, error: 'Missing id' });

    const userId = req.user.id;

    // Toggle (delete if exists; else insert)
    await pool.query(
      `WITH deleted AS (
         DELETE FROM public.anime_likes
         WHERE user_id=$1 AND anime_id=$2
         RETURNING 1
       )
       INSERT INTO public.anime_likes (user_id, anime_id)
       SELECT $1, $2
       WHERE NOT EXISTS (SELECT 1 FROM deleted)
       ON CONFLICT DO NOTHING`,
      [userId, animeId]
    );

    const [{ rows: countRows }, { rows: likedRows }] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS likes FROM public.anime_likes WHERE anime_id=$1', [animeId]),
      pool.query('SELECT 1 FROM public.anime_likes WHERE anime_id=$1 AND user_id=$2 LIMIT 1', [animeId, userId])
    ]);

    const likes = parseInt(countRows?.[0]?.likes ?? 0) || 0;
    const liked = likedRows.length > 0;

    return res.json({ ok: true, likes, liked });
  } catch (err) {
    console.error('Anime likes POST error:', err);
    return res.status(500).json({ ok: false, error: 'Error actualizando likes' });
  }
});

// Detail endpoint: proxy to Jikan
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: 'Missing id' });

    const url = `https://api.jikan.moe/v4/anime/${encodeURIComponent(id)}`;
    const cacheKey = `detail:${url}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json({ ok: true, data: cached });

    console.log('Proxying Jikan detail request to:', url);
    const headers = { Accept: 'application/json', 'User-Agent': 'sugoiapp/1.0 (+https://example.com)' };
    const r = await fetchWithRetry(url, { headers }, 3, 1000);
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      console.error('Jikan anime detail error', r.status, text);
      // Si hay datos en caché aunque estén expirados, retornarlos
      const expiredCache = cache.get(cacheKey);
      if (expiredCache) {
        console.log('Returning expired cache due to API error');
        return res.json({ ok: true, data: expiredCache.data, cached: true });
      }
      return res.status(502).json({ ok: false, error: 'Jikan API temporalmente no disponible', status: r.status });
    }

  const j = await r.json();
    const it = j.data;
    if (!it) return res.status(404).json({ error: 'Not found' });

    const mapped = {
      id: it.mal_id,
      mal_id: it.mal_id,
      title: it.title,
      title_english: it.title_english || null,
      image: it.images?.jpg?.image_url || null,
      images: it.images || null,
      genres: (it.genres || []).map((g) => g.name),
      score: it.score || null,
      episodes: it.episodes || null,
      status: it.status || null,
      synopsis: it.synopsis || null,
      aired: it.aired || null,
    };

    if (hasBannedGenre(mapped.genres)) {
      return res.status(404).json({ error: 'Not found' });
    }

    setCache(cacheKey, mapped, 300);
    return res.json({ ok: true, data: mapped });
  } catch (e) {
    console.error('Error in /api/anime/:id', e);
    return res.status(500).json({ error: String(e) });
  }
});

module.exports = router;
