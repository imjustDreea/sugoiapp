const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth');
const https = require('https');

// Helper para hacer requests HTTPS
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          reject(new Error(`Invalid JSON from ${url}`));
        }
      });
    }).on('error', reject).setTimeout(5000, function() {
      this.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

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
  let lastError;
  
  while (attempt <= retries) {
    try {
      const response = await httpsGet(url);
      
      if (response.status === 429 || (response.status >= 500 && response.status <= 599)) {
        attempt++;
        if (attempt > retries) throw new Error(`API returned ${response.status}`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        backoffMs *= 2;
        continue;
      }
      
      if (response.status !== 200) {
        throw new Error(`API returned ${response.status}`);
      }
      
      return response;
    } catch (e) {
      lastError = e;
      attempt++;
      if (attempt > retries) throw lastError;
      await new Promise(resolve => setTimeout(resolve, backoffMs));
      backoffMs *= 2;
    }
  }
  
  throw lastError || new Error('Unknown fetch error');
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
        const res = await fetchWithRetry('https://api.jikan.moe/v4/top/anime?limit=100&page=1&type=tv');
        animeData = res.data?.data || [];
        setCache(cacheKey, animeData);
      }

      const shuffled = shuffleWithSeed(animeData, seed);
      const selected = shuffled.slice(0, Math.ceil(limit / 3));
      
      selected.forEach(item => {
        if (item && item.mal_id && item.title) {
          recommendations.push({
            id: String(item.mal_id),
            title: item.title,
            image_url: item.images?.jpg?.image_url || null,
            type: 'anime',
            meta: { mal_id: item.mal_id, score: item.score }
          });
        }
      });
    } catch (e) {
      console.error('Error fetching anime recommendations:', e.message);
    }

    // Obtener manga trending
    try {
      const cacheKey = `recommendations:manga:${seed}`;
      let mangaData = getCache(cacheKey);
      
      if (!mangaData) {
        const res = await fetchWithRetry('https://api.jikan.moe/v4/top/manga?limit=100&page=1');
        mangaData = res.data?.data || [];
        setCache(cacheKey, mangaData);
      }

      const shuffled = shuffleWithSeed(mangaData, seed + 1);
      const selected = shuffled.slice(0, Math.ceil(limit / 3));
      
      selected.forEach(item => {
        if (item && item.mal_id && item.title) {
          recommendations.push({
            id: String(item.mal_id),
            title: item.title,
            image_url: item.images?.jpg?.image_url || null,
            type: 'manga',
            meta: { mal_id: item.mal_id, score: item.score }
          });
        }
      });
    } catch (e) {
      console.error('Error fetching manga recommendations:', e.message);
    }

    // Obtener music (OST populares usando anime trending como proxy)
    try {
      const cacheKey = `recommendations:music:${seed}`;
      let musicData = getCache(cacheKey);
      
      if (!musicData) {
        const res = await fetchWithRetry('https://api.jikan.moe/v4/top/anime?limit=50&page=2');
        musicData = res.data?.data || [];
        setCache(cacheKey, musicData);
      }

      const shuffled = shuffleWithSeed(musicData, seed + 2);
      const selected = shuffled.slice(0, Math.ceil(limit / 3));
      
      selected.forEach(item => {
        if (item && item.mal_id && item.title) {
          recommendations.push({
            id: `ost_${item.mal_id}`,
            title: `${item.title} OST`,
            image_url: item.images?.jpg?.image_url || null,
            type: 'music',
            meta: { anime_id: item.mal_id, anime_title: item.title }
          });
        }
      });
    } catch (e) {
      console.error('Error fetching music recommendations:', e.message);
    }

    if (recommendations.length === 0) {
      return res.status(500).json({ ok: false, error: 'No se pudieron obtener recomendaciones' });
    }

    return res.json({ ok: true, recommendations: recommendations.slice(0, limit) });
  } catch (err) {
    console.error('Recommendations GET error:', err);
    return res.status(500).json({ ok: false, error: 'Error obteniendo recomendaciones' });
  }
});

module.exports = router;
