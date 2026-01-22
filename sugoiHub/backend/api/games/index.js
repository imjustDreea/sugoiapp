const express = require('express');
const router = express.Router();

// API pública sin key: FreeToGame
// Docs: https://www.freetogame.com/api-doc
const FREETOGAME_BASE = 'https://www.freetogame.com/api';

// Simple in-memory cache (ttlSeconds)
const cache = new Map(); // key -> { expires: number, data: any }
const DEFAULT_TTL = 120; // seconds

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

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(url, options = {}, retries = 2, backoffMs = 500) {
  let attempt = 0;
  while (true) {
    try {
      const r = await (typeof fetch !== 'undefined'
        ? fetch(url, options)
        : (await import('node-fetch')).default(url, options));

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
      await sleep(backoffMs * Math.pow(2, attempt - 1));
    }
  }
}

function toNumberOrUndefined(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

// GET /api/games/search?q=...&limit=...
router.get('/search', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    const categoryRaw = String(req.query.category || req.query.genre || '').trim();
    const category = categoryRaw ? categoryRaw.toLowerCase() : '';
    const limit = Math.max(1, Math.min(60, Number(req.query.limit) || 24));

    // FreeToGame devuelve un listado grande; aplicamos limit local.
    // Si hay categoría, la pasamos al upstream para reducir resultados.
    const url = category
      ? `${FREETOGAME_BASE}/games?category=${encodeURIComponent(category)}`
      : `${FREETOGAME_BASE}/games`;

    const cacheKey = `games:search:${url}`;
    const cached = getCache(cacheKey);
    const baseResults = cached || null;
    if (!cached) {
      const headers = { Accept: 'application/json', 'User-Agent': 'sugoiapp-games/1.0' };
      const r = await fetchWithRetry(url, { headers }, 3, 1000);
      if (!r.ok) {
        const text = await r.text().catch(() => '');
        console.error('FreeToGame error', r.status, text);

        // Si la categoría es inválida, el upstream suele responder 4xx.
        // En ese caso preferimos no romper el UI: devolvemos lista vacía.
        if (category && r.status >= 400 && r.status < 500) {
          return res.json({ ok: true, results: [], warning: 'Invalid category', upstreamStatus: r.status });
        }

        // Intentar devolver cache expirado
        const expiredCache = cache.get(cacheKey);
        if (expiredCache) {
          console.log('Returning expired cache due to API error');
          return res.json({ ok: true, results: expiredCache.data, cached: true });
        }

        return res.json({ ok: true, results: [] });
      }

      const j = await r.json();
      const arr = Array.isArray(j) ? j : [];

      // Normalizamos a la forma que usa el frontend
      const results = arr.map((it) => {
        // { id, title, thumbnail, genre, platform, publisher, developer, ... }
        return {
          id: it.id,
          title: it.title ?? 'Untitled',
          image: it.thumbnail ?? null,
          studio: it.publisher ?? it.developer ?? undefined,
          platforms: it.platform ? [String(it.platform)] : [],
          genre: it.genre ?? undefined,
          rating: undefined,
          raw: it
        };
      });

      setCache(cacheKey, results, 120);
    }

    const all = baseResults || getCache(cacheKey) || [];

    // Filtro por búsqueda local (FreeToGame no soporta q)
    const filteredByQuery = q
      ? all.filter((g) => String(g.title || '').toLowerCase().includes(q.toLowerCase()))
      : all;

    // Si category vino pero el upstream devolvió más amplio por algún motivo, filtramos también local.
    const filteredByCategory = category
      ? filteredByQuery.filter((g) => String(g.genre || '').toLowerCase().includes(category))
      : filteredByQuery;

    return res.json({ ok: true, results: filteredByCategory.slice(0, limit) });
  } catch (e) {
    console.error('Error in /api/games/search', e);
    return res.status(500).json({ error: String(e) });
  }
});

// GET /api/games/:id -> CheapShark game details
router.get('/:id', async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    if (!id) return res.status(400).json({ error: 'Missing id' });

    const url = `${FREETOGAME_BASE}/game?id=${encodeURIComponent(id)}`;
    const cacheKey = `games:detail:${url}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json({ ok: true, game: cached });

    const headers = { Accept: 'application/json', 'User-Agent': 'sugoiapp-games/1.0' };
    const r = await fetchWithRetry(url, { headers }, 3, 1000);
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      console.error('FreeToGame detail error', r.status, text);
      const expiredCache = cache.get(cacheKey);
      if (expiredCache) {
        console.log('Returning expired cache due to API error');
        return res.json({ ok: true, game: expiredCache.data, cached: true });
      }
      return res.status(502).json({ ok: false, error: 'FreeToGame API temporalmente no disponible', status: r.status });
    }

    const j = await r.json();

    const mapped = {
      id: j?.id ?? id,
      title: j?.title ?? 'Untitled',
      image: j?.thumbnail ?? null,
      image_url: j?.thumbnail ?? null,
      description: j?.description ?? j?.short_description ?? null,
      studio: j?.publisher ?? j?.developer ?? undefined,
      developers: j?.developer ? [{ name: j.developer }] : [],
      platforms: j?.platform ? j.platform.split(',').map(p => ({ platform: { name: p.trim() } })) : [],
      genre: j?.genre ?? undefined,
      genres: j?.genre ? [{ name: j.genre }] : [],
      released: j?.release_date ?? undefined,
      rating: undefined,
      raw: j
    };

    setCache(cacheKey, mapped, 300);
    return res.json({ ok: true, game: mapped });
  } catch (e) {
    console.error('Error in /api/games/:id', e);
    return res.status(500).json({ error: String(e) });
  }
});

module.exports = router;
