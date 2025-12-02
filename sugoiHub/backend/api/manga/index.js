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
const MANGA_BASE = process.env.MANGAHOOK_API_BASE || 'https://mangahook-api.vercel.app';

// Search endpoint
router.get('/search', async (req, res) => {
  try {
    const q = req.query.q || '';
    const limit = Number(req.query.limit) || 20;

    const params = new URLSearchParams();
    if (q) params.set('query', q);
    params.set('limit', String(limit));

    const url = `${MANGA_BASE}/search?${params.toString()}`;
    const cacheKey = `manga:search:${url}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json({ results: cached });

    console.log('Proxying MangaHook search to:', url);
    const headers = { Accept: 'application/json', 'User-Agent': 'sugoiapp-manga/1.0' };
    const r = await fetchWithRetry(url, { headers, timeout: 10000 }, 2, 400);
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      console.error('MangaHook search error', r.status, text);
      return res.status(502).json({ error: 'MangaHook API error', status: r.status });
    }

    const j = await r.json();
    // Try to map common fields; shape may vary depending on the API
    const items = (j.results || j.data || j || []).map((it) => ({
      id: it.id ?? it.mal_id ?? it._id ?? it.slug ?? null,
      title: it.title || it.name || it.attributes?.title || null,
      image: it.image || it.thumbnail || it.cover || (it.attributes && it.attributes.poster) || null,
      raw: it,
      score: it.score ?? null,
      synopsis: it.synopsis || it.description || null,
    }));

    setCache(cacheKey, items, 60);
    return res.json({ results: items });
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

    const url = `${MANGA_BASE}/manga/${encodeURIComponent(id)}`;
    const cacheKey = `manga:detail:${url}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json({ result: cached });

    console.log('Proxying MangaHook detail to:', url);
    const headers = { Accept: 'application/json', 'User-Agent': 'sugoiapp-manga/1.0' };
    const r = await fetchWithRetry(url, { headers, timeout: 10000 }, 2, 400);
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      console.error('MangaHook detail error', r.status, text);
      return res.status(502).json({ error: 'MangaHook API error', status: r.status });
    }

    const j = await r.json();
    const mapped = j.data || j || null;
    setCache(cacheKey, mapped, 300);
    return res.json({ result: mapped });
  } catch (e) {
    console.error('Error in /api/manga/:id', e);
    return res.status(500).json({ error: String(e) });
  }
});

module.exports = router;
