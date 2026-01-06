import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { applyTheme, saveThemeToLocalStorage, type NeonTheme } from '../../theme';

type Profile = {
  user_id: number;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  theme: Partial<NeonTheme> | null;
};

export default function ProfilePage() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const token = auth?.token;

  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <section className="py-6 px-4 sm:px-5 lg:px-6 max-w-6xl mx-auto w-full">
      <div className="mb-6">
        <h2 className="page-title text-2xl md:text-2.5xl">Perfil</h2>
        <p className="text-sm text-muted mt-1 leading-relaxed">Avatar, banner, biografía y tema neón.</p>
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
          <div className="h-48 sm:h-56" style={bannerStyle} />

          <div className="px-4 sm:px-6 pb-6">
            <div className="-mt-12 flex items-end gap-4 flex-wrap">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-panel border border-grid flex items-center justify-center overflow-hidden shadow-card">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover pixel-avatar"
                  />
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

              <button
                type="button"
                className="h-9 px-3 rounded-lg bg-panel btn-panel transition text-gray-200 border border-grid"
                onClick={() => navigate('/profile/edit')}
              >
                Editar perfil
              </button>
            </div>

            {/* En vista no mostramos campos editables */}

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

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-dark rounded-xl p-4 border border-gray-800/60">
                <p className="pixel-field-label">Email</p>
                <p className="mt-1 text-sm text-white truncate">{user?.email || '-'}</p>
              </div>
              <div className="bg-dark rounded-xl p-4 border border-gray-800/60">
                <p className="pixel-field-label">Estado</p>
                <p className="mt-1 text-sm text-white">{auth?.loading ? 'Cargando…' : user ? 'Sesión activa' : 'Sin sesión'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
