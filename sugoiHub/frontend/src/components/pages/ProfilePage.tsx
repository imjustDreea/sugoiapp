import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { applyTheme, saveThemeToLocalStorage, type NeonTheme } from '../../theme';
import {
  formatLibraryDate,
  getLibraryItems,
  getLibrarySummary,
  libraryCoverFallback,
  removeFromLibrary,
  type LibraryItem,
  type LibraryListKey,
  type LibraryType,
} from '../../lib/library';
import { useToast } from '../../context/ToastContext';

type Profile = {
  user_id: number;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  theme: Partial<NeonTheme> | null;
  badges?: string[] | null;
};

const BADGE_OPTIONS = ['Retro Gamer', 'Otaku'] as const;
type BadgeOption = (typeof BADGE_OPTIONS)[number];

export default function ProfilePage() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const token = auth?.token;
  const { showToast } = useToast();

  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [libraryCounts, setLibraryCounts] = useState<{
    anime: { favorites: number; later: number };
    games: { favorites: number; later: number };
    manga: { favorites: number; later: number };
    music: { favorites: number; later: number };
  } | null>(null);

  const [libraryItems, setLibraryItems] = useState<
    Record<LibraryType, Record<LibraryListKey, LibraryItem[]>> | null
  >(null);

  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryError, setLibraryError] = useState<string | null>(null);

  const [activeList, setActiveList] = useState<LibraryListKey>('favorites');
  const [stats, setStats] = useState({ followers: 0, following: 0, likes: 0 });

  const displayName = user?.name || user?.username || 'Perfil';
  const displayUsername = user?.username ? `@${user.username}` : '';
  const initials = (user?.username || user?.name || 'U')
    .trim()
    .slice(0, 2)
    .toUpperCase();

  const authHeaders = useMemo((): Record<string, string> => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!token) return;
      setError(null);
      try {
        const res = await fetch('/api/profile', { headers: authHeaders });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || 'No se pudo cargar el perfil');

        if (cancelled) return;
        const p = data.profile as Profile;
        setProfile(p);

        // Si hay tema guardado en perfil, lo aplicamos.
        if (p?.theme && typeof p.theme === 'object') {
          applyTheme(p.theme);
          saveThemeToLocalStorage(p.theme);
        }

        // Cargar estadísticas
        if (p?.user_id) {
          loadStats(p.user_id, cancelled);
        }
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Error cargando el perfil');
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token, authHeaders]);

  // Función para cargar estadísticas
  const loadStats = (userId: number, cancelled: boolean = false) => {
    fetch(`/api/profile/stats/${userId}`)
      .then(res => res.json())
      .then(statsData => {
        if (statsData.ok && !cancelled) {
          setStats(statsData.stats);
        }
      })
      .catch(() => {
        // Ignorar errores silenciosamente
      });
  };

  // Escuchar cambios en estadísticas desde otras páginas (ej: cuando se da like en CommunityPage)
  useEffect(() => {
    const handleStatsUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (user?.id === customEvent.detail.userId && user?.id) {
        loadStats(user.id);
      }
    };

    window.addEventListener('profileStatsUpdate', handleStatsUpdate);
    return () => {
      window.removeEventListener('profileStatsUpdate', handleStatsUpdate);
    };
  }, [user?.id]);

  useEffect(() => {
    let cancelled = false;

    async function loadLibrarySummary() {
      if (!token) {
        setLibraryCounts(null);
        return;
      }

      try {
        const counts = await getLibrarySummary(token);
        if (cancelled) return;
        setLibraryCounts(counts);
      } catch {
        if (cancelled) return;
        setLibraryCounts(null);
      }
    }

    loadLibrarySummary();
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    async function loadLibraryItems() {
      if (!token) {
        setLibraryItems(null);
        return;
      }

      try {
        setLibraryLoading(true);
        setLibraryError(null);
        const types: LibraryType[] = ['anime', 'games', 'manga', 'music'];
        const lists: LibraryListKey[] = ['favorites', 'later'];

        const entries = await Promise.all(
          types.flatMap((type) =>
            lists.map(async (list) => {
              const items = await getLibraryItems(type, list, token, 12);
              return [type, list, items] as const;
            })
          )
        );

        if (cancelled) return;

        const next: Record<LibraryType, Record<LibraryListKey, LibraryItem[]>> = {
          anime: { favorites: [], later: [] },
          games: { favorites: [], later: [] },
          manga: { favorites: [], later: [] },
          music: { favorites: [], later: [] },
        };

        for (const [type, list, items] of entries) {
          next[type][list] = items;
        }

        setLibraryItems(next);
      } catch {
        if (cancelled) return;
        setLibraryItems(null);
        setLibraryError('No se pudieron cargar tus listas.');
      } finally {
        if (!cancelled) setLibraryLoading(false);
      }
    }

    loadLibraryItems();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const bannerStyle = useMemo(() => {
    if (profile?.banner_url) {
      return {
        backgroundImage: `url(${profile.banner_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } as const;
    }

    return {
      backgroundImage: `linear-gradient(90deg,
        color-mix(in srgb, var(--accent-violet) 28%, transparent),
        color-mix(in srgb, var(--accent-lime) 18%, transparent),
        color-mix(in srgb, var(--accent-violet) 18%, transparent)
      )`
    } as const;
  }, [profile?.banner_url]);

  // En vista: solo aplicamos tema si el perfil lo trae

  const bioDisplay = useMemo(() => {
    const raw = (profile?.bio ?? '').trim();
    if (raw) return raw;
    return 'Player desde siempre.\nAnime, manga y videojuegos en modo nostalgia + hype.';
  }, [profile?.bio]);

  const aggregated = useMemo(() => {
    if (!libraryItems) {
      return {
        favorites: [] as Array<{ type: LibraryType; item: LibraryItem }>,
        later: [] as Array<{ type: LibraryType; item: LibraryItem }>,
      };
    }

    const favorites: Array<{ type: LibraryType; item: LibraryItem }> = [];
    const later: Array<{ type: LibraryType; item: LibraryItem }> = [];

    (Object.keys(libraryItems) as LibraryType[]).forEach((type) => {
      for (const it of libraryItems[type].favorites) favorites.push({ type, item: it });
      for (const it of libraryItems[type].later) later.push({ type, item: it });
    });

    function byCreatedDesc(a: { item: LibraryItem }, b: { item: LibraryItem }) {
      const ad = Date.parse(a.item.created_at || '') || 0;
      const bd = Date.parse(b.item.created_at || '') || 0;
      return bd - ad;
    }

    favorites.sort(byCreatedDesc);
    later.sort(byCreatedDesc);

    return {
      favorites: favorites.slice(0, 6),
      later: later.slice(0, 6),
    };
  }, [libraryItems]);

  function typeIcon(t: LibraryType) {
    switch (t) {
      case 'anime':
        return '📺';
      case 'games':
        return '🎮';
      case 'manga':
        return '📘';
      case 'music':
        return '🎵';
    }
  }

  function typeLabel(t: LibraryType) {
    switch (t) {
      case 'anime':
        return 'Anime';
      case 'games':
        return 'Juegos';
      case 'manga':
        return 'Manga';
      case 'music':
        return 'Música chiptune / OST';
    }
  }

  function listLabel(k: LibraryListKey) {
    return k === 'favorites' ? 'Favoritos' : 'Por empezar';
  }

  // function listIcon(k: LibraryListKey) {
  //   return k === 'favorites' ? '♥' : '✦';
  // }

  async function handleRemove(type: LibraryType, list: LibraryListKey, item: LibraryItem) {
    if (!token) return;
    const title = item.title;

    setLibraryItems((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        [type]: {
          ...prev[type],
          [list]: prev[type][list].filter((x) => x.external_id !== item.external_id),
        },
      };
      return next;
    });

    try {
      await removeFromLibrary(type, list, item.external_id, token);
      showToast('Eliminado de tu lista.', 'success');
    } catch (e) {
      // rollback
      setLibraryItems((prev) => {
        if (!prev) return prev;
        const restored = {
          ...prev,
          [type]: {
            ...prev[type],
            [list]: [item, ...prev[type][list]],
          },
        };
        return restored;
      });
      const msg = e instanceof Error ? e.message : String(e);
      showToast(msg || `No se pudo eliminar: ${title}`, 'error');
    }
  }

  function LibraryItemCard({
    type,
    list,
    item,
  }: {
    type: LibraryType;
    list: LibraryListKey;
    item: LibraryItem;
  }) {
    const cover = item.image_url || libraryCoverFallback(item.title, type === 'music' ? '#8FD3FE' : '#BA8CFF');
    
    return (
      <article className="group relative h-32 w-full rounded-xl bg-black border border-white/10 overflow-hidden shadow-lg transform transition-all hover:border-white/20 hover:shadow-xl">
         {/* Background Image - darker by default for readability */}
         <img 
            src={cover} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80"
            loading="lazy"
         />
         
         {/* Gradient for text protection */}
         <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

         <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
            <h4 className="text-sm font-bold text-white leading-tight line-clamp-1 drop-shadow-md mb-1.5">
              {item.title}
            </h4>
            <div className="flex items-center gap-2">
                 <span className="text-[10px] uppercase font-bold text-gray-200 bg-white/5 px-2 py-0.5 rounded backdrop-blur-md border border-white/5">
                    {type === 'music' ? 'OST' : type === 'games' ? 'Game' : typeLabel(type)}
                 </span>
            </div>
         </div>

         <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemove(type, list, item);
            }}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md border border-white/10 translate-y-[-0.5rem] group-hover:translate-y-0 z-20"
            title="Quitar de la lista"
          >
            <span className="text-xs font-bold">✕</span>
         </button>
      </article>
    );
  }

  function LibraryGrid({ list }: { list: LibraryListKey }) {
    const [page, setPage] = useState(1);

    useEffect(() => {
      setPage(1);
    }, [list]);

    if (!token) {
      return <p className="text-sm text-muted">Inicia sesión para ver tus listas.</p>;
    }

    if (libraryLoading) {
      return <p className="text-sm text-muted">Cargando tus listas…</p>;
    }

    if (libraryError) {
      return <p className="text-sm text-red-400">{libraryError}</p>;
    }

    const rows: Array<{ type: LibraryType; item: LibraryItem }> = [];
    if (libraryItems) {
      (Object.keys(libraryItems) as LibraryType[]).forEach((type) => {
        for (const it of libraryItems[type][list]) rows.push({ type, item: it });
      });
    }

    rows.sort((a, b) => {
      const ad = Date.parse(a.item.created_at || '') || 0;
      const bd = Date.parse(b.item.created_at || '') || 0;
      return bd - ad;
    });

    if (rows.length === 0) {
      return (
        <div className="bg-panel rounded-xl border border-grid p-4">
          <p className="text-sm text-white font-semibold">Lista vacía</p>
          <p className="text-sm text-muted mt-1">Guarda algo en {listLabel(list)} desde Anime/Manga/Games/Music.</p>
        </div>
      );
    }

    const PAGE_SIZE = 2;
    const totalPages = Math.ceil(rows.length / PAGE_SIZE);
    const displayedRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-2.5">
          {displayedRows.map(({ type, item }) => (
            <LibraryItemCard key={`${type}:${list}:${item.external_id}`} type={type} list={list} item={item} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="pixel-btn pixel-btn-icon-sm"
            >
              ←
            </button>
            <span className="text-xs font-medium text-muted">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="pixel-btn pixel-btn-icon-sm"
            >
              →
            </button>
          </div>
        )}
      </div>
    );
  }

  function SmallSectionCard(props: {
    title: string;
    right?: React.ReactNode;
    children: React.ReactNode;
  }) {
    return (
      <div className="bg-panel rounded-xl border border-grid shadow-card">
        <div className="px-4 py-3 border-b border-grid flex items-center justify-between">
          <p className="pixel-field-label text-white/80">{props.title}</p>
          {props.right ? <div className="flex items-center gap-2">{props.right}</div> : null}
        </div>
        <div className="p-4">{props.children}</div>
      </div>
    );
  }

  function CollapsibleSectionCard(props: {
    title: string;
    right?: React.ReactNode;
    summaryHint?: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
  }) {
    return (
      <details
        className="group bg-panel rounded-xl border border-grid shadow-card overflow-hidden"
        open={props.defaultOpen}
      >
        <summary className="px-4 py-3 border-b border-grid flex items-center justify-between cursor-pointer list-none select-none">
          <div className="min-w-0 flex items-center gap-2">
            <p className="pixel-field-label text-white/80 truncate">{props.title}</p>
            {props.summaryHint ? <span className="text-xs text-muted">{props.summaryHint}</span> : null}
          </div>
          <div className="flex items-center gap-3">
            {props.right ? <div className="flex items-center gap-2">{props.right}</div> : null}
            <span className="text-muted transition-transform group-open:rotate-180" aria-hidden>
              ▾
            </span>
          </div>
        </summary>
        <div className="p-4">{props.children}</div>
      </details>
    );
  }

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto w-full">
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="page-title text-2xl md:text-2.5xl">PERFIL</h2>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 crt-frame">
          <div className="crt-inner p-4">
            <p className="text-sm text-muted">{error}</p>
          </div>
        </div>
      )}

      <div className="crt-frame">
        <div className="crt-inner">
          <div className="relative h-52 sm:h-60" style={bannerStyle}>
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(to bottom, transparent 40%, color-mix(in srgb, var(--color-bg) 88%, transparent) 100%)'
              }}
            />
          </div>

          <div className="px-4 sm:px-8 pb-6">
            <div className="relative -mt-12">
              <div className="bg-panel/95 backdrop-blur-xl border border-grid rounded-2xl p-6 shadow-2xl">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Avatar Column */}
                  <div className="shrink-0 flex justify-center md:justify-start">
                    <div className="-mt-6 md:-mt-8 w-32 h-32 md:w-36 md:h-36 rounded-2xl bg-black border-4 border-panel shadow-2xl flex items-center justify-center overflow-hidden relative z-20">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt="Avatar"
                          className="w-full h-full object-cover pixel-avatar"
                        />
                      ) : (
                        <span className="pixel-font text-2xl text-accentLime select-none">{initials}</span>
                      )}
                    </div>
                  </div>

                  {/* Info Column */}
                  <div className="flex-1 min-w-0 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="text-2xl md:text-3xl font-bold text-white truncate drop-shadow-md">
                          {displayName}
                        </h3>
                        <p className="text-accentLime font-medium">{displayUsername || '@usuario'}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate('/profile/edit')}
                        className="mx-auto md:mx-0 h-10 px-5 rounded-lg bg-white/5 hover:bg-white/10 transition text-white border border-white/10 font-medium text-sm flex items-center gap-2"
                      >
                        <span className="text-lg">✎</span> Editar perfil
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                      {(Array.isArray(profile?.badges) ? (profile!.badges as BadgeOption[]) : [])
                        .filter((b) => BADGE_OPTIONS.includes(b))
                        .map((b) => (
                          <span key={b} className="badge-chip">
                            {b}
                          </span>
                        ))}
                    </div>

                    {/* Sección de biografía y estadísticas */}
                    <div className="mt-5 pt-5 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Biografía */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-400 mb-2">Biografía</h4>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                          {bioDisplay}
                        </p>
                      </div>

                      {/* Estadísticas */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-400 mb-2">Estadísticas</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-300">
                            <span className="text-accentViolet">👥</span>
                            <span className="font-medium">{stats.followers}</span>
                            <span className="text-sm">Seguidores</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <span className="text-accentLime">❤️</span>
                            <span className="font-medium">{stats.likes}</span>
                            <span className="text-sm">Likes dados</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* En vista no mostramos campos editables */}

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <SmallSectionCard
                title="Mis listas"
                right={
                  <div className="card-header-actions">
                    <button
                      type="button"
                      className={`pixel-btn pixel-btn-sm ${
                        activeList === 'favorites' ? 'pixel-btn-primary' : ''
                      }`}
                      onClick={() => setActiveList('favorites')}
                    >
                      ♥ Favoritos
                    </button>
                    <button
                      type="button"
                      className={`pixel-btn pixel-btn-sm ${
                        activeList === 'later' ? 'pixel-btn-primary' : ''
                      }`}
                      onClick={() => setActiveList('later')}
                    >
                      ✦ Por empezar
                    </button>
                  </div>
                }
              >
                <LibraryGrid list={activeList} />
              </SmallSectionCard>

              <SmallSectionCard
                title="Resumen"
                right={
                  <div className="text-xs text-muted inline-flex items-center gap-3">
                    <span className="inline-flex items-center gap-1">
                      <span className="text-accentLime" aria-hidden>
                        ♥
                      </span>
                      <span>{aggregated.favorites.length}</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="text-accentViolet" aria-hidden>
                        ✦
                      </span>
                      <span>{aggregated.later.length}</span>
                    </span>
                  </div>
                }
              >
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-panel rounded-xl border border-grid p-4">
                    <p className="text-sm text-white font-semibold">Últimos favoritos</p>
                    <p className="text-xs text-muted mt-1">Los 6 últimos guardados en Favoritos (todos los tipos).</p>
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      {aggregated.favorites.length === 0 ? (
                        <p className="text-sm text-muted">Aún no hay elementos.</p>
                      ) : (
                        aggregated.favorites.map(({ type, item }) => (
                          <div key={`${type}:${item.external_id}`} className="flex items-center justify-between gap-3">
                            <div className="min-w-0 flex items-center gap-2">
                              <span className="text-sm" aria-hidden>
                                {typeIcon(type)}
                              </span>
                              <span className="text-sm text-white truncate">{item.title}</span>
                            </div>
                            <span className="text-xs text-muted-dim shrink-0">{formatLibraryDate(item.created_at)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="bg-panel rounded-xl border border-grid p-4">
                    <p className="text-sm text-white font-semibold">Últimos por empezar</p>
                    <p className="text-xs text-muted mt-1">Los 6 últimos guardados en Por empezar (todos los tipos).</p>
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      {aggregated.later.length === 0 ? (
                        <p className="text-sm text-muted">Aún no hay elementos.</p>
                      ) : (
                        aggregated.later.map(({ type, item }) => (
                          <div key={`${type}:${item.external_id}`} className="flex items-center justify-between gap-3">
                            <div className="min-w-0 flex items-center gap-2">
                              <span className="text-sm" aria-hidden>
                                {typeIcon(type)}
                              </span>
                              <span className="text-sm text-white truncate">{item.title}</span>
                            </div>
                            <span className="text-xs text-muted-dim shrink-0">{formatLibraryDate(item.created_at)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </SmallSectionCard>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {(['anime', 'games', 'manga', 'music'] as LibraryType[]).map((t) => {
                const favorites = libraryItems?.[t]?.favorites ?? [];
                const later = libraryItems?.[t]?.later ?? [];

                const headerRight = (
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span className="inline-flex items-center gap-1">
                      <span className="text-accentLime" aria-hidden>
                        ♥
                      </span>
                      <span>{libraryCounts ? libraryCounts[t].favorites : favorites.length}</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="text-accentViolet" aria-hidden>
                        ✦
                      </span>
                      <span>{libraryCounts ? libraryCounts[t].later : later.length}</span>
                    </span>
                  </div>
                );

                const hintCount =
                  (libraryCounts
                    ? libraryCounts[t].favorites + libraryCounts[t].later
                    : favorites.length + later.length) || 0;

                return (
                  <CollapsibleSectionCard
                    key={t}
                    title={`${typeIcon(t)} ${typeLabel(t)}`}
                    right={headerRight}
                    summaryHint={hintCount ? `(${hintCount})` : null}
                    defaultOpen={t === 'anime'}
                  >
                    <div className="grid grid-cols-1 gap-3">
                      <p className="text-sm text-muted">
                        Acceso rápido a tus items guardados en {typeLabel(t)}.
                      </p>

                      <div className="grid grid-cols-1 gap-3">
                        {(favorites.slice(0, 3) as LibraryItem[]).map((item) => (
                          <LibraryItemCard key={`fav:${t}:${item.external_id}`} type={t} list="favorites" item={item} />
                        ))}
                        {(later.slice(0, 3) as LibraryItem[]).map((item) => (
                          <LibraryItemCard key={`later:${t}:${item.external_id}`} type={t} list="later" item={item} />
                        ))}

                        {favorites.length + later.length === 0 ? (
                          <p className="text-sm text-muted">Aún no hay elementos en este tipo.</p>
                        ) : null}
                      </div>
                    </div>
                  </CollapsibleSectionCard>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-between gap-4 text-xs text-muted">
              <span className="truncate">{user?.email || '-'}</span>
              <span className="shrink-0">{auth?.loading ? 'Cargando…' : user ? 'Sesión activa' : 'Sin sesión'}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
