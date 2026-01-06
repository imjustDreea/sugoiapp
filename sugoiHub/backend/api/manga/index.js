const express = require('express');
const router = express.Router();

// Simple in-memory cache reused pattern like anime
const cache = new Map();
const DEFAULT_TTL = 60; // seconds
function setCache(key, data, ttl = DEFAULT_TTL) { cache.set(key, { expires: Date.now() + ttl * 1000, data }); }
function getCache(key) { const v = cache.get(key); if (!v) return null; if (Date.now() > v.expires) { cache.delete(key); return null; } return v.data; }
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
async function fetchWithRetry(url, options = {}, retries = 2, backoffMs = 500) {
  let attempt = 0;
  while (true) {
    try {
      const r = await (typeof fetch !== 'undefined' ? fetch(url, options) : (await import('node-fetch')).default(url, options));
      return r;
    } catch (e) {
      attempt++;
      if (attempt > retries) throw e;
      await sleep(backoffMs * Math.pow(2, attempt - 1));
    }
  }
}

// Base URL de la API de MangaHook
// Usamos Jikan (MyAnimeList) para manga, igual que anime.
// Docs: https://docs.api.jikan.moe/
const JIKAN_BASE = 'https://api.jikan.moe/v4';

// Search endpoint
router.get('/search', async (req, res) => {
  try {
    const q = req.query.q || '';
    // Jikan limita el parámetro `limit` (máx. 25). Si enviamos más, puede devolver 4xx.
    const requestedLimit = Number(req.query.limit);
    const limit = Math.max(1, Math.min(25, Number.isFinite(requestedLimit) ? requestedLimit : 20));
    const genreFilter = req.query.genre || req.query.category || null;

    const params = new URLSearchParams();
    if (q) params.set('q', q);
    params.set('limit', String(limit));

    const url = `${JIKAN_BASE}/manga?${params.toString()}`;
    // El filtro de género se aplica después del mapeo; debe formar parte de la clave
    // para que una petición sin filtro no "pise" a una con filtro.
    const cacheKey = `manga:search:${url}:genre=${genreFilter ? String(genreFilter).toLowerCase() : ''}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json({ results: cached });

    console.log('Proxying Jikan manga search to:', url);
    const headers = { Accept: 'application/json', 'User-Agent': 'sugoiapp-manga/1.0' };
    const r = await fetchWithRetry(url, { headers, timeout: 10000 }, 2, 400);
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      console.error('Jikan manga search error', r.status, text);
      return res.status(502).json({ error: 'Jikan API error', status: r.status });
    }

    const contentType = (r.headers && typeof r.headers.get === 'function') ? (r.headers.get('content-type') || '') : '';
    if (!contentType.toLowerCase().includes('application/json')) {
      const text = await r.text().catch(() => '');
      console.error('Jikan manga search returned non-JSON:', contentType, 'url=', url);
      return res.status(502).json({
        error: 'Upstream returned non-JSON response',
        status: r.status,
        contentType,
        url,
        bodyPreview: String(text).slice(0, 200)
      });
    }

    const j = await r.json();
    const items = (j.data || []).map((it) => ({
      id: it.mal_id,
      title: it.title,
      image: it.images?.jpg?.image_url || null,
      raw_images: it.images || null,
      genres: (it.genres || []).map((g) => g.name),
      score: it.score || null,
      chapters: it.chapters || null,
      status: it.status || null,
      synopsis: it.synopsis || null,
      raw: it,
    }));

    let results = items;
    if (genreFilter) {
      const gf = String(genreFilter).toLowerCase();
      results = items.filter((m) => (m.genres || []).some((g) => String(g).toLowerCase().includes(gf)));
    }

    setCache(cacheKey, results, 60);
    return res.json({ results });
  } catch (e) {
    console.error('Error in /api/manga/search', e);
    return res.status(500).json({ error: String(e) });
  }
});

// Detail endpoint
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: 'Missing id' });

    const url = `${JIKAN_BASE}/manga/${encodeURIComponent(id)}`;
    const cacheKey = `manga:detail:${url}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json({ result: cached });

    console.log('Proxying Jikan manga detail to:', url);
    const headers = { Accept: 'application/json', 'User-Agent': 'sugoiapp-manga/1.0' };
    const r = await fetchWithRetry(url, { headers, timeout: 10000 }, 2, 400);
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      console.error('Jikan manga detail error', r.status, text);
      return res.status(502).json({ error: 'Jikan API error', status: r.status });
    }

    const contentType = (r.headers && typeof r.headers.get === 'function') ? (r.headers.get('content-type') || '') : '';
    if (!contentType.toLowerCase().includes('application/json')) {
      const text = await r.text().catch(() => '');
      console.error('Jikan manga detail returned non-JSON:', contentType, 'url=', url);
      return res.status(502).json({
        error: 'Upstream returned non-JSON response',
        status: r.status,
        contentType,
        url,
        bodyPreview: String(text).slice(0, 200)
      });
    }

    const j = await r.json();
    const it = j.data || null;
    if (!it) return res.status(404).json({ error: 'Not found' });

    const mapped = {
      id: it.mal_id,
      title: it.title,
      image: it.images?.jpg?.image_url || null,
      raw_images: it.images || null,
      genres: (it.genres || []).map((g) => g.name),
      score: it.score || null,
      chapters: it.chapters || null,
      status: it.status || null,
      synopsis: it.synopsis || null,
    };
    setCache(cacheKey, mapped, 300);
    return res.json({ result: mapped });
  } catch (e) {
    console.error('Error in /api/manga/:id', e);
    return res.status(500).json({ error: String(e) });
  }
});

module.exports = router;
