const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'data', 'sugoi.db');
const db = new Database(dbPath);

// Create tables if they don't exist
db.exec(`
CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,
  title TEXT,
  genre TEXT,
  rating REAL,
  cover TEXT,
  description TEXT
);

CREATE TABLE IF NOT EXISTS manga (
  id TEXT PRIMARY KEY,
  title TEXT,
  author TEXT,
  status TEXT,
  cover TEXT,
  description TEXT
);
`);

// Seed DB from JSON files if empty
function seedTableIfEmpty(tableName, jsonPath, insertFn) {
  const row = db.prepare(`SELECT 1 FROM ${tableName} LIMIT 1`).get();
  if (!row) {
    const raw = fs.readFileSync(jsonPath, 'utf8');
    const items = JSON.parse(raw);
    const insert = insertFn();
    const insertMany = db.transaction((arr) => {
      for (const it of arr) insert.run(it);
    });
    insertMany(items.map(i => i));
  }
}

seedTableIfEmpty('games', path.join(__dirname, 'data', 'games.json'), () => db.prepare('INSERT OR IGNORE INTO games (id,title,genre,rating,cover,description) VALUES (@id,@title,@genre,@rating,@cover,@description)'));
seedTableIfEmpty('manga', path.join(__dirname, 'data', 'manga.json'), () => db.prepare('INSERT OR IGNORE INTO manga (id,title,author,status,cover,description) VALUES (@id,@title,@author,@status,@cover,@description)'));

// Query helpers
function getGames(q) {
  if (!q) return db.prepare('SELECT * FROM games ORDER BY title').all();
  const like = `%${q.toLowerCase()}%`;
  return db.prepare('SELECT * FROM games WHERE LOWER(title) LIKE ? ORDER BY title').all(like);
}

function getGameById(id) {
  return db.prepare('SELECT * FROM games WHERE id = ?').get(id);
}

function getManga(q) {
  if (!q) return db.prepare('SELECT * FROM manga ORDER BY title').all();
  const like = `%${q.toLowerCase()}%`;
  return db.prepare('SELECT * FROM manga WHERE LOWER(title) LIKE ? ORDER BY title').all(like);
}

function getMangaById(id) {
  return db.prepare('SELECT * FROM manga WHERE id = ?').get(id);
}

module.exports = {
  getGames,
  getGameById,
  getManga,
  getMangaById,
  db // export DB in case it's needed for admin scripts
};
