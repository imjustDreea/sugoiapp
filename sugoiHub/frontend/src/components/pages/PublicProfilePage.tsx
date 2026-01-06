import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { applyTheme, saveThemeToLocalStorage, type NeonTheme } from '../../theme';

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
  } | null;
};

export default function PublicProfilePage() {
  const { username } = useParams();
  const [data, setData] = useState<PublicProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
  }, [username]);

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
            <h2 className="page-title text-xl">Perfil</h2>
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
        <h2 className="page-title text-2xl md:text-2.5xl">Perfil</h2>
        <p className="text-sm text-muted mt-1 leading-relaxed">Vista pública del usuario.</p>
      </div>

      <div className="crt-frame">
        <div className="crt-inner">
          <div className="h-48 sm:h-56" style={bannerStyle} />

          <div className="px-4 sm:px-6 pb-6">
            <div className="-mt-12 flex items-end gap-4 flex-wrap">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-panel border border-grid flex items-center justify-center overflow-hidden shadow-card">
                {data.profile?.avatar_url ? (
                  <img src={data.profile.avatar_url} alt="Avatar" className="w-full h-full object-cover pixel-avatar" />
                ) : (
                  <span className="pixel-font text-[14px] text-accentLime select-none">{initials}</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl font-semibold text-white truncate">{displayName}</h3>
                  {displayUsername && <span className="text-sm text-muted truncate">{displayUsername}</span>}
                  <span className="pixel-badge">Retro Gamer + Otaku</span>
                </div>
                <p className="text-sm text-muted mt-2 leading-relaxed whitespace-pre-line">{bioDisplay}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="bg-dark rounded-xl p-4 border border-gray-800/60">
                <p className="pixel-field-label">⭐ Favoritos</p>
                <p className="mt-1 text-sm text-muted">Próximamente</p>
              </div>
              <div className="bg-dark rounded-xl p-4 border border-gray-800/60">
                <p className="pixel-field-label">⏳ Por empezar</p>
                <p className="mt-1 text-sm text-muted">Próximamente</p>
              </div>
              <div className="bg-dark rounded-xl p-4 border border-gray-800/60">
                <p className="pixel-field-label">👾 Juegos</p>
                <p className="mt-1 text-sm text-muted">Próximamente</p>
              </div>
              <div className="bg-dark rounded-xl p-4 border border-gray-800/60">
                <p className="pixel-field-label">📺 Anime</p>
                <p className="mt-1 text-sm text-muted">Próximamente</p>
              </div>
              <div className="bg-dark rounded-xl p-4 border border-gray-800/60">
                <p className="pixel-field-label">📘 Manga</p>
                <p className="mt-1 text-sm text-muted">Próximamente</p>
              </div>
              <div className="bg-dark rounded-xl p-4 border border-gray-800/60">
                <p className="pixel-field-label">🎵 Música chiptune / OST</p>
                <p className="mt-1 text-sm text-muted">Próximamente</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
