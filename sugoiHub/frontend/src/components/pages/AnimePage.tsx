import { useState, useEffect, useRef } from "react";

type Anime = {
  id: string | number;
  title: string;
  episodes?: number;
  status?: string;
  score?: number;
  synopsis?: string;
  images?: any;
  genres?: string[];
};

function coverDataUrl(seed: string, accent = "#BA8CFF") {
  const svg = `
  <svg xmlns='http://www.w3.org/2000/svg' width='200' height='280'>
    <defs>
      <linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
        <stop offset='0' stop-color='${accent}' stop-opacity='0.95'/>
        <stop offset='1' stop-color='#0f0d12' stop-opacity='0.95'/>
      </linearGradient>
    </defs>
    <rect width='100%' height='100%' fill='url(#g)' rx='12' />
    <g fill='#fff' font-family='Arial, Helvetica, sans-serif' font-weight='700'>
      <text x='50%' y='55%' font-size='20' text-anchor='middle' dominant-baseline='middle' opacity='0.98'>${seed}</text>
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function AnimePage() {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    // initial load: get some random queries
    loadRandom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function doSearch(q: string, genre?: string) {
    setError(null);
    setLoading(true);
    try {
      let url = `http://localhost:4000/api/anime/search?limit=12`;
      if (q) url += `&q=${encodeURIComponent(q)}`;
      if (genre) url += `&genre=${encodeURIComponent(genre)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      setAnimes(json.results || []);
    } catch (err: any) {
      console.error('Failed to load anime', err);
      setError(err.message || 'Error fetching');
      setAnimes([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadRandom() {
    const seeds = [
      'naruto',
      'one piece',
      'attack on titan',
      'death note',
      'fullmetal alchemist',
      'demon slayer',
      'bleach',
      'dragon ball',
      'my hero academia',
      'studio ghibli'
    ];
    // pick 3 different random seeds
    const pick: string[] = [];
    while (pick.length < 3) {
      const s = seeds[Math.floor(Math.random() * seeds.length)];
      if (!pick.includes(s)) pick.push(s);
    }

    setLoading(true);
    setError(null);
    try {
      const responses = await Promise.all(pick.map(s => fetch(`http://localhost:4000/api/anime/search?q=${encodeURIComponent(s)}`)));
      const jsons = await Promise.all(responses.map(r => r.ok ? r.json() : { results: [] }));
      const merged: any[] = [];
      jsons.forEach(j => {
        (j.results || []).forEach((it: any) => merged.push(it));
      });
      // dedupe by id
      const map = new Map<number | string, any>();
      merged.forEach(it => { if (!map.has(it.id)) map.set(it.id, it); });
      const final = Array.from(map.values()).slice(0, 12);
      setAnimes(final);
    } catch (err: any) {
      console.error('Failed to load random anime', err);
      setError(err.message || 'Error fetching');
      setAnimes([]);
    } finally {
      setLoading(false);
    }
  }

  function onChange(v: string) {
    setQuery(v);
    if (timer.current) window.clearTimeout(timer.current);
    // debounce 400ms
    timer.current = window.setTimeout(() => doSearch(v), 400);
  }

  function imgFor(a: any) {
    if (!a) return '';
    if (a.image) return a.image;
    if (a.raw_images && a.raw_images.jpg) return a.raw_images.jpg.image_url;
    return coverDataUrl(((a.title || '')[0] || 'A'));
  }

  // no synopsis shown in the card (we intentionally omit description)

  return (
    <section className="py-8">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Anime</h2>
          <p className="text-sm text-muted-foreground mt-1">Busca anime usando Jikan (resultados desde la API).</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            value={query}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Buscar anime..."
            className="bg-dark text-gray-200 px-3 py-2 rounded-xl focus-ring w-full sm:w-64"
          />
          <select className="bg-dark text-gray-200 px-3 py-2 rounded-xl" onChange={(e) => doSearch(query || '', e.target.value)} defaultValue="">
            <option value="">Todas las categorías</option>
            <option value="Action">Action</option>
            <option value="Adventure">Adventure</option>
            <option value="Comedy">Comedy</option>
            <option value="Drama">Drama</option>
            <option value="Fantasy">Fantasy</option>
            <option value="Music">Music</option>
            <option value="Mystery">Mystery</option>
            <option value="Romance">Romance</option>
            <option value="Slice of Life">Slice of Life</option>
            <option value="Supernatural">Supernatural</option>
            <option value="Sci-Fi">Sci-Fi</option>
            <option value="Sports">Sports</option>
            <option value="Horror">Horror</option>
          </select>
          <button onClick={() => doSearch(query)} className="px-3 py-1 rounded-md btn-accent text-sm font-semibold">Buscar</button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch" style={{ gridAutoRows: '1fr' }}>
          {animes.map((a) => (
            <article key={a.id} className="relative rounded-xl border border-grid bg-darkCard p-4 shadow-md overflow-hidden h-full">
              <div className="flex flex-col sm:flex-row gap-4 h-full">
                <div className="relative w-full sm:w-28 md:w-32 lg:w-36 h-36 sm:h-32 rounded-md overflow-hidden shrink-0">
                  <img src={imgFor(a)} alt={`${a.title} cover`} className="w-full h-full object-cover object-center" onError={(e) => { (e.currentTarget as HTMLImageElement).src = coverDataUrl(((a.title || '')[0]) || 'A'); }} />
                </div>

                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-white truncate">{a.title}</h3>
                      <p className="text-sm text-muted truncate">{a.genres?.join(', ')}</p>
                    </div>
                    <div className="text-sm text-muted">{a.score ?? '—'}</div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <button className="px-3 py-1 rounded-md btn-accent text-sm font-semibold">Añadir</button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
