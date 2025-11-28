const express = require('express');
const router = express.Router();

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
  const _fetch = (typeof fetch !== 'undefined') ? fetch : (await import('node-fetch')).default;

  // Log the proxied URL for debugging
  console.log('Proxying Jikan request to:', url);

  // Add a User-Agent header and Accept for better compatibility with some APIs
  const r = await _fetch(url, { headers: { 'Accept': 'application/json', 'User-Agent': 'sugoiapp/1.0 (+https://example.com)' }, timeout: 10000 });
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
    const _fetch = (typeof fetch !== 'undefined') ? fetch : (await import('node-fetch')).default;

    const r = await _fetch(url, { headers: { 'Accept': 'application/json' } });
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

    return res.json({ result: mapped });
  } catch (e) {
    console.error('Error in /api/anime/:id', e);
    return res.status(500).json({ error: String(e) });
  }
});

module.exports = router;
