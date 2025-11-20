type Manga = {
  id: number;
  title: string;
  author: string;
  chapters: number;
  status: "Ongoing" | "Completed" | string;
  rating: number;
  genres: string[];
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

export default function MangaCard({ manga, onAdd }: { manga: Manga; onAdd?: (m: Manga) => void }) {
  return (
    <article className="relative rounded-xl border border-grid bg-darkCard p-4 shadow-md overflow-hidden h-full">
      <div className="flex flex-col sm:flex-row gap-4 h-full">
        <div className="relative w-full sm:w-28 md:w-32 lg:w-36 h-36 sm:h-32 rounded-md overflow-hidden flex-shrink-0">
          <img src={coverDataUrl(manga.title.split(" ")[0])} alt={`${manga.title} cover`} className="w-full h-full object-cover object-center" />
          <div className="absolute top-2 right-2 bg-panel border border-grid px-2 py-1 rounded-md flex items-center gap-2 text-sm text-white">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{color: 'var(--accent-lime)'}}><path d="M12 .587l3.668 7.431L24 9.75l-6 5.848L19.335 24 12 20.201 4.665 24 6 15.598 0 9.75l8.332-1.732z"/></svg>
            <span className="font-medium">{manga.rating}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-white truncate">{manga.title}</h3>
              <p className="text-sm text-muted truncate">{manga.author}</p>
            </div>
          </div>

          <div className="mt-3 text-sm text-muted flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span>📚</span>
              <span className="text-sm">{manga.chapters} chapters</span>
            </div>
            <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${manga.status === 'Ongoing' ? 'status-ongoing' : 'status-other'}`}>{manga.status}</div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-auto">
            <div className="text-xs text-muted-dim truncate max-w-[50%]">{manga.genres.join(', ')}</div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button className="w-full sm:w-auto px-3 py-1 rounded-md btn-accent text-sm font-semibold">Read Now</button>
              <button aria-label="add" onClick={() => onAdd?.(manga)} className="w-8 h-8 rounded-full bg-transparent border border-grid-weak text-white flex items-center justify-center">+</button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
