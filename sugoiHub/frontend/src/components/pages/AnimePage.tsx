import { useState, useEffect, useRef } from "react";

type Anime = {
  id: string | number;
  title: string;
  episodes?: number;
  status?: string;
  score?: number;
  synopsis?: string;
  images?: unknown;
  genres?: string[];
};

type AnimeApiResult = Anime & {
  image?: string;
  raw_images?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

function normalizeAnime(item: unknown): AnimeApiResult | null {
  if (!isRecord(item)) return null;

  const idRaw = item.id;
  const id: string | number =
    typeof idRaw === 'string' || typeof idRaw === 'number'
      ? idRaw
      : (typeof item.title === 'string' ? item.title : JSON.stringify(item));

  const title =
    typeof item.title === 'string'
      ? item.title
      : (typeof item.name === 'string' ? item.name : 'Untitled');

  const score = typeof item.score === 'number' ? item.score : undefined;
  const genres = Array.isArray(item.genres)
    ? item.genres.filter((g): g is string => typeof g === 'string' && g.trim().length > 0)
    : undefined;

  const image = typeof item.image === 'string' ? item.image : undefined;

  return {
    id,
    title,
    episodes: typeof item.episodes === 'number' ? item.episodes : undefined,
    status: typeof item.status === 'string' ? item.status : undefined,
    score,
    synopsis: typeof item.synopsis === 'string' ? item.synopsis : undefined,
    images: item.images,
    genres,
    image,
    raw_images: item.raw_images,
  };
}

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
  const [allAnimes, setAllAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    // initial load: get some random queries
    loadRandom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyCategoryFilter(items: AnimeApiResult[], cat?: string): AnimeApiResult[] {
    if (!cat) return items;
    const c = String(cat).toLowerCase();
    return items.filter((a) => (a.genres || []).some((g) => String(g).toLowerCase() === c));
  }

  async function doSearch(q: string) {
    setError(null);
    setLoading(true);
    try {
      const apiBase = ((import.meta.env.VITE_BACKEND_URL as string) || '').replace(/\/$/, '');
      let url = `${apiBase}/api/anime/search?limit=12`;
      if (q) url += `&q=${encodeURIComponent(q)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const json: unknown = await res.json();
      const resultsRaw = isRecord(json) ? json.results : undefined;
      const results = Array.isArray(resultsRaw)
        ? resultsRaw.map(normalizeAnime).filter((x): x is AnimeApiResult => x !== null)
        : [];
      setAllAnimes(results);
      setAnimes(applyCategoryFilter(results, category));
    } catch (err: unknown) {
      console.error('Failed to load anime', err);
      setError(getErrorMessage(err) || 'Error fetching');
      setAnimes([]);
      setAllAnimes([]);
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
      const apiBase = ((import.meta.env.VITE_BACKEND_URL as string) || '').replace(/\/$/, '');
      const responses = await Promise.all(pick.map(s => fetch(`${apiBase}/api/anime/search?q=${encodeURIComponent(s)}`)));
      const jsons: unknown[] = await Promise.all(
        responses.map((r) => (r.ok ? r.json() : Promise.resolve({ results: [] })))
      );

      const merged: AnimeApiResult[] = [];
      jsons.forEach((j) => {
        const resultsRaw = isRecord(j) ? j.results : undefined;
        const arr = Array.isArray(resultsRaw) ? resultsRaw : [];
        arr.map(normalizeAnime)
          .filter((x): x is AnimeApiResult => x !== null)
          .forEach((it) => merged.push(it));
      });

      // dedupe by id
      const map = new Map<number | string, AnimeApiResult>();
      merged.forEach((it) => {
        if (!map.has(it.id)) map.set(it.id, it);
      });

      const final = Array.from(map.values()).slice(0, 12);
      setAllAnimes(final);
      setAnimes(applyCategoryFilter(final, category));
    } catch (err: unknown) {
      console.error('Failed to load random anime', err);
      setError(getErrorMessage(err) || 'Error fetching');
      setAnimes([]);
      setAllAnimes([]);
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

  const categoryOptions = Array.from(
    new Set(
      (allAnimes || [])
        .flatMap((a) => (a.genres || []))
        .map((g) => String(g).trim())
        .filter((g: string) => g.length > 0)
    )
  ).sort((a, b) => a.localeCompare(b));

  function imgFor(a: AnimeApiResult) {
    if (!a) return '';
    if (typeof a.image === 'string' && a.image.length > 0) return a.image;

    const raw = a.raw_images;
    if (isRecord(raw)) {
      const jpg = raw.jpg;
      if (isRecord(jpg)) {
        const imageUrl = jpg.image_url;
        if (typeof imageUrl === 'string' && imageUrl.length > 0) return imageUrl;
      }
    }

    return coverDataUrl(((a.title || '')[0] || 'A'));
  }

  function ratingFromScore(score?: number | null) {
    if (score == null || Number.isNaN(score)) return null;
    // Jikan suele devolver score 0..10. Lo normalizamos a 0..5
    const r = Math.max(0, Math.min(5, score / 2));
    return r;
  }

  function Stars({ score }: { score?: number | null }) {
    const rating = ratingFromScore(score);
    const filled = rating == null ? 0 : Math.round(rating);
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-accentLime" aria-label={rating == null ? 'Sin puntuación' : `Puntuación ${filled} de 5`}>
          {Array.from({ length: 5 }).map((_, i) => {
            const on = i < filled;
            return (
              <svg
                key={i}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={on ? '' : 'opacity-30'}
              >
                <path d="M12 .587l3.668 7.431L24 9.75l-6 5.848L19.335 24 12 20.201 4.665 24 6 15.598 0 9.75l8.332-1.732z" />
              </svg>
            );
          })}
        </div>
        <div className="text-xs text-muted-dim">{score ?? '—'}</div>
      </div>
    );
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
          <select
            className="bg-dark text-gray-200 px-3 py-2 rounded-xl"
            value={category}
            onChange={(e) => {
              const next = e.target.value;
              setCategory(next);
              setAnimes(applyCategoryFilter(allAnimes as AnimeApiResult[], next || undefined));
            }}
          >
            <option value="">Todas las categorías</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
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
            <article
              key={a.id}
              className="relative rounded-xl border border-grid shadow-md overflow-hidden h-full"
              style={{
                backgroundImage: `url(${imgFor(a)})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {/* overlay oscuro + blur (estilo Netflix/Crunchyroll) */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'color-mix(in srgb, var(--color-bg) 70%, transparent)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
              />

              <div className="relative z-10 p-4 flex flex-col gap-3 h-full">
                {/* rating arriba (sin pisar el póster) */}
                <div className="flex items-center justify-end">
                  <div className="bg-panel border border-grid px-2 py-1 rounded-md">
                    <Stars score={a.score} />
                  </div>
                </div>

                {/* póster central (como antes) */}
                <div className="relative flex items-center justify-center">
                  <div className="w-40 h-52 border-2 border-white/80 bg-black/40 overflow-hidden" style={{ imageRendering: 'pixelated' }}>
                    <img
                      src={imgFor(a)}
                      alt={`${a.title} cover`}
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = coverDataUrl(((a.title || '')[0]) || 'A');
                      }}
                    />
                  </div>
                </div>

                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-white truncate">{a.title}</h3>
                  <div className="text-xs text-muted-dim truncate">{(a.genres || []).join(' • ')}</div>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3">
                  <div className="text-xs text-muted-dim">
                    {a.episodes ? `${a.episodes} eps` : ''}
                    {a.episodes && a.status ? ' • ' : ''}
                    {a.status ? a.status : ''}
                  </div>
                  <button className="px-3 py-1 rounded-md btn-accent-lime text-sm font-semibold border border-grid">Añadir</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
