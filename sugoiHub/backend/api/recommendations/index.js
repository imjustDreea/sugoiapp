const express = require('express');
const router = express.Router();
const { pool } = require('../../db');
const authMiddleware = require('../../middleware/auth');

// GET /api/recommendations -> obtener recomendaciones aleatorias de anime, manga, music
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 15));

    // Obtener recomendaciones aleatorias de anime, manga, music
    // que no estén en las listas del usuario
    const { rows: recommendations } = await pool.query(
      `SELECT DISTINCT
         li.external_id as id,
         li.title,
         li.image_url,
         li.media_type as type,
         li.meta,
         CASE WHEN ul.external_id IS NOT NULL THEN true ELSE false END as in_library
       FROM public.library_items li
       LEFT JOIN (
         SELECT external_id FROM public.library_items 
         WHERE user_id = $1
       ) ul ON ul.external_id = li.external_id
       WHERE li.media_type IN ('anime', 'manga', 'music')
       AND ul.external_id IS NULL
       ORDER BY RANDOM()
       LIMIT $2`,
      [userId, limit]
    );

    return res.json({ ok: true, recommendations });
  } catch (err) {
    console.error('Recommendations GET error:', err);
    return res.status(500).json({ ok: false, error: 'Error obteniendo recomendaciones' });
  }
});

module.exports = router;
