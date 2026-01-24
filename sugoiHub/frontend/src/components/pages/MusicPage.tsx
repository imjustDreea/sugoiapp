import { useContext, useEffect, useState, useRef } from "react";
import { Link } from 'react-router-dom';
import type { LibraryListKey, Music } from "../../types";
import LikeButton from "../ui/LikeButton";
import { AuthContext } from "../../context/AuthContext";
import { saveToLibrary } from "../../lib/library";
import { useToast } from "../../context/ToastContext";
import { getApiBase } from "../../lib/apiBase";

type RawItem = Record<string, any>;

function coverDataUrl(seed: string, accent = '#8FD3FE') {
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

export default function MusicPage() {
  const auth = useContext(AuthContext);
  const token = auth?.token;
  const { showToast } = useToast();

  const [albums, setAlbums] = useState<Music[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [likesById, setLikesById] = useState<Record<string, { likes: number; liked: boolean }>>({});

  // Calcular albums paginados
  const totalPages = Math.ceil(albums.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedAlbums = albums.slice(startIdx, startIdx + itemsPerPage);

  useEffect(() => {
    fetchAlbums();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadLikes() {
      const ids = (albums || []).map((a) => String(a.id));
      if (ids.length === 0) return;

      const apiBase = getApiBase();
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const results = await Promise.all(
          ids.map(async (id) => {
            const res = await fetch(`${apiBase}/api/media/music/${encodeURIComponent(id)}/likes`, { headers });
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
  }, [albums, token]);

  async function fetchAlbums(q?: string) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      params.set('limit', '12');
      const apiBase = getApiBase();
      const url = `${apiBase}/api/music/search?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json();
      const items: RawItem[] = j.results || [];

      const mapped: Music[] = items.map((it: RawItem) => ({
        id: it.id ?? it.slug ?? it._id ?? JSON.stringify(it),
        title: it.title ?? it.name ?? it.raw?.title ?? 'Untitled',
        artist: it.artist ?? it.artists ?? it.raw?.artist ?? undefined,
        image: it.image ?? it.artworkUrl100 ?? it.raw?.image ?? undefined,
        tracks: Number(it.tracks ?? it.raw?.tracks ?? 0) || undefined,
        year: Number(it.year ?? it.release_year ?? it.raw?.year) || undefined,
        genres: Array.isArray(it.genres) ? it.genres : (it.raw?.genres || []),
      }));

      setAlbums(mapped);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToList(list: LibraryListKey, a: Music) {
    try {
      if (!token) {
        showToast('Inicia sesión para guardar en tus listas.', 'info');
        return;
      }

      await saveToLibrary(
        'music',
        list,
        {
          id: a.id,
          title: a.title,
          image: a.image,
          meta: {
            artist: a.artist,
            tracks: a.tracks,
            year: a.year,
            genres: a.genres,
          },
        },
        token
      );

      showToast('Guardado en tu lista.', 'success');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      showToast(msg || 'No se pudo guardar.', 'error');
    }
  }

  async function toggleLike(albumId: string | number) {
    try {
      if (!token) {
        showToast('Inicia sesión para dar like.', 'info');
        return;
      }

      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/media/music/${encodeURIComponent(String(albumId))}/likes`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as any)?.error || 'No se pudo actualizar el like');

      setLikesById((prev) => ({
        ...prev,
        [String(albumId)]: {
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
    timer.current = window.setTimeout(() => fetchAlbums(v), 400);
  }

  function onSearch(e?: React.FormEvent) {
    e?.preventDefault();
    fetchAlbums(query.trim() || undefined);
  }

  function imgFor(a: Music) {
    if (!a) return '';
    if (typeof a.image === 'string' && a.image.length > 0) return a.image;
    return coverDataUrl(((a.title || '')[0] || 'M'));
  }

  return (
    <section className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="page-title text-2xl md:text-2.5xl">MÚSICA</h2>
        </div>
        <form onSubmit={onSearch} className="flex items-center gap-3">
          <input
            value={query}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Buscar música..."
            className="bg-dark text-gray-200 px-3 py-2 rounded-xl focus-ring w-full sm:w-64"
          />
          <button onClick={() => fetchAlbums(query)} className="pixel-btn pixel-btn-primary pixel-btn-sm">Buscar</button>
        </form>
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : (
        <>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch" style={{ gridAutoRows: '1fr' }}>
            {paginatedAlbums.map((a) => (
            <article
              key={a.id}
              className="relative rounded-xl border border-grid shadow-md h-full"
              style={{
                backgroundImage: `url(${imgFor(a)})`,
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
                      src={imgFor(a)}
                      alt={`${a.title} cover`}
                      className="w-full h-full object-contain object-center"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = coverDataUrl(((a.title || '')[0]) || 'M');
                      }}
                    />
                  </div>
                </div>

                <Link to={`/music/${a.id}`} className="min-w-0 pointer-events-auto">
                  <h3 className="text-lg font-semibold text-white truncate hover:text-accentLime transition">{a.title}</h3>
                  <div className="text-xs text-muted-dim truncate">{a.artist || ''}</div>
                </Link>

                <div className="mt-auto flex items-center justify-between gap-3">
                  <div className="text-xs text-muted-dim">
                    {a.tracks ? `${a.tracks} canciones` : ''}
                    {a.tracks && a.year ? ' • ' : ''}
                    {a.year ? a.year : ''}
                  </div>
                  <div className="flex items-center gap-2 pointer-events-auto">
                    <LikeButton
                      liked={Boolean(likesById[String(a.id)]?.liked)}
                      count={likesById[String(a.id)]?.likes ?? 0}
                      onClick={() => toggleLike(a.id)}
                      ariaPressed={Boolean(likesById[String(a.id)]?.liked)}
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
                              handleAddToList(opt.key, a);
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

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8 mb-4">
            {/* Paginación */}
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
