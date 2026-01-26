import { getApiBase } from './apiBase';

export type LibraryType = 'anime' | 'games' | 'manga' | 'music';
export type LibraryListKey = 'favorites' | 'later';

export function isLibraryType(v: string): v is LibraryType {
  return v === 'anime' || v === 'games' || v === 'manga' || v === 'music';
}

export type SavePayload = {
  id: string | number;
  title: string;
  image?: string;
  meta?: Record<string, unknown>;
};

export type LibraryItem = {
  external_id: string;
  title: string;
  image_url: string | null;
  meta: unknown;
  created_at: string;
};

export function libraryCoverFallback(seed: string, accent = '#BA8CFF') {
  const initial = (seed || '?').trim().charAt(0).toUpperCase() || '?';
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='300'><defs><linearGradient id='g' x1='0' x2='1' y1='0' y2='1'><stop offset='0' stop-color='${accent}' stop-opacity='0.95'/><stop offset='1' stop-color='#0f0d12' stop-opacity='0.95'/></linearGradient></defs><rect width='100%' height='100%' fill='url(#g)' rx='14'/><text x='50%' y='54%' fill='#fff' font-family='Arial,Helvetica,sans-serif' font-weight='800' font-size='34' text-anchor='middle' dominant-baseline='middle' opacity='0.98'>${initial}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function formatLibraryDate(iso: string): string {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return '';
  return new Date(ms).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

export async function saveToLibrary(type: LibraryType, list: LibraryListKey, payload: SavePayload, token: string): Promise<void> {
  const apiBase = getApiBase();
  const endpoint = apiBase ? `${apiBase}/api/library/${type}` : `/api/library/${type}`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      list,
      id: payload.id,
      title: payload.title,
      image: payload.image ?? null,
      meta: payload.meta ?? null,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as any)?.error || 'No se pudo guardar en la lista');
  }
}

export async function getLibrarySummary(token: string): Promise<Record<LibraryType, Record<LibraryListKey, number>>> {
  const apiBase = getApiBase();
  const endpoint = apiBase ? `${apiBase}/api/library/summary` : `/api/library/summary`;
  const res = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.error || 'No se pudo cargar el resumen');

  const counts = (data as any)?.counts || {};
  return {
    anime: { favorites: Number(counts.anime?.favorites) || 0, later: Number(counts.anime?.later) || 0 },
    games: { favorites: Number(counts.games?.favorites) || 0, later: Number(counts.games?.later) || 0 },
    manga: { favorites: Number(counts.manga?.favorites) || 0, later: Number(counts.manga?.later) || 0 },
    music: { favorites: Number(counts.music?.favorites) || 0, later: Number(counts.music?.later) || 0 },
  };
}

export async function getLibraryItems(
  type: LibraryType,
  list: LibraryListKey,
  token: string,
  limit = 6
): Promise<LibraryItem[]> {
  const apiBase = getApiBase();
  const endpoint = apiBase ? `${apiBase}/api/library/${type}` : `/api/library/${type}`;
  const url = new URL(endpoint, window.location.origin);
  url.searchParams.set('list', list);
  url.searchParams.set('limit', String(limit));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.error || 'No se pudo cargar la lista');

  const items = (data as any)?.items;
  return Array.isArray(items) ? (items as LibraryItem[]) : [];
}

export async function removeFromLibrary(
  type: LibraryType,
  list: LibraryListKey,
  externalId: string,
  token: string
): Promise<void> {
  const apiBase = getApiBase();
  const endpoint = apiBase ? `${apiBase}/api/library/${type}/${encodeURIComponent(externalId)}` : `/api/library/${type}/${encodeURIComponent(externalId)}`;
  const url = new URL(endpoint, window.location.origin);
  url.searchParams.set('list', list);

  const res = await fetch(url.toString(), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as any)?.error || 'No se pudo eliminar de la lista');
  }
}
