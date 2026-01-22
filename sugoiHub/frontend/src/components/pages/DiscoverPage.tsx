import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

type DiscoveredUser = {
  id: number;
  username: string;
  name: string;
  last_name: string;
  avatar_url: string | null;
  bio: string | null;
  badges: string[] | null;
  common_favorites: number;
  common_badges: string[];
  compatibility_score: number;
  is_following: boolean;
};

export default function DiscoverPage() {
  const auth = useContext(AuthContext);
  const token = auth?.token;
  const { showToast } = useToast();

  const [users, setUsers] = useState<DiscoveredUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followLoading, setFollowLoading] = useState<Record<number, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, [token]);

  async function loadUsers() {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/profile/discover', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error cargando usuarios');
      setUsers(data.users || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  async function handleFollowToggle(user: DiscoveredUser) {
    if (!token) return;

    setFollowLoading(prev => ({ ...prev, [user.id]: true }));
    try {
      const method = user.is_following ? 'DELETE' : 'POST';
      const res = await fetch(`/api/profile/follow/${user.id}`, {
        method,
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error');

      setUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, is_following: !u.is_following } : u
      ));
      showToast(user.is_following ? 'Dejaste de seguir' : 'Siguiendo', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error', 'error');
    } finally {
      setFollowLoading(prev => ({ ...prev, [user.id]: false }));
    }
  }

  function getCompatibilityLabel(score: number): { text: string; color: string } {
    if (score >= 50) return { text: 'Alta compatibilidad', color: 'text-accentLime' };
    if (score >= 20) return { text: 'Compatibilidad media', color: 'text-accentViolet' };
    if (score > 0) return { text: 'Algo en común', color: 'text-gray-400' };
    return { text: 'Nuevo usuario', color: 'text-gray-500' };
  }

  // Filtrar usuarios por búsqueda
  const filteredUsers = users.filter(user => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const name = (user.name || '').toLowerCase();
    const username = (user.username || '').toLowerCase();
    return name.includes(query) || username.includes(query);
  });

  if (loading) {
    return (
      <section className="py-6 px-4 sm:px-5 lg:px-6 max-w-6xl mx-auto w-full">
        <div className="mb-6">
          <h2 className="page-title text-2xl md:text-2.5xl">DESCUBRIR</h2>
        </div>
        <div className="crt-frame">
          <div className="crt-inner p-6 text-center">
            <p className="text-muted">Cargando usuarios...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!token) {
    return (
      <section className="py-6 px-4 sm:px-5 lg:px-6 max-w-6xl mx-auto w-full">
        <div className="mb-6">
          <h2 className="page-title text-2xl md:text-2.5xl">DESCUBRIR</h2>
        </div>
        <div className="crt-frame">
          <div className="crt-inner p-6 text-center">
            <p className="text-muted mb-4">Inicia sesión para descubrir personas con gustos similares</p>
            <Link to="/login" className="inline-flex h-10 px-5 rounded-lg bg-accentLime/20 hover:bg-accentLime/30 transition text-white border border-accentLime/40 font-medium text-sm items-center">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 px-4 sm:px-5 lg:px-6 max-w-6xl mx-auto w-full">
      <div className="mb-6">
        <h2 className="page-title text-2xl md:text-2.5xl">DESCUBRIR</h2>
        
        {/* Buscador */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="Buscar por nombre o username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 px-4 rounded-lg bg-panel border border-grid text-white placeholder-gray-500 focus:outline-none focus:border-accentLime transition"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 crt-frame">
          <div className="crt-inner p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </div>
      )}

      {users.length === 0 ? (
        <div className="crt-frame">
          <div className="crt-inner p-6 text-center">
            <p className="text-muted">No hay usuarios para mostrar. Agrega más favoritos para encontrar personas con gustos similares.</p>
          </div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="crt-frame">
          <div className="crt-inner p-6 text-center">
            <p className="text-muted">No se encontraron usuarios con ese nombre.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map(user => {
            const displayName = user.name || user.username || 'Usuario';
            const initials = (user.username || user.name || 'U').trim().slice(0, 2).toUpperCase();
            const compat = getCompatibilityLabel(user.compatibility_score);
            const isLoading = followLoading[user.id] || false;

            return (
              <div key={user.id} className="bg-panel border border-grid rounded-xl p-4 shadow-card hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <Link to={`/u/${user.username}`} className="shrink-0">
                    <div className="w-16 h-16 rounded-xl bg-black border-2 border-grid flex items-center justify-center overflow-hidden">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="pixel-font text-sm text-accentLime">{initials}</span>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/u/${user.username}`} className="hover:text-accentLime transition">
                      <h3 className="font-semibold text-white truncate">{displayName}</h3>
                    </Link>
                    <p className="text-xs text-muted truncate">@{user.username}</p>
                    
                    <div className={`text-xs mt-1 ${compat.color}`}>
                      {compat.text}
                    </div>
                  </div>
                </div>

                {/* Badges */}
                {user.badges && user.badges.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {user.badges.map((badge, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-accentViolet/10 text-accentViolet border border-accentViolet/20">
                        {badge}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="mt-3 flex items-center gap-3 text-xs text-muted">
                  {user.common_favorites > 0 && (
                    <div className="flex items-center gap-1">
                      <span>❤️</span>
                      <span>{user.common_favorites} en común</span>
                    </div>
                  )}
                  {user.common_badges.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span>✨</span>
                      <span>{user.common_badges.length} badge{user.common_badges.length > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {user.bio && (
                  <p className="mt-2 text-xs text-gray-400 line-clamp-2">{user.bio}</p>
                )}

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <Link 
                    to={`/u/${user.username}`}
                    className="flex-1 h-9 px-3 rounded-lg bg-white/5 hover:bg-white/10 transition text-white border border-white/10 font-medium text-sm flex items-center justify-center"
                  >
                    Ver perfil
                  </Link>
                  <button
                    onClick={() => handleFollowToggle(user)}
                    disabled={isLoading}
                    className={`pixel-btn pixel-btn-sm ${
                      user.is_following
                        ? 'pixel-btn-secondary'
                        : 'pixel-btn-primary'
                    }`}
                  >
                    {isLoading ? '...' : user.is_following ? '✓' : '+'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
