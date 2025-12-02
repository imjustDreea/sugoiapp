const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { supabase } = require('./supabaseClient');

const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Logging de entorno (no mostrar keys completas)
console.log('Backend starting. PORT=', process.env.PORT || 4000);
console.log('SUPABASE_URL present:', !!process.env.SUPABASE_URL);
console.log('SUPABASE_SERVICE_KEY present:', !!process.env.SUPABASE_SERVICE_KEY);

// Root API health endpoint (avoid using '/' because the SPA uses that path)
app.get('/api', (req, res) => {
  res.json({ ok: true, message: 'Sugoi backend running' });
});

// Mount anime API router
const animeRouter = require('./api/anime');
app.use('/api/anime', animeRouter);
// Mount manga API router
const mangaRouter = require('./api/manga');
app.use('/api/manga', mangaRouter);

// Endpoint de ejemplo: devuelve filas de la tabla `users` (ajusta el nombre si usas otra tabla)
app.get('/api/users', async (req, res) => {
  console.log('Incoming GET /users from', req.ip, 'headers:', {
    origin: req.get('origin'),
    host: req.get('host'),
  });
  try {
    if (!process.env.SUPABASE_SERVICE_KEY) {
      console.error('SUPABASE_SERVICE_KEY missing — cannot query Supabase. Set SUPABASE_SERVICE_KEY in backend/.env');
      return res.status(500).json({ error: 'SUPABASE_SERVICE_KEY missing on server' });
    }

    const { data, error } = await supabase.from('users').select('*').limit(100);
    if (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ error: error.message || error });
    }

    console.log('Supabase returned rows:', Array.isArray(data) ? data.length : 0);
    return res.json({ data });
  } catch (e) {
    console.error('Unexpected error in /users:', e);
    return res.status(500).json({ error: String(e) });
  }
});

// Diagnostic endpoint: devuelve el número de filas usando head/count
app.get('/api/users/count', async (req, res) => {
  try {
    const { data, error, count } = await supabase.from('users').select('*', { head: true, count: 'exact' });
    if (error) {
      console.error('Supabase count error:', error);
      return res.status(500).json({ error: error.message || error });
    }
    // data will be null when head:true; return count
    return res.json({ count: typeof count === 'number' ? count : 0 });
  } catch (e) {
    console.error('Unexpected error in /users/count:', e);
    return res.status(500).json({ error: String(e) });
  }
});

// Servir archivos estáticos generados por el frontend (build)
// Si ejecutas `cd ../frontend && npm run build` y la configuración de Vite
// apunta a ../backend/dist, los archivos estarán en backend/dist
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback: cualquier ruta no conocida por la API debe devolver index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Sugoi backend listening on ${port}`));
