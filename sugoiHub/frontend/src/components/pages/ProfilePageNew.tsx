import { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getLibraryItems, removeFromLibrary, type LibraryItem, type LibraryType } from '../../lib/library';
import { applyTheme, saveThemeToLocalStorage, type NeonTheme } from '../../theme';
import Button from '../ui/Button';

type FilterMode = 'all' | 'favorites' | 'later' | 'progress';

type UnifiedLibraryItem = LibraryItem & {
  type: LibraryType;
  list: 'favorites' | 'later';
};

type Profile = {
  user_id: number;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  theme: Partial<NeonTheme> | null;
  badges?: string[] | null;
};

export default function ProfilePageNew() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const token = auth?.token;
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [unifiedLibrary, setUnifiedLibrary] = useState<UnifiedLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ followers: 0, following: 0, likes: 0 });

  const displayName = user?.name || user?.username || 'Perfil';
  const displayUsername = user?.username ? `@${user.username}` : '';
  const initials = (user?.username || user?.name || 'U').trim().slice(0, 2).toUpperCase();

  const authHeaders = useMemo((): Record<string, string> => {
    return token ? { Authorization: `Bearer ${token}` } : {};
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

  const bioDisplay = useMemo(() => {
    const raw = (profile?.bio ?? '').trim();
    if (raw) return raw;
    return 'Player desde siempre.\nAnime, manga y videojuegos en modo nostalgia + hype.';
  }, [profile?.bio]);

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
          const statsRes = await fetch(`/api/profile/stats/${p.user_id}`);
          const statsData = await statsRes.json();
          if (statsData.ok && !cancelled) {
            setStats(statsData.stats);
          }
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

  useEffect(() => {
    loadLibrary();
  }, [token]);

  async function loadLibrary() {
    if (!token) return;
    setLoading(true);
    try {
      const types: LibraryType[] = ['anime', 'manga', 'games', 'music'];
      const allItems: UnifiedLibraryItem[] = [];

      for (const type of types) {
        const favs = await getLibraryItems(type, 'favorites', token);
        const later = await getLibraryItems(type, 'later', token);

        favs.forEach(item => allItems.push({ ...item, type, list: 'favorites' }));
        later.forEach(item => allItems.push({ ...item, type, list: 'later' }));
      }

      // Ordenar por fecha más reciente
      allItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setUnifiedLibrary(allItems);
    } catch (e) {
      console.error('Error loading library:', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(item: UnifiedLibraryItem) {
    if (!token) return;
    try {
      await removeFromLibrary(item.type, item.list, item.external_id, token);
      setUnifiedLibrary(prev => prev.filter(i => 
        !(i.external_id === item.external_id && i.type === item.type && i.list === item.list)
      ));
      showToast('Eliminado de la biblioteca', 'success');
    } catch (e) {
      showToast('Error al eliminar', 'error');
    }
  }

  // Filtrar items según el modo seleccionado
  const filteredLibrary = unifiedLibrary.filter(item => {
    if (filterMode === 'all') return true;
    if (filterMode === 'favorites') return item.list === 'favorites';
    if (filterMode === 'later') return item.list === 'later';
    return true;
  });

  // Agrupar por tipo
  const groupedByType = filteredLibrary.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<LibraryType, UnifiedLibraryItem[]>);

  // Estadísticas dinámicas
  const totalItems = unifiedLibrary.length;
  const favoritesCount = unifiedLibrary.filter(i => i.list === 'favorites').length;
  const laterCount = unifiedLibrary.filter(i => i.list === 'later').length;

  const typeLabels: Record<LibraryType, string> = {
    anime: 'Anime',
    manga: 'Manga',
    games: 'Juegos',
    music: 'Música'
  };

  const typeIcons: Record<LibraryType, string> = {
    anime: '📺',
    manga: '📖',
    games: '🎮',
    music: '🎵'
  };

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

      <div className="crt-frame mb-6">
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

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate('/profile/edit')}
                      >
                        <span className="text-lg">✎</span> Editar perfil
                      </Button>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-6 max-w-md mx-auto md:mx-0">
                      <div className="text-center md:text-left">
                        <p className="text-xl md:text-2xl font-bold text-white">{stats.followers}</p>
                        <p className="text-xs text-muted">Seguidores</p>
                      </div>
                      <div className="text-center md:text-left">
                        <p className="text-xl md:text-2xl font-bold text-white">{stats.following}</p>
                        <p className="text-xs text-muted">Siguiendo</p>
                      </div>
                      <div className="text-center md:text-left">
                        <p className="text-xl md:text-2xl font-bold text-white">{stats.likes}</p>
                        <p className="text-xs text-muted">Me gusta</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm text-white/80 whitespace-pre-line leading-relaxed">
                        {bioDisplay}
                      </p>
                    </div>

                    {profile?.badges && profile.badges.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                        {profile.badges.map((badge, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 rounded-full bg-accentLime/10 border border-accentLime/30 text-xs font-semibold text-accentLime"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selector global de filtros */}
      <div className="bg-panel border border-grid rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-white">Mi Biblioteca</h2>
            <div className="flex items-center gap-2 text-sm text-muted">
              <span>{totalItems} items</span>
              <span>•</span>
              <span>{favoritesCount} favoritos</span>
              <span>•</span>
              <span>{laterCount} por ver</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant={filterMode === 'all' ? 'primary' : 'default'}
              size="sm"
              onClick={() => setFilterMode('all')}
            >
              Todo
            </Button>
            <Button
              variant={filterMode === 'favorites' ? 'primary' : 'default'}
              size="sm"
              onClick={() => setFilterMode('favorites')}
            >
              ❤️ Favoritos
            </Button>
            <Button
              variant={filterMode === 'later' ? 'primary' : 'default'}
              size="sm"
              onClick={() => setFilterMode('later')}
            >
              🕐 Por empezar
            </Button>
          </div>
        </div>
      </div>

      {/* Grid de categorías */}
      {loading ? (
        <div className="text-center text-muted py-12">Cargando biblioteca...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(['anime', 'manga', 'games', 'music'] as LibraryType[]).map(type => {
            const items = groupedByType[type] || [];
            
            return (
              <div key={type} className="bg-panel border border-grid rounded-xl overflow-hidden" style={{ minHeight: '400px' }}>
                <div className="p-4 border-b border-grid flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>{typeIcons[type]}</span>
                    {typeLabels[type]}
                  </h3>
                  <span className="text-sm text-muted">{items.length} items</span>
                </div>

                <div className="p-4 overflow-y-auto" style={{ maxHeight: '500px' }}>
                  {items.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-3">{typeIcons[type]}</div>
                      <p className="text-muted mb-4">No hay {typeLabels[type].toLowerCase()} en tu biblioteca</p>
                      <Link
                        to={`/${type}`}
                        className="inline-block px-4 py-2 bg-accentLime/20 hover:bg-accentLime/30 border border-accentLime/40 rounded-lg text-white text-sm transition"
                      >
                        Explorar {typeLabels[type]}
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {items.map(item => (
                        <div key={`${item.type}-${item.list}-${item.external_id}`} className="flex gap-3 p-3 bg-dark border border-grid rounded-lg hover:border-accentLime/30 transition group">
                          <img
                            src={item.image_url || '/placeholder.png'}
                            alt={item.title}
                            className="w-16 h-20 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/${item.type}/${item.external_id}`}
                              className="font-medium text-white hover:text-accentLime line-clamp-1"
                            >
                              {item.title}
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                item.list === 'favorites'
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-blue-500/20 text-blue-400'
                              }`}>
                                {item.list === 'favorites' ? '❤️ Favorito' : '🕐 Por ver'}
                              </span>
                              <span className="text-xs text-muted">
                                {new Date(item.created_at).toLocaleDateString('es')}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="danger"
                            size="icon-sm"
                            onClick={() => handleRemove(item)}
                            className="opacity-0 group-hover:opacity-100"
                            title="Eliminar"
                          >
                            ✕
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resumen dinámico */}
      {!loading && totalItems > 0 && (
        <div className="mt-6 bg-panel border border-grid rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Actividad reciente</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(['anime', 'manga', 'games', 'music'] as LibraryType[]).map(type => {
              const count = unifiedLibrary.filter(i => i.type === type).length;
              return (
                <div key={type} className="text-center p-4 bg-dark border border-grid rounded-lg">
                  <div className="text-3xl mb-2">{typeIcons[type]}</div>
                  <div className="text-2xl font-bold text-white">{count}</div>
                  <div className="text-sm text-muted">{typeLabels[type]}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
