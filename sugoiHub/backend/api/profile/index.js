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

// GET /api/profile/by-username/:username -> vista pública
router.get('/by-username/:username', async (req, res) => {
  try {
    const username = String(req.params.username || '').trim();
    if (!username) return res.status(400).json({ ok: false, error: 'Username requerido' });

    const { rows } = await pool.query(
      `SELECT 
         u.id, u.username, u.name, u.last_name,
         p.user_id, p.avatar_url, p.banner_url, p.bio, p.theme
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
        ? { user_id: r.user_id, avatar_url: r.avatar_url, banner_url: r.banner_url, bio: r.bio, theme: r.theme }
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
      'SELECT user_id, avatar_url, banner_url, bio, theme FROM public.profile WHERE user_id=$1',
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

    const { rows } = await pool.query(
      `UPDATE public.profile
       SET bio = COALESCE($2, bio),
           theme = COALESCE($3::jsonb, theme),
           updated_at = NOW()
       WHERE user_id=$1
       RETURNING user_id, avatar_url, banner_url, bio, theme`,
      [userId, bio, theme ? JSON.stringify(theme) : null]
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
       RETURNING user_id, avatar_url, banner_url, bio, theme`,
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
       RETURNING user_id, avatar_url, banner_url, bio, theme`,
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

module.exports = router;
