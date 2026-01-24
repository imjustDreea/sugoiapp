const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth');

const cache = new Map();
const DEFAULT_TTL = 3600; // 1 hora

function getCache(key) {
  const v = cache.get(key);
  if (!v) return null;
  if (Date.now() > v.expires) {
    cache.delete(key);
    return null;
  }
  return v.data;
}

function setCache(key, data, ttl = DEFAULT_TTL) {
  cache.set(key, { expires: Date.now() + ttl * 1000, data });
}

async function fetchWithRetry(url, retries = 2, backoffMs = 500) {
  let attempt = 0;
  while (true) {
    try {
      const r = await fetch(url);
      if (r.status === 429 || (r.status >= 500 && r.status <= 599)) {
        attempt++;
        if (attempt > retries) return r;
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        backoffMs *= 2;
        continue;
      }
      return r;
    } catch (e) {
      attempt++;
      if (attempt > retries) throw e;
      await new Promise(resolve => setTimeout(resolve, backoffMs));
      backoffMs *= 2;
    }
  }
}

// Generar seed basada en el día actual
function getDailySeed() {
  const today = new Date();
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
}

// Seeded random generator
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Shuffle array con seed
function shuffleWithSeed(array, seed) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// GET /api/recommendations -> recomendaciones aleatorias diarias de anime, manga, music
router.get('/', authMiddleware, async (req, res) => {
  try {
    const seed = getDailySeed();
    const limit = Math.min(30, Math.max(1, parseInt(req.query.limit) || 15));
    const recommendations = [];

    // Obtener anime trending
    try {
      const cacheKey = `recommendations:anime:${seed}`;
      let animeData = getCache(cacheKey);
      
      if (!animeData) {
        const r = await fetchWithRetry('https://api.jikan.moe/v4/top/anime?limit=100&page=1&type=tv');
        const data = await r.json();
        animeData = data.data || [];
        setCache(cacheKey, animeData);
      }

      const shuffled = shuffleWithSeed(animeData, seed);
      const selected = shuffled.slice(0, Math.ceil(limit / 3));
      
      recommendations.push(...selected.map(item => ({
        id: String(item.mal_id),
        title: item.title,
        image_url: item.images?.jpg?.image_url || null,
        type: 'anime',
        meta: { mal_id: item.mal_id, score: item.score }
      })));
    } catch (e) {
      console.error('Error fetching anime recommendations:', e.message);
    }

    // Obtener manga trending
    try {
      const cacheKey = `recommendations:manga:${seed}`;
      let mangaData = getCache(cacheKey);
      
      if (!mangaData) {
        const r = await fetchWithRetry('https://api.jikan.moe/v4/top/manga?limit=100&page=1');
        const data = await r.json();
        mangaData = data.data || [];
        setCache(cacheKey, mangaData);
      }

      const shuffled = shuffleWithSeed(mangaData, seed + 1);
      const selected = shuffled.slice(0, Math.ceil(limit / 3));
      
      recommendations.push(...selected.map(item => ({
        id: String(item.mal_id),
        title: item.title,
        image_url: item.images?.jpg?.image_url || null,
        type: 'manga',
        meta: { mal_id: item.mal_id, score: item.score }
      })));
    } catch (e) {
      console.error('Error fetching manga recommendations:', e.message);
    }

    // Obtener music (OST populares usando anime trending como proxy)
    try {
      const cacheKey = `recommendations:music:${seed}`;
      let musicData = getCache(cacheKey);
      
      if (!musicData) {
        const r = await fetchWithRetry('https://api.jikan.moe/v4/top/anime?limit=50&page=1');
        const data = await r.json();
        musicData = data.data || [];
        setCache(cacheKey, musicData);
      }

      const shuffled = shuffleWithSeed(musicData, seed + 2);
      const selected = shuffled.slice(0, Math.ceil(limit / 3));
      
      recommendations.push(...selected.map(item => ({
        id: `ost_${item.mal_id}`,
        title: `${item.title} OST`,
        image_url: item.images?.jpg?.image_url || null,
        type: 'music',
        meta: { anime_id: item.mal_id, anime_title: item.title }
      })));
    } catch (e) {
      console.error('Error fetching music recommendations:', e.message);
    }

    return res.json({ ok: true, recommendations: recommendations.slice(0, limit) });
  } catch (err) {
    console.error('Recommendations GET error:', err);
    return res.status(500).json({ ok: false, error: 'Error obteniendo recomendaciones' });
  }
});

module.exports = router;
