const express = require('express');
const router = express.Router();

// API pública sin key: iTunes Search
// Docs: https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/
const ITUNES_BASE = 'https://itunes.apple.com';

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
        await sleep(backoffMs * Math.pow(2, attempt - 1));
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

// GET /api/music/search?q=...&limit=...
router.get('/search', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    const limit = Math.max(1, Math.min(60, Number(req.query.limit) || 24));

    // Si no hay query, usamos un término por defecto que trae OST/chiptune retro.
    const term = q || 'chiptune soundtrack';

    const params = new URLSearchParams();
    params.set('term', term);
    params.set('media', 'music');
    params.set('entity', 'album');
    params.set('limit', String(limit));

    const url = `${ITUNES_BASE}/search?${params.toString()}`;
    const cacheKey = `itunes:album:${url}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json({ results: cached });

    const headers = { Accept: 'application/json', 'User-Agent': 'sugoiapp-music/1.0' };
    const r = await fetchWithRetry(url, { headers }, 2, 400);
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      console.error('iTunes search error', r.status, text);
      return res.status(502).json({ error: 'iTunes API error', status: r.status });
    }

    const j = await r.json().catch(() => null);
    const items = Array.isArray(j?.results) ? j.results : [];

    const results = items.map((it) => {
      const artwork = it.artworkUrl100 || it.artworkUrl60 || it.artworkUrl30 || null;
      return {
        id: it.collectionId || it.collectionViewUrl || `${it.collectionName}-${it.artistName}`,
        title: it.collectionName || it.trackName || 'Untitled',
        artist: it.artistName || undefined,
        year: it.releaseDate ? Number(String(it.releaseDate).slice(0, 4)) : undefined,
        tracks: it.trackCount || undefined,
        image: artwork,
        genres: it.primaryGenreName ? [it.primaryGenreName] : [],
        raw: it
      };
    });

    setCache(cacheKey, results, 120);
    return res.json({ results });
  } catch (e) {
    console.error('Error in /api/music/search', e);
    return res.status(500).json({ error: String(e) });
  }
});

module.exports = router;
