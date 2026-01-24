const express = require('express');
const router = express.Router();
const { pool } = require('../../db');
const authMiddleware = require('../../middleware/auth');

// GET /api/recommendations -> obtener recomendaciones aleatorias de anime, manga, music
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 15));

    // Obtener IDs que el usuario ya tiene en su biblioteca
    const { rows: userLibrary } = await pool.query(
      `SELECT DISTINCT external_id FROM public.library_items WHERE user_id = $1`,
      [userId]
    );
    
    const userItemIds = userLibrary.map(row => row.external_id);

    // Obtener recomendaciones aleatorias de anime, manga, music
    // que no estén en las listas del usuario
    const { rows: recommendations } = await pool.query(
      `SELECT DISTINCT
         li.external_id as id,
         li.title,
         li.image_url,
         li.media_type as type,
         li.meta
       FROM public.library_items li
       WHERE li.media_type IN ('anime', 'manga', 'music')
       AND li.external_id NOT IN (${userItemIds.map((_, i) => `$${i + 2}`).join(',') || "''"})
       ORDER BY RANDOM()
       LIMIT $1`,
      [limit, ...userItemIds]
    );

    return res.json({ ok: true, recommendations });
  } catch (err) {
    console.error('Recommendations GET error:', err);
    return res.status(500).json({ ok: false, error: 'Error obteniendo recomendaciones' });
  }
});

module.exports = router;
