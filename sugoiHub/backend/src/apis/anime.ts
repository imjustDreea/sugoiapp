import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

// Simple in-memory cache
type CacheEntry = {
  expiresAt: number; // ms timestamp
  value: any;
};
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL (adjustable)
const cache = new Map<string, CacheEntry>();

// Helper: sleep
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Helper: fetch with retries on 429
async function fetchWithRetry(url: string, maxRetries = 3) {
  let attempt = 0;
  let lastErr: any = null;
  while (attempt <= maxRetries) {
    try {
      return await axios.get(url);
    } catch (err: any) {
      lastErr = err;
      const status = err?.response?.status;
      // If rate limited, backoff and retry
      if (status === 429 && attempt < maxRetries) {
        const backoff = 500 * Math.pow(2, attempt); // 500ms, 1000ms, 2000ms...
        // eslint-disable-next-line no-console
        console.warn(`Jikan 429, retrying in ${backoff}ms (attempt ${attempt + 1})`);
        // small jitter
        const jitter = Math.floor(Math.random() * 200);
        await sleep(backoff + jitter);
        attempt += 1;
        continue;
      }
      // For other errors or exhausted retries, throw
      throw err;
    }
  }
  throw lastErr;
}

// Build cache key from query params
function cacheKey(q: string, genre: string, limit = 12) {
  return `q=${q}|genre=${genre}|limit=${limit}`;
}

// GET /api/anime/search?q=title&genre=Action
router.get('/search', async (req: Request, res: Response) => {
  const q = String(req.query.q || '').trim();
  const genre = String(req.query.genre || '').trim();
  const limit = Number(req.query.limit || 12);

  try {
    // Jikan v4 search endpoint
    // Support search by genre name (common genres). Jikan expects genre IDs, so map some names.
    const genreMap: Record<string, number> = {
      action: 1,
      adventure: 2,
      comedy: 4,
      drama: 8,
      fantasy: 10,
      horror: 14,
      music: 19,
      mystery: 7,
      romance: 22,
      'slice of life': 36,
      supernatural: 37,
      'sci-fi': 24,
      sports: 30,
      psychological: 40,
    };

    const key = cacheKey(q, genre, limit);
    const now = Date.now();
    const cached = cache.get(key);
    if (cached && cached.expiresAt > now) {
      // eslint-disable-next-line no-console
      console.log(`Cache hit for ${key}`);
      return res.json(cached.value);
    }

    const parts: string[] = [];
    if (q) parts.push(`q=${encodeURIComponent(q)}`);
    // If genre provided and mapped, use genres=ID (Jikan accepts comma separated ids)
    if (genre) {
      const gid = genreMap[genre.toLowerCase()];
      if (gid) parts.push(`genres=${gid}`);
    }

    parts.push(`limit=${limit}`);
    const qs = parts.length ? `?${parts.join('&')}` : '';
    const url = `https://api.jikan.moe/v4/anime${qs}`;

    const response = await fetchWithRetry(url);

    // Pass through limited fields for now, prefer the JPG image URL
    const data = (response.data?.data || []).map((item: any) => {
      const img = item?.images?.jpg?.large_image_url || item?.images?.jpg?.image_url || item?.image_url || null;
      return {
        id: item.mal_id,
        title: item.title,
        episodes: item.episodes,
        score: item.score,
        status: item.status,
        synopsis: item.synopsis,
        image: img,
        raw_images: item.images || null,
        genres: (item.genres || []).map((g: any) => g.name),
      };
    });

    // Include some pagination info if present in Jikan response
    const pagination = response.data?.pagination || null;

    const payload = { results: data, pagination };

    // store in cache
    cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value: payload });

    // Log how many results we pass through
    // eslint-disable-next-line no-console
    console.log(`Jikan: returning ${data.length} items for q=${q}`);

    res.json(payload);
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('Error fetching Jikan:', err?.message || err);
    // If it's a rate-limit error from Jikan, return 502 with info
    const status = err?.response?.status;
    if (status === 429) {
      return res.status(502).json({ error: 'Jikan rate limit (429). Try again shortly.' });
    }
    res.status(500).json({ error: 'Failed to fetch Jikan API' });
  }
});

export default router;
