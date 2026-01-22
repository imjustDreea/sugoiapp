import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LikeButton from "../ui/LikeButton";
import { AuthContext } from "../../context/AuthContext";
import type { Manga, LibraryListKey } from "../../types";
import { getApiBase } from "../../lib/apiBase";
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

export default function MangaCard({
  manga,
  onAddToList,
}: {
  manga: Manga;
  onAddToList?: (list: LibraryListKey, m: Manga) => void;
}) {
  const auth = useContext(AuthContext);
  const token = auth?.token;
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  // Cargar likes al montar el componente
  useEffect(() => {
    const fetchLikes = async () => {
      const apiBase = getApiBase();
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      try {
        const res = await fetch(`${apiBase}/api/media/manga/${encodeURIComponent(String(manga.id))}/likes`, { headers });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setLikes(0);
          setLiked(false);
          return;
        }
        setLikes(Number((data as any)?.likes) || 0);
        setLiked(Boolean((data as any)?.liked));
      } catch (err) {
        console.error('Error fetching manga likes:', err);
        setLikes(0);
        setLiked(false);
      }
    };

    if (manga.id && token) {
      fetchLikes();
    }
  }, [manga.id, token]);

  const toggleLike = async () => {
    if (!token) return;
    const apiBase = getApiBase();
    try {
      const res = await fetch(`${apiBase}/api/media/manga/${encodeURIComponent(String(manga.id))}/likes`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return;
      setLikes(Number((data as any)?.likes) || 0);
      setLiked(Boolean((data as any)?.liked));
    } catch (err) {
      console.error('Error toggling manga like:', err);
    }
  };

  function imgFor(m: Manga) {
    return m.image || coverDataUrl(((m.title || "")[0] || 'M'));
  }

  function ratingFromScore(score?: number | null) {
    if (score == null || Number.isNaN(score)) return null;
    // Normalizamos a 0..5. Si viene en 0..10 (p.ej. 7.7), lo dividimos.
    const normalized = score > 5 ? score / 2 : score;
    return Math.max(0, Math.min(5, normalized));
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

  return (
    <article
      className="relative rounded-xl border border-grid shadow-md h-full"
      style={{
        backgroundImage: `url(${imgFor(manga)})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'color-mix(in srgb, var(--color-bg) 70%, transparent)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />

      <div className="relative z-10 p-4 flex flex-col gap-3 h-full pointer-events-none">
        <div className="flex items-center justify-end">
          <div className="bg-panel border border-grid px-2 py-1 rounded-md">
            <Stars score={manga.rating ?? null} />
          </div>
        </div>

        <Link to={`/manga/${manga.id}`} className="relative flex items-center justify-center pointer-events-auto">
          <div className="w-40 h-52 border-2 border-white/80 bg-black/40 overflow-hidden" style={{ imageRendering: 'pixelated' }}>
            <img
              src={imgFor(manga)}
              alt={`${manga.title} cover`}
              className="w-full h-full object-cover object-center"
            />
          </div>
        </Link>

        <Link to={`/manga/${manga.id}`} className="min-w-0 pointer-events-auto">
          <h3 className="text-lg font-semibold text-white truncate hover:text-accentLime transition">{manga.title}</h3>
          <p className="text-sm text-muted truncate">{manga.author || ''}</p>
          <div className="text-xs text-muted-dim truncate">{(manga.genres || []).join(' • ')}</div>
        </Link>

        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="text-xs text-muted-dim">
            {manga.chapters ? `${manga.chapters} ch` : ''}
            {manga.chapters && manga.status ? ' • ' : ''}
            {manga.status ? manga.status : ''}
          </div>
          <div className="flex items-center gap-2">
            <LikeButton
              liked={liked}
              count={likes}
              onClick={toggleLike}
            />
            <details className="relative pointer-events-auto">
              <summary className="pixel-btn pixel-btn-primary pixel-btn-sm list-none cursor-pointer">
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
                      onAddToList?.(opt.key, manga);
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
  );
}
