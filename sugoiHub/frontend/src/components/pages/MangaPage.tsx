import { useEffect, useState } from "react";
import type { Manga } from "../../types";
import MangaCard from "../manga/MangaCard";

type RawItem = Record<string, any>;

export default function MangaPage() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch initial list (no query -> backend may return defaults/trending)
    fetchMangas();
  }, []);

  async function fetchMangas(q?: string) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      params.set('limit', '24');
      const url = `/api/manga/search?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json();
      const items: RawItem[] = j.results || [];

      // Map backend items to our `Manga` type as best-effort
      const mapped: Manga[] = items.map((it: RawItem) => ({
        id: it.id ?? it.slug ?? it._id ?? JSON.stringify(it),
        title: it.title ?? it.name ?? it.attributes?.title ?? (it.raw?.title ?? 'Untitled'),
        author: it.author ?? it.authors ?? (it.raw && (it.raw.author || it.raw.authors)) ?? undefined,
        chapters: Number(it.chapters ?? it.raw?.chapters ?? 0) || undefined,
        status: it.status ?? it.raw?.status ?? undefined,
        rating: it.score ?? it.rating ?? it.raw?.rating ?? undefined,
        genres: (it.genres || it.raw?.genres || []).map ? (it.genres || it.raw?.genres) : (Array.isArray(it.genres) ? it.genres : []),
      }));

      setMangas(mapped);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  function handleAdd(m: any) {
    console.log('Add manga', m?.id, m?.title);
  }

  function onSearch(e?: React.FormEvent) {
    e?.preventDefault();
    fetchMangas(query.trim() || undefined);
  }

  return (
    <section className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Manga</h2>
          <p className="text-sm text-muted-foreground mt-1">Listado desde la API de manga.</p>
        </div>
        <form onSubmit={onSearch} className="flex items-center gap-3">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar manga..." className="px-3 py-2 rounded-md bg-panel border border-grid text-white text-sm" />
          <button type="submit" className="px-3 py-2 rounded-md btn-accent text-sm font-semibold">Buscar</button>
        </form>
      </div>

      {loading && <div className="text-sm text-muted mb-4">Cargando mangas…</div>}
      {error && <div className="text-sm text-red-400 mb-4">Error: {error}</div>}

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch" style={{ gridAutoRows: '1fr' }}>
        {mangas.length === 0 && !loading ? (
          <div className="text-sm text-muted">No se encontraron mangas.</div>
        ) : (
          mangas.map((m) => (
            <div className="h-full" key={m.id}>
              <MangaCard manga={m} onAdd={handleAdd} />
            </div>
          ))
        )}
      </div>
    </section>
  );
}

