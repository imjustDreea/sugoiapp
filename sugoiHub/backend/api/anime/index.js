const express = require('express');
const router = express.Router();

// Simple in-memory cache to reduce requests to Jikan (ttlSeconds)
const cache = new Map(); // key -> { expires: number, data: any }
const DEFAULT_TTL = 60; // seconds

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
    const r = await fetchWithRetry(url, { headers, timeout: 10000 }, 2, 400);
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      console.error('Jikan search error', r.status, text);
      return res.status(502).json({ error: 'Jikan API error', status: r.status });
    }

    const j = await r.json();
    const data = (j.data || []).map((it) => ({
      id: it.mal_id,
      title: it.title,
      image: it.images?.jpg?.image_url || null,
      raw_images: it.images || null,
      genres: (it.genres || []).map((g) => g.name),
      score: it.score || null,
      synopsis: it.synopsis || null,
    }));

    let results = data;
    if (genreFilter) {
      const gf = String(genreFilter).toLowerCase();
      results = data.filter((a) => (a.genres || []).some((g) => String(g).toLowerCase().includes(gf)));
    }

    // cache results (short TTL to reduce rate pressure)
    setCache(cacheKey, results, 60);

    return res.json({ results });
  } catch (e) {
    console.error('Error in /api/anime/search', e);
    return res.status(500).json({ error: String(e) });
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
    if (cached) return res.json({ result: cached });

    console.log('Proxying Jikan detail request to:', url);
    const headers = { Accept: 'application/json', 'User-Agent': 'sugoiapp/1.0 (+https://example.com)' };
    const r = await fetchWithRetry(url, { headers, timeout: 10000 }, 2, 400);
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      console.error('Jikan anime detail error', r.status, text);
      return res.status(502).json({ error: 'Jikan API error', status: r.status });
    }

  const j = await r.json();
    const it = j.data;
    if (!it) return res.status(404).json({ error: 'Not found' });

    const mapped = {
      id: it.mal_id,
      title: it.title,
      image: it.images?.jpg?.image_url || null,
      raw_images: it.images || null,
      genres: (it.genres || []).map((g) => g.name),
      score: it.score || null,
      episodes: it.episodes || null,
      status: it.status || null,
      synopsis: it.synopsis || null,
    };

    setCache(cacheKey, mapped, 300);
    return res.json({ result: mapped });
  } catch (e) {
    console.error('Error in /api/anime/:id', e);
    return res.status(500).json({ error: String(e) });
  }
});

module.exports = router;
