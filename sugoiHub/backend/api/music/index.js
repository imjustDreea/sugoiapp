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

    // Si no hay query, usamos términos populares
    const term = q || 'top songs';

    const params = new URLSearchParams();
    params.set('term', term);
    params.set('media', 'music');
    params.set('entity', 'song'); // Cambiar a song en vez de album
    params.set('limit', String(limit));

    const url = `${ITUNES_BASE}/search?${params.toString()}`;
    const cacheKey = `itunes:album:${url}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json({ ok: true, results: cached });

    const headers = { Accept: 'application/json', 'User-Agent': 'sugoiapp-music/1.0' };
    const r = await fetchWithRetry(url, { headers }, 3, 1000);
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      console.error('iTunes search error', r.status, text);
      const expiredCache = cache.get(cacheKey);
      if (expiredCache) {
        console.log('Returning expired cache due to API error');
        return res.json({ ok: true, results: expiredCache.data, cached: true });
      }
      return res.json({ ok: true, results: [] });
    }

    const j = await r.json().catch(() => null);
    const items = Array.isArray(j?.results) ? j.results : [];

    const results = items.map((it) => {
      const artwork = it.artworkUrl100 || it.artworkUrl60 || it.artworkUrl30 || null;
      return {
        id: it.trackId || it.collectionId || `${it.trackName}-${it.artistName}`,
        title: it.trackName || it.collectionName || 'Untitled',
        artist: it.artistName || undefined,
        artists: it.artistName ? [{ name: it.artistName }] : [],
        album: it.collectionName || undefined,
        year: it.releaseDate ? Number(String(it.releaseDate).slice(0, 4)) : undefined,
        duration: it.trackTimeMillis ? Math.floor(it.trackTimeMillis / 1000) : undefined,
        image: artwork,
        image_url: artwork,
        description: it.collectionName ? `${it.trackName} - ${it.collectionName}` : it.trackName,
        genres: it.primaryGenreName ? [it.primaryGenreName] : [],
        raw: it
      };
    });

    setCache(cacheKey, results, 120);
    return res.json({ ok: true, results });
  } catch (e) {
    console.error('Error in /api/music/search', e);
    return res.status(500).json({ ok: false, error: String(e) });
  }
});

// GET /api/music/:id -> detalle de álbum
router.get('/:id', async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    if (!id) return res.status(400).json({ ok: false, error: 'Missing id' });

    // Intentar buscar el álbum por ID en iTunes
    const url = `${ITUNES_BASE}/lookup?id=${encodeURIComponent(id)}`;
    const cacheKey = `itunes:detail:${id}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json({ ok: true, album: cached });

    const headers = { Accept: 'application/json', 'User-Agent': 'sugoiapp-music/1.0' };
    const r = await fetchWithRetry(url, { headers }, 3, 1000);
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      console.error('iTunes detail error', r.status, text);
      const expiredCache = cache.get(cacheKey);
      if (expiredCache) {
        console.log('Returning expired cache due to API error');
        return res.json({ ok: true, album: expiredCache.data, cached: true });
      }
      return res.status(502).json({ ok: false, error: 'iTunes API temporalmente no disponible', status: r.status });
    }

    const j = await r.json().catch(() => null);
    const items = Array.isArray(j?.results) ? j.results : [];
    
    if (items.length === 0) {
      return res.status(404).json({ ok: false, error: 'Album not found' });
    }

    const it = items[0];
    const artwork = it.artworkUrl100 || it.artworkUrl60 || it.artworkUrl30 || null;
    
    const mapped = {
      id: it.trackId || it.collectionId || id,
      title: it.trackName || it.collectionName || 'Untitled',
      artist: it.artistName || undefined,
      artists: it.artistName ? [{ name: it.artistName }] : [],
      album: it.collectionName || undefined,
      year: it.releaseDate ? Number(String(it.releaseDate).slice(0, 4)) : undefined,
      duration: it.trackTimeMillis ? Math.floor(it.trackTimeMillis / 1000) : undefined,
      image: artwork,
      image_url: artwork,
      images: artwork ? { jpg: { large_image_url: artwork, image_url: artwork } } : null,
      description: it.collectionName ? `${it.trackName} - ${it.collectionName}` : it.trackName,
      synopsis: it.longDescription || it.trackCensoredName || null,
      genres: it.primaryGenreName ? [it.primaryGenreName] : [],
      rating: undefined,
      raw: it
    };

    setCache(cacheKey, mapped, 300);
    return res.json({ ok: true, album: mapped });
  } catch (e) {
    console.error('Error in /api/music/:id', e);
    return res.status(500).json({ ok: false, error: String(e) });
  }
});

module.exports = router;
