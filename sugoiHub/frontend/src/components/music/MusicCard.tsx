import type { Music } from "../../types";

function coverDataUrl(seed: string, accent = '#8FD3FE') {
  const svg = `
  <svg xmlns='http://www.w3.org/2000/svg' width='300' height='160'>
    <rect width='100%' height='100%' rx='8' fill='${accent}' />
    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='20' fill='#0f0d12' font-family='Arial, Helvetica, sans-serif' font-weight='700'>${seed}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function MusicCard({ album, onAdd }: { album: Music; onAdd?: (m: Music) => void }) {
  return (
    <article className="relative rounded-xl border border-grid bg-darkCard p-4 shadow-md overflow-hidden h-full">
      <div className="flex gap-4 h-full">
        <div className="w-28 h-28 rounded-md overflow-hidden flex-shrink-0">
          <img src={coverDataUrl(((album.title || '').split(' ')[0]) || 'A')} alt={`${album.title} cover`} className="w-full h-full object-cover object-center" />
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <h3 className="text-lg font-semibold text-white truncate">{album.title}</h3>
          <p className="text-sm text-muted truncate">{album.artist}</p>

          <div className="mt-3 text-sm text-muted flex-1">
            <div className="mb-2 flex items-center gap-2 text-xs">
              <span>🎵</span>
              <span>{album.tracks ?? '—'} tracks</span>
            </div>
            <div className="inline-block px-2 py-1 rounded text-xs font-medium status-other">{(album.genres || []).join(', ')}</div>
          </div>

          <div className="flex items-center gap-2 mt-auto">
            <button className="px-3 py-1 rounded-md btn-accent text-sm font-semibold">Play</button>
            <button aria-label="add" onClick={() => onAdd?.(album)} className="w-8 h-8 rounded-full bg-transparent border border-grid-weak text-white flex items-center justify-center">+</button>
          </div>
        </div>
      </div>
    </article>
  );
}
