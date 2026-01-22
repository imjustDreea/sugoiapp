import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LikeButton from "../ui/LikeButton";
import { AuthContext } from "../../context/AuthContext";
import type { Game, LibraryListKey } from "../../types";
import { getApiBase } from "../../lib/apiBase";

function coverDataUrl(seed: string, accent = '#BA8CFF') {
  const svg = `
  <svg xmlns='http://www.w3.org/2000/svg' width='300' height='160'>
    <rect width='100%' height='100%' rx='8' fill='${accent}' />
    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='28' fill='#0f0d12' font-family='Arial, Helvetica, sans-serif' font-weight='700'>${seed}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function GameCard({
  game,
  onAddToList,
}: {
  game: Game;
  onAddToList?: (list: LibraryListKey, g: Game) => void;
}) {
  const auth = useContext(AuthContext);
  const token = auth?.token;
  const apiBase = getApiBase();
  
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const res = await fetch(`${apiBase}/api/media/games/${encodeURIComponent(String(game.id))}/likes`, {
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
    if (game.id && token) {
      fetchLikes();
    }
  }, [game.id, token, apiBase]);

  const toggleLike = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiBase}/api/media/games/${encodeURIComponent(String(game.id))}/likes`, {
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

  const imgSrc = game.image || coverDataUrl(game.title.split(' ')[0]);

  return (
    <article className="relative rounded-xl border border-grid bg-darkCard p-3 shadow-md h-full">
      <div className="flex flex-col sm:flex-row gap-3 h-full">
        <Link to={`/games/${game.id}`} className="w-full sm:w-36 h-28 sm:h-20 rounded-md overflow-hidden shrink-0">
          <img src={imgSrc} alt="cover" className="w-full h-full object-cover object-center" />
        </Link>

        <div className="flex-1 min-w-0 flex flex-col">
          <Link to={`/games/${game.id}`}>
            <h3 className="text-lg font-semibold text-white truncate hover:text-accentLime transition">{game.title}</h3>
          </Link>
          <p className="text-sm text-muted truncate">{game.studio}</p>

                  <div className="mt-2 text-sm text-muted flex-1">
                    <div className="mb-2 flex items-center gap-2 text-xs">
                      <span className="text-yellow-400">🎮</span>
                      <span>{(game.platforms || []).join(', ')}</span>
                    </div>
                    <div className="inline-block px-2 py-1 rounded text-xs font-medium status-other">{game.genre || ''}</div>
                  </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-auto">
            <div className="text-xs text-muted-dim truncate max-w-[50%]">&nbsp;</div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
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
                        onAddToList?.(opt.key, game);
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
      </div>
    </article>
  );
}
