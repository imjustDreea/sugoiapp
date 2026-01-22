const express = require('express');

const { pool } = require('../../db');
const authMiddleware = require('../../middleware/auth');

const router = express.Router();

const ALLOWED_TYPES = new Set(['anime', 'games', 'manga', 'music']);
const ALLOWED_LISTS = new Set(['favorites', 'later']);

function isBannedGenreValue(v) {
  return String(v || '').trim().toLowerCase() === 'hentai';
}

function hasBannedGenres(meta) {
  if (!meta || typeof meta !== 'object') return false;
  const genres = meta.genres;
  if (!Array.isArray(genres)) return false;
  return genres.some((g) => isBannedGenreValue(g));
}

function normalizeType(t) {
  const s = String(t || '').trim().toLowerCase();
  return ALLOWED_TYPES.has(s) ? s : null;
}

function normalizeListKey(v) {
  const s = String(v || '').trim().toLowerCase();
  if (!s) return 'later';
  return ALLOWED_LISTS.has(s) ? s : null;
}

function asTextId(v) {
  if (typeof v === 'string' || typeof v === 'number') return String(v);
  return null;
}

// GET /api/library/summary -> counts por tipo
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const { rows } = await pool.query(
      `SELECT media_type, list_key, COUNT(*)::int AS count
       FROM public.library_items
       WHERE user_id=$1
         AND NOT (COALESCE(meta->'genres','[]'::jsonb) ?| ARRAY['Hentai','hentai'])
       GROUP BY media_type, list_key`,
      [userId]
    );

    const counts = {
      anime: { favorites: 0, later: 0 },
      games: { favorites: 0, later: 0 },
      manga: { favorites: 0, later: 0 },
      music: { favorites: 0, later: 0 },
    };
    for (const r of rows) {
      const t = normalizeType(r.media_type);
      const lk = normalizeListKey(r.list_key);
      if (t && lk) counts[t][lk] = Number(r.count) || 0;
    }

    return res.json({ ok: true, counts });
  } catch (err) {
    console.error('Library summary error:', err);
    return res.status(500).json({ ok: false, error: 'Error obteniendo resumen de listas' });
  }
});

// GET /api/library/:userId/favorites -> obtiene favoritos del usuario
router.get('/:userId/favorites', async (req, res) => {
  try {
    const userId = req.params.userId;

    const { rows } = await pool.query(
      `SELECT external_id as media_id, media_type, title, image_url as cover_url
       FROM public.library_items
       WHERE user_id=$1 AND list_key='favorites'
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.json({ ok: true, items: rows });
  } catch (err) {
    console.error('Get favorites error:', err);
    return res.status(500).json({ ok: false, error: 'Error cargando favoritos' });
  }
});

// GET /api/library/:type -> lista items del usuario
router.get('/:type', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const type = normalizeType(req.params.type);
    if (!type) return res.status(400).json({ ok: false, error: 'Tipo inválido' });

    const listKey = normalizeListKey(req.query.list);
    if (!listKey) return res.status(400).json({ ok: false, error: 'Lista inválida' });

    const limit = Math.max(1, Math.min(200, Number(req.query.limit) || 60));

    const { rows } = await pool.query(
      `SELECT external_id, title, image_url, meta, created_at
       FROM public.library_items
       WHERE user_id=$1 AND media_type=$2 AND list_key=$3
         AND NOT (COALESCE(meta->'genres','[]'::jsonb) ?| ARRAY['Hentai','hentai'])
       ORDER BY created_at DESC
       LIMIT $4`,
      [userId, type, listKey, limit]
    );

    return res.json({ ok: true, items: rows });
  } catch (err) {
    console.error('Library list error:', err);
    return res.status(500).json({ ok: false, error: 'Error obteniendo lista' });
  }
});

// POST /api/library/:type -> añade (idempotente)
router.post('/:type', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const type = normalizeType(req.params.type);
    if (!type) return res.status(400).json({ ok: false, error: 'Tipo inválido' });

    const listKey = normalizeListKey(req.body?.list);
    if (!listKey) return res.status(400).json({ ok: false, error: 'Lista inválida' });

    const externalId = asTextId(req.body?.id);
    const title = typeof req.body?.title === 'string' ? req.body.title.trim().slice(0, 200) : '';
    const imageUrl = typeof req.body?.image === 'string' ? req.body.image.trim().slice(0, 500) : null;
    const meta = req.body?.meta && typeof req.body.meta === 'object' ? req.body.meta : null;

    if (meta && hasBannedGenres(meta)) {
      return res.status(400).json({ ok: false, error: 'Contenido no permitido' });
    }

    if (!externalId || !title) {
      return res.status(400).json({ ok: false, error: 'Campos requeridos: id, title' });
    }

    const { rows } = await pool.query(
      `INSERT INTO public.library_items (user_id, media_type, list_key, external_id, title, image_url, meta)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
       ON CONFLICT (user_id, media_type, list_key, external_id)
       DO UPDATE SET
         title = EXCLUDED.title,
         image_url = COALESCE(EXCLUDED.image_url, public.library_items.image_url),
         meta = COALESCE(EXCLUDED.meta, public.library_items.meta)
       RETURNING user_id, media_type, list_key, external_id, title, image_url, meta, created_at`,
      [userId, type, listKey, externalId, title, imageUrl, meta ? JSON.stringify(meta) : null]
    );

    return res.json({ ok: true, item: rows[0] });
  } catch (err) {
    console.error('Library add error:', err);
    return res.status(500).json({ ok: false, error: 'Error guardando en lista' });
  }
});

// DELETE /api/library/:type/:id -> elimina
router.delete('/:type/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const type = normalizeType(req.params.type);
    const externalId = asTextId(req.params.id);
    if (!type) return res.status(400).json({ ok: false, error: 'Tipo inválido' });
    if (!externalId) return res.status(400).json({ ok: false, error: 'ID inválido' });

    const listKey = normalizeListKey(req.query.list);
    if (!listKey) return res.status(400).json({ ok: false, error: 'Lista inválida' });

    await pool.query(
      `DELETE FROM public.library_items
       WHERE user_id=$1 AND media_type=$2 AND list_key=$3 AND external_id=$4`,
      [userId, type, listKey, externalId]
    );

    return res.json({ ok: true });
  } catch (err) {
    console.error('Library delete error:', err);
    return res.status(500).json({ ok: false, error: 'Error eliminando de la lista' });
  }
});

module.exports = router;
