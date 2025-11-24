"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const router = (0, express_1.Router)();
// GET /api/anime/search?q=title&genre=Action
router.get('/search', async (req, res) => {
    const q = String(req.query.q || '').trim();
    const genre = String(req.query.genre || '').trim();
    try {
        // Jikan v4 search endpoint
        // Support search by genre name (common genres). Jikan expects genre IDs, so map some names.
        const genreMap = {
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
        const parts = [];
        if (q)
            parts.push(`q=${encodeURIComponent(q)}`);
        // If genre provided and mapped, use genres=ID (Jikan accepts comma separated ids)
        if (genre) {
            const gid = genreMap[genre.toLowerCase()];
            if (gid)
                parts.push(`genres=${gid}`);
        }
        // default limit
        parts.push('limit=12');
        const qs = parts.length ? `?${parts.join('&')}` : '';
        const url = `https://api.jikan.moe/v4/anime${qs}`;
        const response = await axios_1.default.get(url);
        // Pass through limited fields for now, prefer the JPG image URL
        const data = (response.data?.data || []).map((item) => {
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
                genres: (item.genres || []).map((g) => g.name),
            };
        });
        // Include some pagination info if present in Jikan response
        const pagination = response.data?.pagination || null;
        // Log how many results we pass through
        // eslint-disable-next-line no-console
        console.log(`Jikan: returning ${data.length} items for q=${q}`);
        res.json({ results: data, pagination });
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error fetching Jikan:', err?.message || err);
        res.status(500).json({ error: 'Failed to fetch Jikan API' });
    }
});
exports.default = router;
//# sourceMappingURL=anime.js.map