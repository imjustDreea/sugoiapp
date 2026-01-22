import { useContext, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { applyTheme, saveThemeToLocalStorage, type NeonTheme } from '../../theme';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

type PublicProfile = {
  user: {
    id: number;
    username: string;
    name: string;
    last_name: string;
  };
  profile: {
    user_id: number;
    avatar_url: string | null;
    banner_url: string | null;
    bio: string | null;
    theme: Partial<NeonTheme> | null;
    badges?: string[] | null;
  } | null;
};

const BADGE_OPTIONS = ['Retro Gamer', 'Otaku'] as const;
type BadgeOption = (typeof BADGE_OPTIONS)[number];

export default function PublicProfilePage() {
  const { username } = useParams();
  const auth = useContext(AuthContext);
  const token = auth?.token;
  const { showToast } = useToast();

  const [data, setData] = useState<PublicProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [stats, setStats] = useState({ followers: 0, following: 0, likes: 0 });
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const u = String(username || '').trim();
        if (!u) throw new Error('Usuario inválido');

        const res = await fetch(`/api/profile/by-username/${encodeURIComponent(u)}`);
        const j = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(j?.error || 'No se pudo cargar el perfil');
        if (cancelled) return;

        setData(j as PublicProfile);
        const theme = (j?.profile?.theme || null) as Partial<NeonTheme> | null;
        if (theme && typeof theme === 'object') {
          applyTheme(theme);
          saveThemeToLocalStorage(theme);
        }

        // Cargar estadísticas
        const userId = (j as PublicProfile)?.user?.id;
        if (userId) {
          const statsRes = await fetch(`/api/profile/stats/${userId}`);
          const statsData = await statsRes.json();
          if (statsData.ok) {
            setStats(statsData.stats);
          }

          // Verificar si sigo a este usuario
          if (token) {
            const followRes = await fetch(`/api/profile/is-following/${userId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const followData = await followRes.json();
            if (followData.ok) {
              setIsFollowing(followData.isFollowing);
            }
          }
        }
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [username, token]);

  const handleFollowToggle = async () => {
    if (!token || !data?.user?.id) return;

    setFollowLoading(true);
    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const res = await fetch(`/api/profile/follow/${data.user.id}`, {
        method,
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error');

      setIsFollowing(!isFollowing);
      setStats(prev => ({
        ...prev,
        followers: isFollowing ? prev.followers - 1 : prev.followers + 1
      }));
      showToast(isFollowing ? 'Dejaste de seguir' : 'Siguiendo', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error', 'error');
    } finally {
      setFollowLoading(false);
    }
  };

  const bannerStyle = useMemo(() => {
    const banner = data?.profile?.banner_url;
    if (banner) {
      return {
        backgroundImage: `url(${banner})`,
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
  }, [data?.profile?.banner_url]);

  const bioDisplay = useMemo(() => {
    const raw = (data?.profile?.bio ?? '').trim();
    if (raw) return raw;
    return 'Player desde siempre.\nAnime, manga y videojuegos en modo nostalgia + hype.';
  }, [data?.profile?.bio]);

  if (loading) {
    return (
      <section className="py-10 px-4 max-w-6xl mx-auto w-full">
        <div className="pixel-screen flex items-center justify-center px-4 py-10">CARGANDO...</div>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="py-10 px-4 max-w-6xl mx-auto w-full">
        <div className="crt-frame">
          <div className="crt-inner p-6">
            <h2 className="page-title text-xl">PERFIL</h2>
            <p className="text-sm text-muted mt-3">{error || 'No encontrado'}</p>
            <Link to="/login" className="inline-flex mt-4 h-9 px-3 rounded-lg bg-panel btn-panel transition text-gray-200 border border-grid items-center">
              Ir a login
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const displayName = data.user?.name || data.user?.username || 'Perfil';
  const displayUsername = data.user?.username ? `@${data.user.username}` : '';
  const initials = (data.user?.username || data.user?.name || 'U').trim().slice(0, 2).toUpperCase();

  return (
    <section className="py-6 px-4 sm:px-5 lg:px-6 max-w-6xl mx-auto w-full">
      <div className="mb-6">
        <h2 className="page-title text-2xl md:text-2.5xl">PERFIL</h2>
      </div>

      <div className="crt-frame">
        <div className="crt-inner">
          <div className="relative h-48 sm:h-56" style={bannerStyle}>
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
                      {data.profile?.avatar_url ? (
                        <img
                          src={data.profile.avatar_url}
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

                      {token && (
                        <button
                          type="button"
                          onClick={handleFollowToggle}
                          disabled={followLoading}
                          className={`pixel-btn pixel-btn-sm ${
                            isFollowing ? 'pixel-btn-secondary' : 'pixel-btn-primary'
                          }`}
                        >
                          {followLoading ? '...' : isFollowing ? 'Siguiendo' : '+ Seguir'}
                        </button>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                      {(Array.isArray(data.profile?.badges) ? (data.profile!.badges as BadgeOption[]) : [])
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
          </div>
        </div>
      </div>
    </section>
  );
}
