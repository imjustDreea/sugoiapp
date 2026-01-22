const express = require('express');
const router = express.Router();
const { pool } = require('../../db');
const authMiddleware = require('../../middleware/auth');

// GET /api/media/:type/:id -> Obtener detalles de un elemento con stats
router.get('/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const userId = req.query.user_id;

    // Contar likes
    const likesResult = await pool.query(
      'SELECT COUNT(*) FROM public.media_likes WHERE media_type = $1 AND media_id = $2',
      [type, id]
    );

    // Verificar si el usuario le dio like
    let userLiked = false;
    if (userId) {
      const likeCheck = await pool.query(
        'SELECT 1 FROM public.media_likes WHERE user_id = $1 AND media_type = $2 AND media_id = $3',
        [userId, type, id]
      );
      userLiked = likeCheck.rows.length > 0;
    }

    // Contar comentarios
    const commentsResult = await pool.query(
      'SELECT COUNT(*) FROM public.media_comments WHERE media_type = $1 AND media_id = $2',
      [type, id]
    );

    return res.json({
      ok: true,
      stats: {
        likes_count: parseInt(likesResult.rows[0].count),
        comments_count: parseInt(commentsResult.rows[0].count),
        user_has_liked: userLiked
      }
    });
  } catch (err) {
    console.error('Media stats error:', err);
    return res.status(500).json({ ok: false, error: 'Error obteniendo estadísticas' });
  }
});

// GET /api/media/:type/:id/comments -> Obtener comentarios de un elemento
router.get('/:type/:id/comments', async (req, res) => {
  try {
    const { type, id } = req.params;

    const { rows } = await pool.query(
      `SELECT 
        mc.id, mc.user_id, mc.content, mc.created_at,
        u.username, u.name, p.avatar_url
       FROM public.media_comments mc
       JOIN public.users u ON mc.user_id = u.id
       LEFT JOIN public.profile p ON u.id = p.user_id
       WHERE mc.media_type = $1 AND mc.media_id = $2
       ORDER BY mc.created_at DESC`,
      [type, id]
    );

    return res.json({ ok: true, comments: rows });
  } catch (err) {
    console.error('Media comments GET error:', err);
    return res.status(500).json({ ok: false, error: 'Error obteniendo comentarios' });
  }
});

// POST /api/media/:type/:id/comments -> Crear comentario
router.post('/:type/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { type, id } = req.params;
    const userId = req.user.id;
    const content = req.body.content?.trim();

    if (!content) {
      return res.status(400).json({ ok: false, error: 'El comentario no puede estar vacío' });
    }

    const { rows } = await pool.query(
      `INSERT INTO public.media_comments (user_id, media_type, media_id, content)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, media_type, media_id, content, created_at`,
      [userId, type, id, content]
    );

    // Obtener datos del usuario para la respuesta
    const userResult = await pool.query(
      `SELECT u.username, u.name, p.avatar_url
       FROM public.users u
       LEFT JOIN public.profile p ON u.id = p.user_id
       WHERE u.id = $1`,
      [userId]
    );

    const comment = {
      ...rows[0],
      username: userResult.rows[0].username,
      name: userResult.rows[0].name,
      avatar_url: userResult.rows[0].avatar_url
    };

    return res.json({ ok: true, comment });
  } catch (err) {
    console.error('Media comment CREATE error:', err);
    return res.status(500).json({ ok: false, error: 'Error creando comentario' });
  }
});

// POST /api/media/:type/:id/like -> Dar like
router.post('/:type/:id/like', authMiddleware, async (req, res) => {
  try {
    const { type, id } = req.params;
    const userId = req.user.id;

    await pool.query(
      `INSERT INTO public.media_likes (user_id, media_type, media_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, media_type, media_id) DO NOTHING`,
      [userId, type, id]
    );

    return res.json({ ok: true });
  } catch (err) {
    console.error('Media like error:', err);
    return res.status(500).json({ ok: false, error: 'Error dando like' });
  }
});

// GET /api/media/:type/:id/likes -> Obtener likes y estado del usuario
router.get('/:type/:id/likes', authMiddleware, async (req, res) => {
  try {
    const { type, id } = req.params;
    const userId = req.user?.id;

    // Contar likes
    const likesResult = await pool.query(
      'SELECT COUNT(*)::int as likes FROM public.media_likes WHERE media_type = $1 AND media_id = $2',
      [type, id]
    );

    // Verificar si el usuario le dio like
    let liked = false;
    if (userId) {
      const likeCheck = await pool.query(
        'SELECT 1 FROM public.media_likes WHERE user_id = $1 AND media_type = $2 AND media_id = $3',
        [userId, type, id]
      );
      liked = likeCheck.rows.length > 0;
    }

    return res.json({
      likes: parseInt(likesResult.rows[0]?.likes || 0) || 0,
      liked
    });
  } catch (err) {
    console.error('Media likes GET error:', err);
    return res.status(500).json({ error: 'Error obteniendo likes' });
  }
});

// POST /api/media/:type/:id/likes -> Toggle like
router.post('/:type/:id/likes', authMiddleware, async (req, res) => {
  try {
    const { type, id } = req.params;
    const userId = req.user.id;

    // Verificar si ya existe el like
    const checkLike = await pool.query(
      'SELECT 1 FROM public.media_likes WHERE user_id = $1 AND media_type = $2 AND media_id = $3',
      [userId, type, id]
    );

    if (checkLike.rows.length > 0) {
      // Si existe, eliminarlo
      await pool.query(
        'DELETE FROM public.media_likes WHERE user_id = $1 AND media_type = $2 AND media_id = $3',
        [userId, type, id]
      );
    } else {
      // Si no existe, agregarlo
      await pool.query(
        `INSERT INTO public.media_likes (user_id, media_type, media_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, media_type, media_id) DO NOTHING`,
        [userId, type, id]
      );
    }

    // Retornar estado actualizado
    const likesResult = await pool.query(
      'SELECT COUNT(*)::int as likes FROM public.media_likes WHERE media_type = $1 AND media_id = $2',
      [type, id]
    );

    return res.json({
      likes: parseInt(likesResult.rows[0]?.likes || 0) || 0,
      liked: checkLike.rows.length === 0 // Si no existía, ahora está liked
    });
  } catch (err) {
    console.error('Media likes POST error:', err);
    return res.status(500).json({ error: 'Error actualizando likes' });
  }
});

// DELETE /api/media/:type/:id/like -> Quitar like
router.delete('/:type/:id/like', authMiddleware, async (req, res) => {
  try {
    const { type, id } = req.params;
    const userId = req.user.id;

    await pool.query(
      'DELETE FROM public.media_likes WHERE user_id = $1 AND media_type = $2 AND media_id = $3',
      [userId, type, id]
    );

    return res.json({ ok: true });
  } catch (err) {
    console.error('Media unlike error:', err);
    return res.status(500).json({ ok: false, error: 'Error quitando like' });
  }
});

module.exports = router;
