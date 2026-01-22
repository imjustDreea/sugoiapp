const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { pool } = require('./db');

const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

async function ensureProfileTable() {
  // Tabla de perfil 1:1 con users
  const sql = `
    CREATE TABLE IF NOT EXISTS public.profile (
      user_id INTEGER PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
      avatar_url TEXT,
      banner_url TEXT,
      bio TEXT,
      theme JSONB,
      badges JSONB,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await pool.query(sql);

  // Backfill: si la tabla ya existía antes, añadimos columnas nuevas de forma segura.
  await pool.query('ALTER TABLE public.profile ADD COLUMN IF NOT EXISTS badges JSONB');
}

async function ensureLibraryTables() {
  // Lista por tipo (anime/games/manga/music) + dos listas por tipo (favorites/later)
  // Si ya existe una tabla antigua (sin list_key), la migramos a library_items_old.

  const migrateSql = `
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema='public' AND table_name='library_items'
      ) THEN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema='public' AND table_name='library_items' AND column_name='list_key'
        ) THEN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema='public' AND table_name='library_items_old'
          ) THEN
            ALTER TABLE public.library_items RENAME TO library_items_old;
          END IF;
        END IF;
      END IF;
    END $$;
  `;

  const createSql = `
    CREATE TABLE IF NOT EXISTS public.library_items (
      user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      media_type TEXT NOT NULL,
      list_key TEXT NOT NULL,
      external_id TEXT NOT NULL,
      title TEXT NOT NULL,
      image_url TEXT,
      meta JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, media_type, list_key, external_id)
    );

    CREATE INDEX IF NOT EXISTS idx_library_items_user_type_list_created
      ON public.library_items (user_id, media_type, list_key, created_at DESC);
  `;

  const backfillSql = `
    INSERT INTO public.library_items (user_id, media_type, list_key, external_id, title, image_url, meta, created_at)
    SELECT user_id, media_type, 'later', external_id, title, image_url, meta, created_at
    FROM public.library_items_old
    ON CONFLICT DO NOTHING;
  `;

  await pool.query(migrateSql);
  await pool.query(createSql);

  // Si existe library_items_old, migramos su contenido.
  try {
    await pool.query(backfillSql);
  } catch {
    // Ignorar si no existe la tabla old.
  }
}

async function ensureAnimeLikesTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS public.anime_likes (
      user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      anime_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, anime_id)
    );

    CREATE INDEX IF NOT EXISTS idx_anime_likes_anime
      ON public.anime_likes (anime_id);
  `;

  await pool.query(sql);
}

async function ensureMediaLikesTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS public.media_likes (
      user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      media_type TEXT NOT NULL,
      media_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, media_type, media_id)
    );

    CREATE INDEX IF NOT EXISTS idx_media_likes_type_id
      ON public.media_likes (media_type, media_id);
  `;

  await pool.query(sql);
}

async function ensureFollowersTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS public.followers (
      follower_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      followed_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW(),
      PRIMARY KEY (follower_id, followed_id)
    );
    CREATE INDEX IF NOT EXISTS idx_followers_follower ON public.followers(follower_id);
    CREATE INDEX IF NOT EXISTS idx_followers_followed ON public.followers(followed_id);
  `;
  await pool.query(sql);
}

async function ensurePostsTables() {
  const sql = `
    CREATE TABLE IF NOT EXISTS public.posts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      content TEXT,
      image_url TEXT,
      favorite_type TEXT,
      favorite_id TEXT,
      favorite_title TEXT,
      favorite_image TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_posts_user ON public.posts(user_id);
    CREATE INDEX IF NOT EXISTS idx_posts_created ON public.posts(created_at DESC);

    CREATE TABLE IF NOT EXISTS public.post_likes (
      user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      post_id INTEGER NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW(),
      PRIMARY KEY (user_id, post_id)
    );
    CREATE INDEX IF NOT EXISTS idx_post_likes_post ON public.post_likes(post_id);

    CREATE TABLE IF NOT EXISTS public.post_comments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      post_id INTEGER NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_post_comments_post ON public.post_comments(post_id);
    CREATE INDEX IF NOT EXISTS idx_post_comments_created ON public.post_comments(created_at DESC);
  `;
  await pool.query(sql);
}

// Logging de entorno (no mostrar keys completas)
console.log('Backend starting. PORT=', process.env.PORT || 4000);

// Root API health endpoint (avoid using '/' because the SPA uses that path)
app.get('/api', (req, res) => {
  res.json({ ok: true, message: 'Sugoi backend running' });
});

// Test database connection endpoint
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ ok: true, message: 'Database connected', timestamp: result.rows[0].now });
  } catch (error) {
    console.error('Error connecting to database:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Listado de usuarios desde public.users (sin exponer contraseña)
app.get('/api/users', async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, username, name, last_name AS lastname, email, birth, datecreate AS create_date FROM public.users ORDER BY datecreate DESC NULLS LAST LIMIT 100"
    );
    res.json({ ok: true, data: rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ ok: false, error: 'No se pudieron obtener los usuarios' });
  }
});

// Mount media API router (MUST be before specific type routers)
const mediaRouter = require('./api/media');
app.use('/api/media', mediaRouter);

// Mount anime API router
const animeRouter = require('./api/anime');
app.use('/api/anime', animeRouter);
// Mount manga API router
const mangaRouter = require('./api/manga');
app.use('/api/manga', mangaRouter);
// Mount auth API router
const authRouter = require('./api/auth');
app.use('/api/auth', authRouter);

// Mount games API router
const gamesRouter = require('./api/games');
app.use('/api/games', gamesRouter);

// Mount music API router
const musicRouter = require('./api/music');
app.use('/api/music', musicRouter);

// Mount profile API router
const profileRouter = require('./api/profile');
app.use('/api/profile', profileRouter);

// Mount library (listas) API router
const libraryRouter = require('./api/library');
app.use('/api/library', libraryRouter);

// Mount posts API router
const postsRouter = require('./api/posts');
app.use('/api/posts', postsRouter);

// Static uploads (avatars/banners)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Servir archivos estáticos generados por el frontend (build)
// Si ejecutas `cd ../frontend && npm run build` y la configuración de Vite
// apunta a ../backend/dist, los archivos estarán en backend/dist
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback: cualquier ruta no conocida por la API debe devolver index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 4000;
ensureProfileTable()
  .then(() => ensureLibraryTables())
  .then(() => ensureAnimeLikesTable())
  .then(() => ensureMediaLikesTable())
  .then(() => ensureFollowersTable())
  .then(() => ensurePostsTables())
  .then(() => {
    app.listen(port, () => console.log(`Sugoi backend listening on ${port}`));
  })
  .catch((err) => {
    console.error('Failed ensuring DB tables:', err);
    process.exit(1);
  });
