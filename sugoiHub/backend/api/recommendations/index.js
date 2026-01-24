const express = require('express');
const router = express.Router();
const { pool } = require('../../db');
const authMiddleware = require('../../middleware/auth');

// GET /api/recommendations -> obtener recomendaciones aleatorias de anime, manga, music
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 15));

    // Obtener IDs de favoritos del usuario
    const { rows: favoriteIds } = await pool.query(
      `SELECT DISTINCT external_id FROM public.library_items 
       WHERE user_id = $1 AND list_key = 'favorites'`,
      [userId]
    );
    
    const userFavorites = favoriteIds.map(r => r.external_id);

    // Obtener recomendaciones aleatorias de anime, manga, music
    // que no estén en las listas del usuario
    const { rows: recommendations } = await pool.query(
      `SELECT 
         external_id as id,
         title,
         image_url,
         media_type as type,
         meta
       FROM public.library_items 
       WHERE media_type IN ('anime', 'manga', 'music')
       AND external_id NOT IN (
         SELECT external_id FROM public.library_items WHERE user_id = $1
       )
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
