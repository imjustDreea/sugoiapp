import { useEffect, useState } from "react";
import type { Manga } from "../../types";
import MangaCard from "../manga/MangaCard";

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

function toAuthorString(value: unknown): string | undefined {
  const names = toNameList(value);
  if (names.length === 0) return undefined;
  return names.join(', ');
}

export default function MangaPage() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [allMangas, setAllMangas] = useState<Manga[]>([]);
  const [query, setQuery] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch initial list (no query -> backend may return defaults/trending)
    fetchMangas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyCategoryFilter(items: Manga[], cat?: string): Manga[] {
    if (!cat) return items;
    const c = String(cat).toLowerCase();
    return items.filter((m) => (m.genres || []).some((g) => String(g).toLowerCase() === c));
  }

  async function fetchMangas(q?: string) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      // Pedimos sin filtro para poder construir el selector de categorías
      params.set('limit', '60');
      const url = `/api/manga/search?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j: unknown = await res.json();
      const itemsRaw = isRecord(j) ? j.results : undefined;
      const items: RawItem[] = Array.isArray(itemsRaw) ? (itemsRaw as RawItem[]) : [];

      // Map backend items to our `Manga` type as best-effort
      const mapped: Manga[] = items.map((it: RawItem) => ({
        id: (() => {
          const idRaw = it.id ?? it.slug ?? it._id;
          return (typeof idRaw === 'string' || typeof idRaw === 'number') ? idRaw : JSON.stringify(it);
        })(),
        title: (() => {
          const t = it.title;
          const n = it.name;
          const attributes = isRecord(it.attributes) ? it.attributes : undefined;
          const at = attributes ? attributes.title : undefined;
          const raw = isRecord(it.raw) ? it.raw : undefined;
          const rt = raw ? raw.title : undefined;
          if (typeof t === 'string') return t;
          if (typeof n === 'string') return n;
          if (typeof at === 'string') return at;
          if (typeof rt === 'string') return rt;
          return 'Untitled';
        })(),
        image: (() => {
          const raw = isRecord(it.raw) ? it.raw : undefined;
          const candidates = [it.image, it.cover, it.thumbnail, raw?.image, raw?.cover, raw?.thumbnail];
          const found = candidates.find((x) => typeof x === 'string' && x.length > 0);
          return typeof found === 'string' ? found : undefined;
        })(),
        author: (() => {
          const raw = isRecord(it.raw) ? it.raw : undefined;
          const rawAuthor = raw ? (raw.author ?? raw.authors) : undefined;
          return toAuthorString(it.author ?? it.authors ?? rawAuthor);
        })(),
        chapters: (() => {
          const raw = isRecord(it.raw) ? it.raw : undefined;
          const c = it.chapters ?? raw?.chapters;
          const n = typeof c === 'number' ? c : Number(c);
          return Number.isFinite(n) && n > 0 ? n : undefined;
        })(),
        status: (() => {
          const raw = isRecord(it.raw) ? it.raw : undefined;
          const s = it.status ?? raw?.status;
          return typeof s === 'string' ? s : undefined;
        })(),
        rating: (() => {
          const raw = isRecord(it.raw) ? it.raw : undefined;
          const s = it.score ?? it.rating ?? raw?.rating;
          return typeof s === 'number' ? s : undefined;
        })(),
        genres: (() => {
          const raw = isRecord(it.raw) ? it.raw : undefined;
          return toNameList(it.genres ?? raw?.genres);
        })(),
      }));

      setAllMangas(mapped);
      setMangas(applyCategoryFilter(mapped, category).slice(0, 24));
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  function handleAdd(m: Manga) { console.log('Add manga', m?.id, m?.title); }

  function onSearch(e?: React.FormEvent) {
    e?.preventDefault();
    fetchMangas(query.trim() || undefined);
  }

  const categoryOptions = Array.from(
    new Set(
      allMangas
        .flatMap((m) => (m.genres || []))
        .map((g) => String(g).trim())
        .filter((g) => g.length > 0)
    )
  ).sort((a, b) => a.localeCompare(b));

  return (
    <section className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Manga</h2>
          <p className="text-sm text-muted-foreground mt-1">Listado desde la API de manga.</p>
        </div>
        <form onSubmit={onSearch} className="flex items-center gap-3">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar manga..." className="px-3 py-2 rounded-md bg-panel border border-grid text-white text-sm" />
          <select
            value={category}
            onChange={(e) => {
              const next = e.target.value;
              setCategory(next);
              setMangas(applyCategoryFilter(allMangas, next || undefined).slice(0, 24));
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

