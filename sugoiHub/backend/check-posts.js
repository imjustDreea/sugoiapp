const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkPosts() {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM public.posts');
    console.log('Total de posts en la base de datos:', result.rows[0].count);
    
    const posts = await pool.query('SELECT id, content, created_at FROM public.posts ORDER BY created_at DESC LIMIT 5');
    console.log('\nÚltimos 5 posts:');
    posts.rows.forEach(p => {
      console.log(`- ID ${p.id}: "${p.content?.substring(0, 50)}..." (${p.created_at})`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
  }
}

checkPosts();
