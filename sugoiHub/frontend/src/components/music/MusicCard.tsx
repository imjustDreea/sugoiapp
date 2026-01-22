import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LikeButton from "../ui/LikeButton";
import { AuthContext } from "../../context/AuthContext";
import type { Music, LibraryListKey } from "../../types";
import { getApiBase } from "../../lib/apiBase";

function coverDataUrl(seed: string, accent = '#8FD3FE') {
  const svg = `
  <svg xmlns='http://www.w3.org/2000/svg' width='300' height='160'>
    <rect width='100%' height='100%' rx='8' fill='${accent}' />
    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='20' fill='#0f0d12' font-family='Arial, Helvetica, sans-serif' font-weight='700'>${seed}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function MusicCard({
  album,
  onAddToList,
}: {
  album: Music;
  onAddToList?: (list: LibraryListKey, m: Music) => void;
}) {
  const auth = useContext(AuthContext);
  const token = auth?.token;
  const apiBase = getApiBase();
  
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const res = await fetch(`${apiBase}/api/media/music/${encodeURIComponent(String(album.id))}/likes`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        setLikes(data?.likes || 0);
        setLiked(!!data?.liked);
      } catch (err) {
        console.error('Error fetching likes:', err);
      }
    };
    if (album.id && token) {
      fetchLikes();
    }
  }, [album.id, token, apiBase]);

  const toggleLike = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiBase}/api/media/music/${encodeURIComponent(String(album.id))}/likes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      setLikes(data?.likes || 0);
      setLiked(!!data?.liked);
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const coverUrl = album.image
    ? String(album.image).replace('100x100', '300x300')
    : coverDataUrl(((album.title || '').split(' ')[0]) || 'A');

  return (
    <article className="relative rounded-xl border border-grid bg-darkCard p-4 shadow-md h-full">
      <div className="flex gap-4 h-full">
        <Link to={`/music/${album.id}`} className="w-28 h-28 rounded-md overflow-hidden shrink-0">
          <img
            src={coverUrl}
            alt={`${album.title} cover`}
            className="w-full h-full object-cover object-center"
            loading="lazy"
            onError={(e) => {
              const img = e.currentTarget;
              img.onerror = null;
              img.src = coverDataUrl(((album.title || '').split(' ')[0]) || 'A');
            }}
          />
        </Link>
        <div className="flex-1 min-w-0 flex flex-col">
          <Link to={`/music/${album.id}`}>
            <h3 className="text-lg font-semibold text-white truncate hover:text-accentLime transition">{album.title}</h3>
          </Link>
          <p className="text-sm text-muted truncate">{album.artist}</p>

          <div className="mt-3 text-sm text-muted flex-1">
            <div className="mb-2 flex items-center gap-2 text-xs">
              <span>🎵</span>
              <span>{album.tracks ?? '—'} tracks</span>
            </div>
            <div className="inline-block px-2 py-1 rounded text-xs font-medium status-other">{(album.genres || []).join(', ')}</div>
          </div>

          <div className="flex items-center gap-2 mt-auto">
            <LikeButton
              liked={liked}
              count={likes}
              onClick={toggleLike}
            />
            <details className="relative">
              <summary className="pixel-btn pixel-btn-secondary pixel-btn-sm list-none cursor-pointer">
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
                      onAddToList?.(opt.key, album);
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
