import { useEffect, useState } from "react";
import type { Game } from "../../types";
import GameCard from "../games/GameCard";

type RawItem = Record<string, any>;

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchGames(); }, []);

  async function fetchGames(q?: string) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      params.set('limit', '24');
      const url = `/api/games/search?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json();
      const items: RawItem[] = j.results || [];

      const mapped: Game[] = items.map((it: RawItem) => ({
        id: it.id ?? it.slug ?? it._id ?? JSON.stringify(it),
        title: it.title ?? it.name ?? it.raw?.title ?? 'Untitled',
        studio: it.studio ?? it.publisher ?? it.raw?.studio ?? undefined,
        platforms: Array.isArray(it.platforms) ? it.platforms : (it.raw?.platforms || []).map ? it.raw.platforms : [],
        genre: it.genre ?? it.genres?.[0] ?? undefined,
        rating: it.score ?? it.rating ?? undefined,
      }));

      setGames(mapped);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  function handleAdd(g: any) { console.log('Add game', g?.id, g?.title); }

  function onSearch(e?: React.FormEvent) {
    e?.preventDefault();
    fetchGames(query.trim() || undefined);
  }

  return (
    <section className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Games</h2>
          <p className="text-sm text-muted-foreground mt-1">Listado desde la API de juegos.</p>
        </div>
        <form onSubmit={onSearch} className="flex items-center gap-3">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar juegos..." className="px-3 py-2 rounded-md bg-panel border border-grid text-white text-sm" />
          <button type="submit" className="px-3 py-2 rounded-md btn-accent text-sm font-semibold">Buscar</button>
        </form>
      </div>

      {loading && <div className="text-sm text-muted mb-4">Cargando juegos…</div>}
      {error && <div className="text-sm text-red-400 mb-4">Error: {error}</div>}

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch" style={{ gridAutoRows: '1fr' }}>
        {games.length === 0 && !loading ? (
          <div className="text-sm text-muted">No se encontraron juegos.</div>
        ) : (
          games.map((g) => (
            <div className="h-full" key={g.id}>
              <GameCard game={g} onAdd={handleAdd} />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
