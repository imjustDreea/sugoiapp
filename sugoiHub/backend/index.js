const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { pool } = require('./db');

const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

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

// Mount anime API router
const animeRouter = require('./api/anime');
app.use('/api/anime', animeRouter);
// Mount manga API router
const mangaRouter = require('./api/manga');
app.use('/api/manga', mangaRouter);

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
