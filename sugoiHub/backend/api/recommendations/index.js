const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth');

// GET /api/recommendations -> recomendaciones aleatorias simples
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Items de ejemplo para devolver
    const recommendations = [
      {
        id: '1',
        title: 'Demon Slayer',
        image_url: 'https://api.jikan.moe/images/anime/32/170282.jpg',
        type: 'anime'
      },
      {
        id: '2',
        title: 'Attack on Titan',
        image_url: 'https://api.jikan.moe/images/anime/40/335120.jpg',
        type: 'anime'
      },
      {
        id: '3',
        title: 'My Hero Academia',
        image_url: 'https://api.jikan.moe/images/anime/36/325250.jpg',
        type: 'anime'
      },
      {
        id: '4',
        title: 'One Piece',
        image_url: 'https://api.jikan.moe/images/manga/37/1/64609.jpg',
        type: 'manga'
      },
      {
        id: '5',
        title: 'Bleach',
        image_url: 'https://api.jikan.moe/images/manga/18/46/35976.jpg',
        type: 'manga'
      },
      {
        id: '6',
        title: 'Demon Slayer OST',
        image_url: 'https://api.jikan.moe/images/anime/32/170282.jpg',
        type: 'music'
      }
    ];

    // Retornar items random
    const shuffled = recommendations.sort(() => Math.random() - 0.5);
    res.json({ ok: true, recommendations: shuffled.slice(0, 6) });
  } catch (err) {
    console.error('Error:', err);
    res.json({ ok: true, recommendations: [] });
  }
});

module.exports = router;
