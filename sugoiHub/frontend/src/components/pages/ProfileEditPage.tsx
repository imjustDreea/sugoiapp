import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { applyTheme, saveThemeToLocalStorage, THEME_PRESETS, type NeonTheme, type ThemeKey } from '../../theme';

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

export default function ProfileEditPage() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const token = auth?.token;
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [bio, setBio] = useState('');
  const [badges, setBadges] = useState<BadgeOption[]>([]);
  const [selectedThemeKey, setSelectedThemeKey] = useState<ThemeKey>('neon-noir');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<{ avatar: boolean; banner: boolean }>({ avatar: false, banner: false });
  const [error, setError] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

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
        setBio(p?.bio || '');
        setBadges((Array.isArray(p?.badges) ? (p.badges as BadgeOption[]) : []).filter((b) => BADGE_OPTIONS.includes(b)));

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

  async function saveProfile(payload: { bio?: string; theme?: Partial<NeonTheme>; badges?: BadgeOption[] }) {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {};
      if (typeof payload.bio === 'string') body.bio = payload.bio;
      if (payload.theme) body.theme = payload.theme;
      if (payload.badges) body.badges = payload.badges;

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify(body)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'No se pudo guardar');
      setProfile(data.profile as Profile);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error guardando el perfil');
    } finally {
      setSaving(false);
    }
  }

  function toggleBadge(b: BadgeOption) {
    setBadges((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));
  }

  async function uploadImage(kind: 'avatar' | 'banner', file: File) {
    if (!token) return;
    setUploading((s) => ({ ...s, [kind]: true }));
    setError(null);
    try {
      const fd = new FormData();
      fd.append(kind, file);
      const res = await fetch(`/api/profile/${kind}`, {
        method: 'POST',
        headers: {
          ...authHeaders
        },
        body: fd
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'No se pudo subir la imagen');
      setProfile(data.profile as Profile);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error subiendo imagen');
    } finally {
      setUploading((s) => ({ ...s, [kind]: false }));
    }
  }

  function selectTheme(key: ThemeKey) {
    setSelectedThemeKey(key);
    const theme = THEME_PRESETS[key];
    applyTheme(theme);
    saveThemeToLocalStorage(theme);
    void saveProfile({ theme });
  }

  const displayName = user?.name || user?.username || 'Perfil';
  const displayUsername = user?.username ? `@${user.username}` : '';

  return (
    <section className="py-6 px-4 sm:px-5 lg:px-6 max-w-6xl mx-auto w-full">
      <div className="mb-6 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="page-title text-2xl md:text-2.5xl">EDITAR PERFIL</h2>
        </div>

        <button
          type="button"
          className="pixel-btn pixel-btn-secondary pixel-btn-sm"
          onClick={() => navigate('/profile')}
        >
          Volver al perfil
        </button>
      </div>

      {error && (
        <div className="mb-4 crt-frame">
          <div className="crt-inner p-4">
            <p className="text-sm text-muted">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 crt-frame">
          <div className="crt-inner p-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <h3 className="text-xl font-semibold text-white truncate">{displayName}</h3>
                {displayUsername && <p className="text-sm text-muted truncate mt-1">{displayUsername}</p>}
              </div>

              <div className="flex items-center gap-2">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void uploadImage('avatar', f);
                    e.currentTarget.value = '';
                  }}
                />
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void uploadImage('banner', f);
                    e.currentTarget.value = '';
                  }}
                />

                <button
                  type="button"
                  className="pixel-btn pixel-btn-secondary pixel-btn-sm"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploading.avatar}
                >
                  {uploading.avatar ? 'Subiendo…' : 'Subir avatar'}
                </button>
                <button
                  type="button"
                  className="pixel-btn pixel-btn-secondary pixel-btn-sm"
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={uploading.banner}
                >
                  {uploading.banner ? 'Subiendo…' : 'Subir banner'}
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-dark rounded-xl p-4 border border-gray-800/60">
                <p className="pixel-field-label">Avatar actual</p>
                <div className="mt-3 w-full aspect-square max-w-[220px] rounded-xl border border-grid bg-panel overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover pixel-avatar" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted">(sin avatar)</div>
                  )}
                </div>
              </div>

              <div className="bg-dark rounded-xl p-4 border border-gray-800/60">
                <p className="pixel-field-label">Banner actual</p>
                <div className="mt-3 w-full h-[140px] rounded-xl border border-grid bg-panel overflow-hidden">
                  {profile?.banner_url ? (
                    <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted">(sin banner)</div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 bg-darkCard rounded-xl p-5 shadow-card border border-gray-800/60">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h4 className="pixel-font text-[12px] text-white">Biografía</h4>
                <button
                  type="button"
                  className="pixel-btn pixel-btn-primary pixel-btn-sm"
                  onClick={() => void saveProfile({ bio })}
                  disabled={saving}
                >
                  {saving ? 'Guardando…' : 'Guardar bio'}
                </button>
              </div>

              <textarea
                className="mt-3 w-full min-h-[140px] rounded-xl border border-grid bg-dark px-3 py-2 text-sm text-white outline-none focus-ring"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Escribe tu bio…"
              />
            </div>

            <div className="mt-4 bg-darkCard rounded-xl p-5 shadow-card border border-gray-800/60">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h4 className="pixel-font text-[12px] text-white">Nicks</h4>
                <button
                  type="button"
                  className="pixel-btn pixel-btn-primary pixel-btn-sm"
                  onClick={() => void saveProfile({ badges })}
                  disabled={saving}
                >
                  {saving ? 'Guardando…' : 'Guardar nicks'}
                </button>
              </div>

              <p className="text-sm text-muted mt-2 leading-relaxed">Elige tus etiquetas (se muestran en el perfil).</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {BADGE_OPTIONS.map((b) => {
                  const active = badges.includes(b);
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => toggleBadge(b)}
                      className={
                        active
                          ? 'h-9 px-3 rounded-lg btn-accent transition'
                          : 'h-9 px-3 rounded-lg bg-panel btn-panel transition text-gray-200 border border-grid'
                      }
                      aria-pressed={active}
                    >
                      {b}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-darkCard rounded-xl p-6 shadow-card border border-gray-800/60">
          <h4 className="pixel-font text-[12px] text-white">Tema neón</h4>
          <p className="text-sm text-muted mt-2 leading-relaxed">Cambia colores neón de toda la web.</p>

          <div className="mt-4 grid grid-cols-1 gap-2">
            {(Object.keys(THEME_PRESETS) as ThemeKey[]).map((key) => {
              const t = THEME_PRESETS[key];
              const active = selectedThemeKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => selectTheme(key)}
                  className={`h-11 rounded-xl border px-3 flex items-center justify-between transition ${
                    active ? 'border-accentPurple' : 'border-grid'
                  } bg-dark`}
                  title={key}
                >
                  <span className="pixel-font text-[10px] text-white">{key}</span>
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded" style={{ backgroundColor: t.colorBg }} />
                    <span className="w-4 h-4 rounded" style={{ backgroundColor: t.accentViolet }} />
                    <span className="w-4 h-4 rounded" style={{ backgroundColor: t.accentLime }} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
