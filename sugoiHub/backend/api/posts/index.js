const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { pool } = require('../../db');
const authMiddleware = require('../../middleware/auth');

const router = express.Router();

function ensureDirSync(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function publicUrlFromFile(filePathOnDisk) {
  const uploadsRoot = path.join(__dirname, '..', '..', 'uploads');
  const rel = path.relative(uploadsRoot, filePathOnDisk).split(path.sep).join('/');
  return `/uploads/${rel}`;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.user?.id;
    const dir = path.join(__dirname, '..', '..', 'uploads', 'posts', String(userId));
    ensureDirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').slice(0, 10) || '.png';
    const safeExt = ext.startsWith('.') ? ext : `.${ext}`;
    cb(null, `post-${Date.now()}${safeExt}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// GET /api/posts -> obtener posts recientes
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = Math.max(0, parseInt(req.query.offset) || 0);
    
    // Obtener userId del token si existe
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    let userId = null;
    
    if (token) {
      try {
        const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        userId = decoded.id;
      } catch (e) {
        // Token inválido, continuamos sin usuario
      }
    }

    const { rows } = await pool.query(
      `SELECT 
         p.id, p.user_id, p.content, p.image_url, p.created_at,
         p.favorite_type, p.favorite_id, p.favorite_title, p.favorite_image,
         u.username, u.name,
         pr.avatar_url,
         (SELECT COUNT(*) FROM public.post_likes WHERE post_id = p.id) as likes_count,
         (SELECT COUNT(*) FROM public.post_comments WHERE post_id = p.id) as comments_count,
         ${userId ? `(SELECT COUNT(*) FROM public.post_likes WHERE post_id = p.id AND user_id = $3) > 0 as user_has_liked` : `false as user_has_liked`}
       FROM public.posts p
       JOIN public.users u ON u.id = p.user_id
       LEFT JOIN public.profile pr ON pr.user_id = p.user_id
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      userId ? [limit, offset, userId] : [limit, offset]
    );

    // Convertir likes_count y comments_count a números
    const postsWithNumbers = rows.map(row => ({
      ...row,
      likes_count: parseInt(row.likes_count) || 0,
      comments_count: parseInt(row.comments_count) || 0
    }));

    return res.json({ ok: true, posts: postsWithNumbers });
  } catch (err) {
    console.error('Posts GET error:', err);
    return res.status(500).json({ ok: false, error: 'Error obteniendo posts' });
  }
});

// POST /api/posts -> crear un post
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';
    const imageUrl = typeof req.body.image_url === 'string' ? req.body.image_url.trim() : null;
    const favoriteType = typeof req.body.favorite_type === 'string' ? req.body.favorite_type : null;
    const favoriteId = typeof req.body.favorite_id === 'string' ? req.body.favorite_id : null;
    const favoriteTitle = typeof req.body.favorite_title === 'string' ? req.body.favorite_title : null;
    const favoriteImage = typeof req.body.favorite_image === 'string' ? req.body.favorite_image : null;

    if (!content && !imageUrl && !favoriteId) {
      return res.status(400).json({ ok: false, error: 'El post debe tener contenido, imagen o favorito' });
    }

    if (content && content.length > 500) {
      return res.status(400).json({ ok: false, error: 'El contenido no puede superar 500 caracteres' });
    }

    const { rows } = await pool.query(
      `INSERT INTO public.posts (user_id, content, image_url, favorite_type, favorite_id, favorite_title, favorite_image)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, user_id, content, image_url, favorite_type, favorite_id, favorite_title, favorite_image, created_at`,
      [userId, content || null, imageUrl, favoriteType, favoriteId, favoriteTitle, favoriteImage]
    );

    return res.json({ ok: true, post: rows[0] });
  } catch (err) {
    console.error('Post CREATE error:', err);
    return res.status(500).json({ ok: false, error: 'Error creando post' });
  }
});

// POST /api/posts/upload -> subir imagen
router.post('/upload', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, error: 'Archivo requerido' });
    const url = publicUrlFromFile(req.file.path);
    return res.json({ ok: true, image_url: url });
  } catch (err) {
    console.error('Post image upload error:', err);
    return res.status(500).json({ ok: false, error: 'Error subiendo imagen' });
  }
});

// DELETE /api/posts/:postId -> eliminar un post
router.delete('/:postId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = parseInt(req.params.postId);

    const { rows } = await pool.query(
      'DELETE FROM public.posts WHERE id=$1 AND user_id=$2 RETURNING id',
      [postId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Post no encontrado o no tienes permiso' });
    }

    return res.json({ ok: true, message: 'Post eliminado' });
  } catch (err) {
    console.error('Post DELETE error:', err);
    return res.status(500).json({ ok: false, error: 'Error eliminando post' });
  }
});

// POST /api/posts/:postId/like -> dar like a un post
router.post('/:postId/like', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = parseInt(req.params.postId);

    await pool.query(
      `INSERT INTO public.post_likes (user_id, post_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, post_id) DO NOTHING`,
      [userId, postId]
    );

    return res.json({ ok: true, message: 'Like añadido' });
  } catch (err) {
    console.error('Post LIKE error:', err);
    return res.status(500).json({ ok: false, error: 'Error dando like' });
  }
});

// DELETE /api/posts/:postId/like -> quitar like
router.delete('/:postId/like', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = parseInt(req.params.postId);

    await pool.query(
      'DELETE FROM public.post_likes WHERE user_id=$1 AND post_id=$2',
      [userId, postId]
    );

    return res.json({ ok: true, message: 'Like eliminado' });
  } catch (err) {
    console.error('Post UNLIKE error:', err);
    return res.status(500).json({ ok: false, error: 'Error quitando like' });
  }
});

// GET /api/posts/:postId/comments -> obtener comentarios de un post
router.get('/:postId/comments', async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));

    const { rows } = await pool.query(
      `SELECT 
         c.id, c.user_id, c.post_id, c.content, c.created_at,
         u.username, u.name,
         pr.avatar_url
       FROM public.post_comments c
       JOIN public.users u ON u.id = c.user_id
       LEFT JOIN public.profile pr ON pr.user_id = c.user_id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC
       LIMIT $2`,
      [postId, limit]
    );

    return res.json({ ok: true, comments: rows });
  } catch (err) {
    console.error('Comments GET error:', err);
    return res.status(500).json({ ok: false, error: 'Error obteniendo comentarios' });
  }
});

// POST /api/posts/:postId/comments -> añadir comentario
router.post('/:postId/comments', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = parseInt(req.params.postId);
    const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';

    if (!content) {
      return res.status(400).json({ ok: false, error: 'El comentario no puede estar vacío' });
    }

    if (content.length > 1000) {
      return res.status(400).json({ ok: false, error: 'El comentario es demasiado largo' });
    }

    const { rows } = await pool.query(
      `INSERT INTO public.post_comments (user_id, post_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, post_id, content, created_at`,
      [userId, postId, content]
    );

    return res.json({ ok: true, comment: rows[0] });
  } catch (err) {
    console.error('Comment CREATE error:', err);
    return res.status(500).json({ ok: false, error: 'Error creando comentario' });
  }
});

// GET /api/posts/feed -> posts del timeline (gente que sigo)
router.get('/feed', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = Math.max(0, parseInt(req.query.offset) || 0);

    const { rows } = await pool.query(
      `SELECT 
         p.id, p.user_id, p.content, p.image_url, p.created_at,
         p.favorite_type, p.favorite_id, p.favorite_title, p.favorite_image,
         u.username, u.name,
         pr.avatar_url,
         (SELECT COUNT(*) FROM public.post_likes WHERE post_id = p.id) as likes_count,
         (SELECT COUNT(*) FROM public.post_comments WHERE post_id = p.id) as comments_count,
         (SELECT COUNT(*) FROM public.post_likes WHERE post_id = p.id AND user_id = $3) > 0 as user_has_liked
       FROM public.posts p
       JOIN public.users u ON u.id = p.user_id
       LEFT JOIN public.profile pr ON pr.user_id = p.user_id
       WHERE p.user_id IN (
         SELECT followed_id FROM public.followers WHERE follower_id = $3
       )
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset, userId]
    );

    // Convertir likes_count y comments_count a números
    const postsWithNumbers = rows.map(row => ({
      ...row,
      likes_count: parseInt(row.likes_count) || 0,
      comments_count: parseInt(row.comments_count) || 0
    }));

    return res.json({ ok: true, posts: postsWithNumbers });
  } catch (err) {
    console.error('Posts FEED error:', err);
    return res.status(500).json({ ok: false, error: 'Error obteniendo feed' });
  }
});

module.exports = router;
