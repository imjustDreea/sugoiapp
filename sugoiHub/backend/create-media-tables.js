const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createMediaTables() {
  try {
    console.log('Creando tablas para comentarios y likes de media...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.media_comments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        media_type VARCHAR(20) NOT NULL,
        media_id VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_media_comments_media ON public.media_comments(media_type, media_id);
      CREATE INDEX IF NOT EXISTS idx_media_comments_created ON public.media_comments(created_at DESC);

      CREATE TABLE IF NOT EXISTS public.media_likes (
        user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        media_type VARCHAR(20) NOT NULL,
        media_id VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (user_id, media_type, media_id)
      );
      CREATE INDEX IF NOT EXISTS idx_media_likes_media ON public.media_likes(media_type, media_id);
    `);
    
    console.log('✅ Tablas creadas correctamente');
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

createMediaTables();
