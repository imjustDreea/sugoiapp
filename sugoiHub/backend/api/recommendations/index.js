const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth');
const https = require('https');

// Helper simple para hacer requests HTTPS
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// GET /api/recommendations -> random items de anime, manga
router.get('/', authMiddleware, async (req, res) => {
  try {
    const recommendations = [];

    // Obtener anime random
    try {
      const data = await httpsGet('https://api.jikan.moe/v4/top/anime?limit=25&page=1');
      const items = data.data || [];
      const random = items[Math.floor(Math.random() * items.length)];
      if (random) {
        recommendations.push({
          id: String(random.mal_id),
          title: random.title,
          image_url: random.images?.jpg?.image_url || null,
          type: 'anime'
        });
      }
    } catch (e) {
      console.log('Anime error:', e.message);
    }

    // Obtener manga random
    try {
      const data = await httpsGet('https://api.jikan.moe/v4/top/manga?limit=25&page=1');
      const items = data.data || [];
      const random = items[Math.floor(Math.random() * items.length)];
      if (random) {
        recommendations.push({
          id: String(random.mal_id),
          title: random.title,
          image_url: random.images?.jpg?.image_url || null,
          type: 'manga'
        });
      }
    } catch (e) {
      console.log('Manga error:', e.message);
    }

    // Obtener anime para OST
    try {
      const data = await httpsGet('https://api.jikan.moe/v4/top/anime?limit=25&page=2');
      const items = data.data || [];
      const random = items[Math.floor(Math.random() * items.length)];
      if (random) {
        recommendations.push({
          id: `ost_${random.mal_id}`,
          title: `${random.title} OST`,
          image_url: random.images?.jpg?.image_url || null,
          type: 'music'
        });
      }
    } catch (e) {
      console.log('Music error:', e.message);
    }

    res.json({ ok: true, recommendations });
  } catch (err) {
    console.error('Recommendations error:', err);
    res.status(500).json({ ok: false, error: 'Error obteniendo recomendaciones' });
  }
});

module.exports = router;
