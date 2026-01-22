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
  // filePathOnDisk: .../backend/uploads/...
  const uploadsRoot = path.join(__dirname, '..', '..', 'uploads');
  const rel = path.relative(uploadsRoot, filePathOnDisk).split(path.sep).join('/');
  return `/uploads/${rel}`;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.user?.id;
    const dir = path.join(__dirname, '..', '..', 'uploads', 'profiles', String(userId));
    ensureDirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').slice(0, 10) || '.png';
    const safeExt = ext.startsWith('.') ? ext : `.${ext}`;
    const base = file.fieldname === 'banner' ? 'banner' : 'avatar';
    cb(null, `${base}-${Date.now()}${safeExt}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

async function ensureProfileRow(userId) {
  await pool.query(
    `INSERT INTO public.profile (user_id)
     VALUES ($1)
     ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  );
}

function sanitizeTheme(theme) {
  if (!theme || typeof theme !== 'object') return null;

  const pickHex = (v) => {
    if (typeof v !== 'string') return undefined;
    const s = v.trim();
    if (!/^#[0-9a-fA-F]{6}$/.test(s)) return undefined;
    return s;
  };

  const out = {
    colorBg: pickHex(theme.colorBg),
    accentViolet: pickHex(theme.accentViolet),
    accentLime: pickHex(theme.accentLime),
    colorGrid: pickHex(theme.colorGrid)
  };

  // Remove undefined keys
  Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
  return Object.keys(out).length ? out : null;
}

const ALLOWED_BADGES = new Set(['Retro Gamer', 'Otaku']);

function sanitizeBadges(input) {
  // undefined => no update; array => update (puede ser [] para limpiar)
  if (input === undefined) return undefined;
  if (!Array.isArray(input)) return undefined;

  const out = [];
  for (const raw of input) {
    if (typeof raw !== 'string') continue;
    const s = raw.trim();
    if (!s) continue;
    if (!ALLOWED_BADGES.has(s)) continue;
    if (!out.includes(s)) out.push(s);
  }

  return out.slice(0, 6);
}

// GET /api/profile/by-username/:username -> vista pública
router.get('/by-username/:username', async (req, res) => {
  try {
    const username = String(req.params.username || '').trim();
    if (!username) return res.status(400).json({ ok: false, error: 'Username requerido' });

    const { rows } = await pool.query(
      `SELECT 
         u.id, u.username, u.name, u.last_name,
         p.user_id, p.avatar_url, p.banner_url, p.bio, p.theme, p.badges
       FROM public.users u
       LEFT JOIN public.profile p ON p.user_id = u.id
       WHERE lower(u.username) = lower($1)
       LIMIT 1`,
      [username]
    );

    if (rows.length === 0) return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });

    const r = rows[0];
    return res.json({
      ok: true,
      user: { id: r.id, username: r.username, name: r.name, last_name: r.last_name },
      profile: r.user_id
        ? {
            user_id: r.user_id,
            avatar_url: r.avatar_url,
            banner_url: r.banner_url,
            bio: r.bio,
            theme: r.theme,
            badges: r.badges
          }
        : null
    });
  } catch (err) {
    console.error('Profile public GET error:', err);
    return res.status(500).json({ ok: false, error: 'Error obteniendo perfil público' });
  }
});

// GET /api/profile -> perfil del usuario autenticado
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    await ensureProfileRow(userId);

    const { rows } = await pool.query(
      'SELECT user_id, avatar_url, banner_url, bio, theme, badges FROM public.profile WHERE user_id=$1',
      [userId]
    );

    return res.json({ ok: true, profile: rows[0] || null });
  } catch (err) {
    console.error('Profile GET error:', err);
    return res.status(500).json({ ok: false, error: 'Error obteniendo perfil' });
  }
});

// PUT /api/profile -> actualizar bio/theme
router.put('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    await ensureProfileRow(userId);

    const bio = typeof req.body.bio === 'string' ? req.body.bio.slice(0, 800) : null;
    const theme = sanitizeTheme(req.body.theme);
    const badges = sanitizeBadges(req.body.badges);

    const badgesJson = badges === undefined ? null : JSON.stringify(badges);

    const { rows } = await pool.query(
      `UPDATE public.profile
       SET bio = COALESCE($2, bio),
           theme = COALESCE($3::jsonb, theme),
           badges = COALESCE($4::jsonb, badges),
           updated_at = NOW()
       WHERE user_id=$1
       RETURNING user_id, avatar_url, banner_url, bio, theme, badges`,
      [userId, bio, theme ? JSON.stringify(theme) : null, badgesJson]
    );

    return res.json({ ok: true, profile: rows[0] });
  } catch (err) {
    console.error('Profile PUT error:', err);
    return res.status(500).json({ ok: false, error: 'Error actualizando perfil' });
  }
});

// POST /api/profile/avatar (multipart form-data, field: avatar)
router.post('/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    const userId = req.user.id;
    await ensureProfileRow(userId);

    if (!req.file) return res.status(400).json({ ok: false, error: 'Archivo requerido' });
    const url = publicUrlFromFile(req.file.path);

    const { rows } = await pool.query(
      `UPDATE public.profile
       SET avatar_url=$2, updated_at=NOW()
       WHERE user_id=$1
       RETURNING user_id, avatar_url, banner_url, bio, theme, badges`,
      [userId, url]
    );

    return res.json({ ok: true, profile: rows[0] });
  } catch (err) {
    console.error('Profile avatar upload error:', err);
    return res.status(500).json({ ok: false, error: 'Error subiendo avatar' });
  }
});

// POST /api/profile/banner (multipart form-data, field: banner)
router.post('/banner', authMiddleware, upload.single('banner'), async (req, res) => {
  try {
    const userId = req.user.id;
    await ensureProfileRow(userId);

    if (!req.file) return res.status(400).json({ ok: false, error: 'Archivo requerido' });
    const url = publicUrlFromFile(req.file.path);

    const { rows } = await pool.query(
      `UPDATE public.profile
       SET banner_url=$2, updated_at=NOW()
       WHERE user_id=$1
       RETURNING user_id, avatar_url, banner_url, bio, theme, badges`,
      [userId, url]
    );

    return res.json({ ok: true, profile: rows[0] });
  } catch (err) {
    console.error('Profile banner upload error:', err);
    return res.status(500).json({ ok: false, error: 'Error subiendo banner' });
  }
});

// Multer error handler (must be after routes)
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ ok: false, error: 'La imagen es demasiado grande (máx. 10MB).' });
    }
    return res.status(400).json({ ok: false, error: `Error subiendo archivo: ${err.code}` });
  }
  return next(err);
});

// POST /api/profile/follow/:userId -> seguir a un usuario
router.post('/follow/:userId', authMiddleware, async (req, res) => {
  try {
    const followerId = req.user.id;
    const followedId = parseInt(req.params.userId);

    if (followerId === followedId) {
      return res.status(400).json({ ok: false, error: 'No puedes seguirte a ti mismo' });
    }

    await pool.query(
      `INSERT INTO public.followers (follower_id, followed_id)
       VALUES ($1, $2)
       ON CONFLICT (follower_id, followed_id) DO NOTHING`,
      [followerId, followedId]
    );

    return res.json({ ok: true, message: 'Siguiendo' });
  } catch (err) {
    console.error('Follow error:', err);
    return res.status(500).json({ ok: false, error: 'Error al seguir' });
  }
});

// DELETE /api/profile/follow/:userId -> dejar de seguir
router.delete('/follow/:userId', authMiddleware, async (req, res) => {
  try {
    const followerId = req.user.id;
    const followedId = parseInt(req.params.userId);

    await pool.query(
      'DELETE FROM public.followers WHERE follower_id=$1 AND followed_id=$2',
      [followerId, followedId]
    );

    return res.json({ ok: true, message: 'Dejaste de seguir' });
  } catch (err) {
    console.error('Unfollow error:', err);
    return res.status(500).json({ ok: false, error: 'Error al dejar de seguir' });
  }
});

// GET /api/profile/stats/:userId -> estadísticas de usuario (seguidores, siguiendo, etc.)
router.get('/stats/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const { rows: followersRows } = await pool.query(
      'SELECT COUNT(*) as count FROM public.followers WHERE followed_id=$1',
      [userId]
    );

    const { rows: followingRows } = await pool.query(
      'SELECT COUNT(*) as count FROM public.followers WHERE follower_id=$1',
      [userId]
    );

    // Contar likes dados: post_likes + library_items (favorites en diferentes tipos de media)
    const { rows: likesRows } = await pool.query(
      `SELECT COUNT(*) as count FROM public.post_likes 
       WHERE user_id=$1`,
      [userId]
    );

    return res.json({
      ok: true,
      stats: {
        followers: parseInt(followersRows[0]?.count || 0),
        following: parseInt(followingRows[0]?.count || 0),
        likes: parseInt(likesRows[0]?.count || 0)
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({ ok: false, error: 'Error obteniendo estadísticas' });
  }
});

// GET /api/profile/is-following/:userId -> verificar si sigo a un usuario
router.get('/is-following/:userId', authMiddleware, async (req, res) => {
  try {
    const followerId = req.user.id;
    const followedId = parseInt(req.params.userId);

    const { rows } = await pool.query(
      'SELECT 1 FROM public.followers WHERE follower_id=$1 AND followed_id=$2',
      [followerId, followedId]
    );

    return res.json({ ok: true, isFollowing: rows.length > 0 });
  } catch (err) {
    console.error('Is-following error:', err);
    return res.status(500).json({ ok: false, error: 'Error verificando seguimiento' });
  }
});

// GET /api/profile/discover -> descubrir usuarios con cosas en común
router.get('/discover', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));

    // Obtener badges del usuario actual
    const { rows: myProfile } = await pool.query(
      'SELECT badges FROM public.profile WHERE user_id=$1',
      [userId]
    );
    const myBadges = myProfile[0]?.badges || [];

    // Obtener favoritos del usuario actual
    const { rows: myFavorites } = await pool.query(
      `SELECT DISTINCT media_type, external_id 
       FROM public.library_items 
       WHERE user_id=$1 AND list_key='favorites' 
       LIMIT 100`,
      [userId]
    );

    // Buscar usuarios con badges similares o favoritos en común
    const { rows: users } = await pool.query(
      `SELECT DISTINCT
         u.id, u.username, u.name, u.last_name,
         p.avatar_url, p.bio, p.badges,
         (
           SELECT COUNT(DISTINCT li.external_id)
           FROM public.library_items li
           WHERE li.user_id = u.id 
           AND li.list_key = 'favorites'
           AND EXISTS (
             SELECT 1 FROM public.library_items my
             WHERE my.user_id = $1
             AND my.list_key = 'favorites'
             AND my.external_id = li.external_id
             AND my.media_type = li.media_type
           )
         ) as common_favorites,
         EXISTS (
           SELECT 1 FROM public.followers 
           WHERE follower_id=$1 AND followed_id=u.id
         ) as is_following
       FROM public.users u
       LEFT JOIN public.profile p ON p.user_id = u.id
       WHERE u.id != $1
       ORDER BY common_favorites DESC, u.id DESC
       LIMIT $2`,
      [userId, limit]
    );

    // Calcular puntuación de compatibilidad
    const usersWithScore = users.map(user => {
      let score = 0;
      const userBadges = user.badges || [];
      
      // Puntos por badges en común
      const commonBadges = userBadges.filter(b => myBadges.includes(b));
      score += commonBadges.length * 10;

      // Puntos por favoritos en común
      score += (user.common_favorites || 0) * 5;

      return {
        id: user.id,
        username: user.username,
        name: user.name,
        last_name: user.last_name,
        avatar_url: user.avatar_url,
        bio: user.bio,
        badges: user.badges,
        common_favorites: user.common_favorites || 0,
        common_badges: commonBadges,
        compatibility_score: score,
        is_following: user.is_following
      };
    });

    // Ordenar por puntuación de compatibilidad
    usersWithScore.sort((a, b) => b.compatibility_score - a.compatibility_score);

    return res.json({ ok: true, users: usersWithScore });
  } catch (err) {
    console.error('Discover error:', err);
    return res.status(500).json({ ok: false, error: 'Error descubriendo usuarios' });
  }
});

module.exports = router;
