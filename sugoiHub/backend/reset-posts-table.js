const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function resetPostsTables() {
  try {
    console.log('Eliminando tablas de posts...');
    await pool.query(`
      DROP TABLE IF EXISTS public.post_comments CASCADE;
      DROP TABLE IF EXISTS public.post_likes CASCADE;
      DROP TABLE IF EXISTS public.posts CASCADE;
    `);
    console.log('✅ Tablas eliminadas correctamente');
    
    console.log('Recreando tablas con nuevas columnas...');
    await pool.query(`
      CREATE TABLE public.posts (
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
      CREATE INDEX idx_posts_user ON public.posts(user_id);
      CREATE INDEX idx_posts_created ON public.posts(created_at DESC);

      CREATE TABLE public.post_likes (
        user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        post_id INTEGER NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (user_id, post_id)
      );
      CREATE INDEX idx_post_likes_post ON public.post_likes(post_id);

      CREATE TABLE public.post_comments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        post_id INTEGER NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX idx_post_comments_post ON public.post_comments(post_id);
      CREATE INDEX idx_post_comments_created ON public.post_comments(created_at DESC);
    `);
    console.log('✅ Tablas recreadas correctamente');
    
    await pool.end();
    console.log('Listo! Reinicia el backend ahora.');
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

resetPostsTables();
