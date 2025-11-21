const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const db = require('./db');

app.get('/api/games', (req, res) => {
  const q = req.query.q || '';
  try {
    const results = db.getGames(q);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/games/:id', (req, res) => {
  try {
    const item = db.getGameById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Game not found' });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/manga', (req, res) => {
  const q = req.query.q || '';
  try {
    const results = db.getManga(q);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/manga/:id', (req, res) => {
  try {
    const item = db.getMangaById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Manga not found' });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Simple health
app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Sugoi backend listening on http://localhost:${PORT}`);
});
