import { useContext, useEffect, useState, useRef } from "react";
import { Link } from 'react-router-dom';
import type { Manga } from "../../types";
import LikeButton from "../ui/LikeButton";
import { AuthContext } from "../../context/AuthContext";
import type { LibraryListKey } from "../../types";
import { saveToLibrary } from "../../lib/library";
import { useToast } from '../../context/ToastContext';
import { getApiBase } from "../../lib/apiBase";

type RawItem = Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

function isBannedCategory(name: unknown) {
  return String(name || '').trim().toLowerCase() === 'hentai';
}

function toNameList(value: unknown): string[] {
  if (!value) return [];
  const arr = Array.isArray(value) ? value : [value];
  return arr
    .map((x) => {
      if (typeof x === 'string') return x;
      if (isRecord(x)) {
        const n = x.name;
        const t = x.title;
        if (typeof n === 'string') return n;
        if (typeof t === 'string') return t;
      }
      return null;
    })
    .filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
}

function toAuthorString(value: unknown): string | undefined {
  const names = toNameList(value);
  if (names.length === 0) return undefined;
  return names.join(', ');
}

function coverDataUrl(seed: string, accent = "#FFBB00") {
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

export default function MangaPage() {
  const auth = useContext(AuthContext);
  const token = auth?.token;
  const { showToast } = useToast();

  const [mangas, setMangas] = useState<Manga[]>([]);
  const [allMangas, setAllMangas] = useState<Manga[]>([]);
  const [query, setQuery] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [likesById, setLikesById] = useState<Record<string, { likes: number; liked: boolean }>>({});

  // Calcular mangas paginados
  const totalPages = Math.ceil(mangas.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedMangas = mangas.slice(startIdx, startIdx + itemsPerPage);

  useEffect(() => {
    // Fetch initial list
    fetchMangas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadLikes() {
      const ids = (mangas || []).map((m) => String(m.id));
      if (ids.length === 0) return;

      const apiBase = getApiBase();
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const results = await Promise.all(
          ids.map(async (id) => {
            const res = await fetch(`${apiBase}/api/media/manga/${encodeURIComponent(id)}/likes`, { headers });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) return { id, likes: 0, liked: false };
            return {
              id,
              likes: Number((data as any)?.likes) || 0,
              liked: Boolean((data as any)?.liked),
            };
          })
        );

        if (cancelled) return;
        setLikesById((prev) => {
          const next = { ...prev };
          for (const r of results) next[r.id] = { likes: r.likes, liked: r.liked };
          return next;
        });
      } catch {
        // silencioso: likes no son críticos
      }
    }

    loadLikes();
    return () => {
      cancelled = true;
    };
  }, [mangas, token]);

  function applyCategoryFilter(items: Manga[], cat?: string): Manga[] {
    // Nunca mostrar hentai
    const safe = items.filter((m) => !(m.genres || []).some((g) => isBannedCategory(g)));

    if (!cat) return safe;
    if (isBannedCategory(cat)) return [];

    const c = String(cat).toLowerCase();
    return safe.filter((m) => (m.genres || []).some((g) => String(g).toLowerCase() === c));
  }

  async function fetchMangas(q?: string) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      params.set('limit', '12');
      const apiBase = getApiBase();
      const url = `${apiBase}/api/manga/search?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j: unknown = await res.json();
      const itemsRaw = isRecord(j) ? j.results : undefined;
      const items: RawItem[] = Array.isArray(itemsRaw) ? (itemsRaw as RawItem[]) : [];

      // Map backend items to our `Manga` type as best-effort
      const mapped: Manga[] = items.map((it: RawItem) => ({
        id: (() => {
          const idRaw = it.id ?? it.slug ?? it._id;
          return (typeof idRaw === 'string' || typeof idRaw === 'number') ? idRaw : JSON.stringify(it);
        })(),
        title: (() => {
          const t = it.title;
          const n = it.name;
          const attributes = isRecord(it.attributes) ? it.attributes : undefined;
          const at = attributes ? attributes.title : undefined;
          const raw = isRecord(it.raw) ? it.raw : undefined;
          const rt = raw ? raw.title : undefined;
          if (typeof t === 'string') return t;
          if (typeof n === 'string') return n;
          if (typeof at === 'string') return at;
          if (typeof rt === 'string') return rt;
          return 'Untitled';
        })(),
        image: (() => {
          const raw = isRecord(it.raw) ? it.raw : undefined;
          const candidates = [it.image, it.cover, it.thumbnail, raw?.image, raw?.cover, raw?.thumbnail];
          const found = candidates.find((x) => typeof x === 'string' && x.length > 0);
          return typeof found === 'string' ? found : undefined;
        })(),
        author: (() => {
          const raw = isRecord(it.raw) ? it.raw : undefined;
          const rawAuthor = raw ? (raw.author ?? raw.authors) : undefined;
          return toAuthorString(it.author ?? it.authors ?? rawAuthor);
        })(),
        chapters: (() => {
          const raw = isRecord(it.raw) ? it.raw : undefined;
          const c = it.chapters ?? raw?.chapters;
          const n = typeof c === 'number' ? c : Number(c);
          return Number.isFinite(n) && n > 0 ? n : undefined;
        })(),
        status: (() => {
          const raw = isRecord(it.raw) ? it.raw : undefined;
          const s = it.status ?? raw?.status;
          return typeof s === 'string' ? s : undefined;
        })(),
        rating: (() => {
          const raw = isRecord(it.raw) ? it.raw : undefined;
          const s = it.score ?? it.rating ?? raw?.rating;
          return typeof s === 'number' ? s : undefined;
        })(),
        genres: (() => {
          const raw = isRecord(it.raw) ? it.raw : undefined;
          return toNameList(it.genres ?? raw?.genres);
        })(),
      }));

      setAllMangas(mapped);
      setMangas(applyCategoryFilter(mapped, category));
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToList(list: LibraryListKey, m: Manga) {
    try {
      if (!token) {
        showToast('Inicia sesión para guardar en tus listas.', 'info');
        return;
      }

      await saveToLibrary('manga', list, {
        id: m.id,
        title: m.title,
        image: m.image,
        meta: {
          author: m.author,
          chapters: m.chapters,
          status: m.status,
          genres: m.genres,
          rating: m.rating,
        },
      }, token);

      showToast('Guardado en tu lista.', 'success');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      showToast(msg || 'No se pudo guardar.', 'error');
    }
  }

  async function toggleLike(mangaId: string | number) {
    try {
      if (!token) {
        showToast('Inicia sesión para dar like.', 'info');
        return;
      }

      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/media/manga/${encodeURIComponent(String(mangaId))}/likes`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as any)?.error || 'No se pudo actualizar el like');

      setLikesById((prev) => ({
        ...prev,
        [String(mangaId)]: {
          likes: Number((data as any)?.likes) || 0,
          liked: Boolean((data as any)?.liked),
        },
      }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      showToast(msg || 'No se pudo actualizar el like', 'error');
    }
  }

  function onChange(v: string) {
    setQuery(v);
    if (timer.current) window.clearTimeout(timer.current);
    // debounce 400ms
    timer.current = window.setTimeout(() => fetchMangas(v), 400);
  }

  function onSearch(e?: React.FormEvent) {
    e?.preventDefault();
    fetchMangas(query.trim() || undefined);
  }

  const categoryOptions = Array.from(
    new Set(
      allMangas
        .flatMap((m) => (m.genres || []))
        .map((g) => String(g).trim())
        .filter((g) => g.length > 0 && !isBannedCategory(g))
    )
  ).sort((a, b) => a.localeCompare(b));

  function imgFor(m: Manga) {
    if (!m) return '';
    if (typeof m.image === 'string' && m.image.length > 0) return m.image;
    return coverDataUrl(((m.title || '')[0] || 'M'));
  }

  return (
    <section className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="page-title text-2xl md:text-2.5xl">MANGA</h2>
        </div>
        <form onSubmit={onSearch} className="flex items-center gap-3">
          <input
            value={query}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Buscar manga..."
            className="bg-dark text-gray-200 px-3 py-2 rounded-xl focus-ring w-full sm:w-64"
          />
          <select
            className="bg-dark text-gray-200 px-3 py-2 rounded-xl"
            value={category}
            onChange={(e) => {
              const next = e.target.value;
              setCategory(next);
              setMangas(applyCategoryFilter(allMangas, next || undefined));
            }}
          >
            <option value="">Todas las categorías</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button onClick={() => fetchMangas(query)} className="pixel-btn pixel-btn-primary pixel-btn-sm">Buscar</button>
        </form>
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : (
        <>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch" style={{ gridAutoRows: '1fr' }}>
            {paginatedMangas.map((m) => (
            <article
              key={m.id}
              className="relative rounded-xl border border-grid shadow-md h-full"
              style={{
                backgroundImage: `url(${imgFor(m)})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {/* overlay oscuro + blur */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'color-mix(in srgb, var(--color-bg) 70%, transparent)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
              />

              <div className="relative z-10 p-4 flex flex-col gap-3 h-full">
                {/* póster central */}
                <div className="relative flex items-center justify-center flex-1">
                  <div className="w-40 h-52 border-2 border-white/80 bg-black/40 overflow-hidden flex items-center justify-center" style={{ imageRendering: 'pixelated' }}>
                    <img
                      src={imgFor(m)}
                      alt={`${m.title} cover`}
                      className="w-full h-full object-contain object-center"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = coverDataUrl(((m.title || '')[0]) || 'M');
                      }}
                    />
                  </div>
                </div>

                <Link to={`/manga/${m.id}`} className="min-w-0 pointer-events-auto">
                  <h3 className="text-lg font-semibold text-white truncate hover:text-accentLime transition">{m.title}</h3>
                  <div className="text-xs text-muted-dim truncate">{(m.genres || []).join(' • ')}</div>
                </Link>

                <div className="mt-auto flex items-center justify-between gap-3">
                  <div className="text-xs text-muted-dim">
                    {m.chapters ? `${m.chapters} caps` : ''}
                    {m.chapters && m.status ? ' • ' : ''}
                    {m.status ? m.status : ''}
                  </div>
                  <div className="flex items-center gap-2 pointer-events-auto">
                    <LikeButton
                      liked={Boolean(likesById[String(m.id)]?.liked)}
                      count={likesById[String(m.id)]?.likes ?? 0}
                      onClick={() => toggleLike(m.id)}
                      ariaPressed={Boolean(likesById[String(m.id)]?.liked)}
                    />

                    <details className="relative">
                      <summary className="pixel-btn pixel-btn-primary pixel-btn-sm flex items-center justify-center gap-1 list-none cursor-pointer min-w-12 min-h-9">
                        + AÑADIR
                      </summary>
                      <div className="absolute right-0 bottom-full mb-2 min-w-40 bg-black border-4 border-accentLime rounded-lg overflow-hidden shadow-lg z-50">
                        {(
                          [
                            { key: 'favorites', label: '★ Favoritos' },
                            { key: 'later', label: '⏱ Más tarde' },
                          ] as const
                        ).map((opt) => (
                          <button
                            key={opt.key}
                            type="button"
                            className="w-full text-left px-4 py-3 pixel-font text-xs text-white hover:bg-accentLime hover:text-black transition-all whitespace-nowrap font-bold tracking-wide"
                            onClick={(e) => {
                              handleAddToList(opt.key, m);
                              const d = (e.currentTarget as HTMLButtonElement).closest('details');
                              if (d) d.open = false;
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </details>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8 mb-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-md bg-panel hover:bg-panel/80 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
            >
              ← Anterior
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-md transition text-sm font-medium ${
                    currentPage === page
                      ? 'bg-accentViolet text-white'
                      : 'bg-panel hover:bg-panel/80'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-md bg-panel hover:bg-panel/80 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
            >
              Siguiente →
            </button>
          </div>
        )}
        </>
      )}
    </section>
  );
}
