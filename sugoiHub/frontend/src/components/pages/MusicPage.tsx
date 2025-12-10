import { useEffect, useState } from "react";
import type { Music } from "../../types";
import MusicCard from "../music/MusicCard";

type RawItem = Record<string, any>;

export default function MusicPage(){
  const [albums, setAlbums] = useState<Music[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchAlbums(); }, []);

  async function fetchAlbums(q?: string){
    setLoading(true); setError(null);
    try{
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      params.set('limit','24');
      const url = `/api/music/search?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json();
      const items: RawItem[] = j.results || [];

      const mapped: Music[] = items.map((it: RawItem) => ({
        id: it.id ?? it.slug ?? it._id ?? JSON.stringify(it),
        title: it.title ?? it.name ?? it.raw?.title ?? 'Untitled',
        artist: it.artist ?? it.artists ?? it.raw?.artist ?? undefined,
        tracks: Number(it.tracks ?? it.raw?.tracks ?? 0) || undefined,
        year: Number(it.year ?? it.release_year ?? it.raw?.year) || undefined,
        rating: it.score ?? it.rating ?? undefined,
        genres: Array.isArray(it.genres) ? it.genres : (it.raw?.genres || []),
      }));

      setAlbums(mapped);
    }catch(e: any){
      setError(e?.message || String(e));
    }finally{ setLoading(false); }
  }

  function onSearch(e?: React.FormEvent){ e?.preventDefault(); fetchAlbums(query.trim() || undefined); }

  function handleAdd(a: any){ console.log('Add album', a?.id, a?.title); }

  return (
    <section className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Music</h2>
          <p className="text-sm text-muted mt-1">Tus playlists y lanzamientos favoritos.</p>
        </div>
        <form onSubmit={onSearch} className="flex items-center gap-3">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar música..." className="px-3 py-2 rounded-md bg-panel border border-grid text-white text-sm" />
          <button type="submit" className="px-3 py-2 rounded-md btn-accent text-sm font-semibold">Buscar</button>
        </form>
      </div>

      {loading && <div className="text-sm text-muted mb-4">Cargando música…</div>}
      {error && <div className="text-sm text-red-400 mb-4">Error: {error}</div>}

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch" style={{ gridAutoRows: '1fr' }}>
        {albums.length === 0 && !loading ? (
          <div className="text-sm text-muted">No se encontraron álbumes.</div>
        ) : (
          albums.map(a => (
            <div key={a.id} className="h-full">
              <MusicCard album={a} onAdd={handleAdd} />
            </div>
          ))
        )}
      </div>
    </section>
  )
}
