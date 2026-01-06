import { useEffect, useState } from "react";
import type { Game } from "../../types";
import GameCard from "../games/GameCard";

type RawItem = Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

function toNameList(value: unknown): string[] {
  if (!value) return [];
  const arr = Array.isArray(value) ? value : [value];
  return arr
    .map((x) => {
      if (typeof x === 'string') return x;
      if (isRecord(x)) {
        const n = x.name;
        const t = x.title;
        if (typeof n === 'string') return n;
        if (typeof t === 'string') return t;
      }
      return null;
    })
    .filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [query, setQuery] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyCategoryFilter(items: Game[], cat?: string): Game[] {
    if (!cat) return items;
    const c = String(cat).toLowerCase();
    return items.filter((g) => String(g.genre || '').toLowerCase() === c);
  }

  async function fetchGames(q?: string) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      // Pedimos sin filtro para poder construir el selector de categorías
      params.set('limit', '60');
      const url = `/api/games/search?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j: unknown = await res.json();
      const itemsRaw = isRecord(j) ? j.results : undefined;
      const items: RawItem[] = Array.isArray(itemsRaw) ? (itemsRaw as RawItem[]) : [];

      const mapped: Game[] = items.map((it: RawItem) => ({
        id: (() => {
          const idRaw = it.id ?? it.slug ?? it._id;
          return (typeof idRaw === 'string' || typeof idRaw === 'number') ? idRaw : JSON.stringify(it);
        })(),
        title: (() => {
          const t = it.title;
          const n = it.name;
          const raw = isRecord(it.raw) ? it.raw : undefined;
          const rt = raw ? raw.title : undefined;
          if (typeof t === 'string') return t;
          if (typeof n === 'string') return n;
          if (typeof rt === 'string') return rt;
          return 'Untitled';
        })(),
        image: (() => {
          const raw = isRecord(it.raw) ? it.raw : undefined;
          const candidates = [it.image, it.thumbnail, it.thumb, raw?.thumbnail, raw?.thumb];
          const found = candidates.find((x) => typeof x === 'string' && x.length > 0);
          return typeof found === 'string' ? found : undefined;
        })(),
        studio: (() => {
          const raw = isRecord(it.raw) ? it.raw : undefined;
          const candidates = [it.studio, it.publisher, raw?.studio];
          const found = candidates.find((x) => typeof x === 'string' && x.length > 0);
          return typeof found === 'string' ? found : undefined;
        })(),
        platforms: (() => {
          const raw = isRecord(it.raw) ? it.raw : undefined;
          return toNameList(it.platforms ?? raw?.platforms);
        })(),
        genre: (() => {
          if (typeof it.genre === 'string') return it.genre;
          const list = toNameList(it.genres);
          return list[0] ?? undefined;
        })(),
        rating: (() => {
          const s = it.score;
          const r = it.rating;
          if (typeof s === 'number') return s;
          if (typeof r === 'number') return r;
          return undefined;
        })(),
      }));

      setAllGames(mapped);
      setGames(applyCategoryFilter(mapped, category).slice(0, 24));
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  function handleAdd(g: Game) { console.log('Add game', g?.id, g?.title); }

  function onSearch(e?: React.FormEvent) {
    e?.preventDefault();
    fetchGames(query.trim() || undefined);
  }

  const categoryOptions = Array.from(
    new Set(
      allGames
        .map((g) => (g.genre ? String(g.genre).trim() : ''))
        .filter((x) => x.length > 0)
    )
  ).sort((a, b) => a.localeCompare(b));

  return (
    <section className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Games</h2>
          <p className="text-sm text-muted-foreground mt-1">Listado desde la API de juegos.</p>
        </div>
        <form onSubmit={onSearch} className="flex items-center gap-3">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar juegos..." className="px-3 py-2 rounded-md bg-panel border border-grid text-white text-sm" />
          <select
            value={category}
            onChange={(e) => {
              const next = e.target.value;
              setCategory(next);
              setGames(applyCategoryFilter(allGames, next || undefined).slice(0, 24));
            }}
            className="px-3 py-2 rounded-md bg-panel border border-grid text-white text-sm"
          >
            <option value="">Todas las categorías</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
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
