import type { Game } from "../../types";

function coverDataUrl(seed: string, accent = '#BA8CFF') {
  const svg = `
  <svg xmlns='http://www.w3.org/2000/svg' width='300' height='160'>
    <rect width='100%' height='100%' rx='8' fill='${accent}' />
    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='28' fill='#0f0d12' font-family='Arial, Helvetica, sans-serif' font-weight='700'>${seed}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function GameCard({ game, onAdd }: { game: Game; onAdd?: (g: Game) => void }) {
  return (
    <article className="relative rounded-xl border border-grid bg-darkCard p-3 shadow-md overflow-hidden h-full">
      <div className="flex flex-col sm:flex-row gap-3 h-full">
        <div className="w-full sm:w-36 h-28 sm:h-20 rounded-md overflow-hidden flex-shrink-0">
          <img src={coverDataUrl(game.title.split(' ')[0])} alt="cover" className="w-full h-full object-cover object-center" />
          <div className="absolute top-2 right-2 bg-panel border border-grid px-2 py-1 rounded-md flex items-center gap-2 text-sm text-white">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{color: 'var(--accent-lime)'}}><path d="M12 .587l3.668 7.431L24 9.75l-6 5.848L19.335 24 12 20.201 4.665 24 6 15.598 0 9.75l8.332-1.732z"/></svg>
            <span className="font-medium">{game.rating}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <h3 className="text-lg font-semibold text-white truncate">{game.title}</h3>
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
              <button className="w-full sm:w-auto px-3 py-1 rounded-md btn-accent text-sm font-semibold">Play</button>
              <button aria-label="add" onClick={() => onAdd?.(game)} className="w-8 h-8 rounded-full bg-transparent border border-grid-weak text-white flex items-center justify-center">+</button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
