import { NavLink } from 'react-router-dom';
import { type ReactNode, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';

type MenuItemProps = {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  danger?: boolean;
  shortcut?: string;
};

type UserStats = {
  level: number;
  exp: number;
  maxExp: number;
  title: string;
  totalFavorites: number;
  totalLater: number;
};

function MenuItem({ icon, label, onClick, danger, shortcut }: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${
        danger
          ? 'text-red-400 hover:bg-red-500/10 hover:border-red-500/30 border border-transparent'
          : 'text-gray-300 hover:bg-accentLime/10 hover:text-accentLime border border-transparent hover:border-accentLime/20'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg" aria-hidden>
          {icon}
        </span>
        <span className="text-xs font-semibold tracking-wide pixel-font">{label}</span>
      </div>
      {shortcut && (
        <span className="text-[9px] text-muted pixel-font opacity-60 group-hover:opacity-100 transition-opacity">
          {shortcut}
        </span>
      )}
    </button>
  );
}

function PixelIconWrap({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center justify-center w-5 h-5" style={{ imageRendering: 'pixelated' }}>
      {children}
    </span>
  );
}

function PixelSearchIcon() {
  return (
    <PixelIconWrap>
      <svg width="20" height="20" viewBox="0 0 20 20" shapeRendering="crispEdges" aria-hidden>
        <rect x="2" y="2" width="10" height="10" fill="currentColor" opacity="0.15" />
        <rect x="3" y="3" width="8" height="8" fill="currentColor" opacity="0.25" />
        <rect x="4" y="4" width="6" height="6" fill="currentColor" />
        <rect x="12" y="12" width="2" height="2" fill="currentColor" />
        <rect x="14" y="14" width="2" height="2" fill="currentColor" />
        <rect x="15" y="15" width="2" height="2" fill="currentColor" />
      </svg>
    </PixelIconWrap>
  );
}

function PixelGearIcon() {
  return (
    <PixelIconWrap>
      <svg width="20" height="20" viewBox="0 0 20 20" shapeRendering="crispEdges" aria-hidden>
        <rect x="8" y="2" width="4" height="2" fill="currentColor" />
        <rect x="2" y="8" width="2" height="4" fill="currentColor" />
        <rect x="16" y="8" width="2" height="4" fill="currentColor" />
        <rect x="8" y="16" width="4" height="2" fill="currentColor" />
        <rect x="6" y="6" width="8" height="8" fill="currentColor" opacity="0.25" />
        <rect x="7" y="7" width="6" height="6" fill="currentColor" opacity="0.35" />
        <rect x="8" y="8" width="4" height="4" fill="currentColor" />
      </svg>
    </PixelIconWrap>
  );
}

function PixelAvatarIcon() {
  return (
    <PixelIconWrap>
      <svg width="20" height="20" viewBox="0 0 20 20" shapeRendering="crispEdges" aria-hidden>
        <rect x="4" y="3" width="12" height="12" rx="2" fill="currentColor" opacity="0.18" />
        <rect x="6" y="5" width="8" height="8" rx="2" fill="currentColor" opacity="0.28" />
        <rect x="8" y="7" width="1" height="1" fill="currentColor" />
        <rect x="11" y="7" width="1" height="1" fill="currentColor" />
        <rect x="9" y="10" width="2" height="1" fill="currentColor" />
        <rect x="6" y="14" width="8" height="2" fill="currentColor" opacity="0.35" />
      </svg>
    </PixelIconWrap>
  );
}

function PixelUserIcon() {
  return (
    <PixelIconWrap>
      <svg width="20" height="20" viewBox="0 0 20 20" shapeRendering="crispEdges" aria-hidden>
        <rect x="7" y="4" width="6" height="6" fill="currentColor" />
        <rect x="5" y="11" width="10" height="5" fill="currentColor" opacity="0.35" />
        <rect x="6" y="12" width="8" height="3" fill="currentColor" />
      </svg>
    </PixelIconWrap>
  );
}

function PixelDoorIcon() {
  return (
    <PixelIconWrap>
      <svg width="20" height="20" viewBox="0 0 20 20" shapeRendering="crispEdges" aria-hidden>
        <rect x="5" y="3" width="10" height="14" fill="currentColor" opacity="0.25" />
        <rect x="6" y="4" width="8" height="12" fill="currentColor" opacity="0.35" />
        <rect x="7" y="5" width="6" height="10" fill="currentColor" />
        <rect x="12" y="10" width="1" height="1" fill="rgba(0,0,0,0.45)" />
      </svg>
    </PixelIconWrap>
  );
}

export default function UserMenu({ onClose }: { onClose: () => void }) {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const token = auth?.token;
  const [stats, setStats] = useState<UserStats>({
    level: 1,
    exp: 0,
    maxExp: 100,
    title: 'Novato',
    totalFavorites: 0,
    totalLater: 0,
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const initials = (user?.username || user?.name || 'U').trim().slice(0, 2).toUpperCase();

  useEffect(() => {
    if (!token) return;
    
    async function loadProfile() {
      try {
        const res = await fetch('/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.profile?.avatar_url) {
          setAvatarUrl(data.profile.avatar_url);
        }
      } catch (e) {
        console.error('Error loading profile:', e);
      }
    }

    async function loadStats() {
      try {
        const res = await fetch('/api/library/summary', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.ok && data.counts) {
          const totalFavorites = 
            (data.counts.anime?.favorites || 0) + 
            (data.counts.manga?.favorites || 0) + 
            (data.counts.games?.favorites || 0) + 
            (data.counts.music?.favorites || 0);
          
          const totalLater = 
            (data.counts.anime?.later || 0) + 
            (data.counts.manga?.later || 0) + 
            (data.counts.games?.later || 0) + 
            (data.counts.music?.later || 0);
          
          const totalItems = totalFavorites + totalLater;
          
          // Sistema de nivel: cada 10 items = 1 nivel
          const level = Math.floor(totalItems / 10) + 1;
          const exp = totalItems % 10;
          const maxExp = 10;
          
          // Títulos desbloqueables
          let title = 'Novato';
          if (totalItems >= 100) title = 'Completionista';
          else if (totalItems >= 50) title = 'Coleccionista';
          else if (totalItems >= 25) title = 'Otaku';
          else if (totalItems >= 10) title = 'Explorador';
          
          setStats({
            level,
            exp,
            maxExp,
            title,
            totalFavorites,
            totalLater,
          });
        }
      } catch (e) {
        console.error('Error loading stats:', e);
      }
    }
    
    loadProfile();
    loadStats();
  }, [token]);

  const expPercentage = (stats.exp / stats.maxExp) * 100;

  return (
    <div 
      className="w-80 rounded-3xl p-1 user-menu-chromatic"
      role="menu" 
      aria-label="User menu"
      style={{
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
      }}
    >
      <div className="bg-black rounded-[22px] overflow-hidden">
          {/* Header con Avatar y User Info */}
          <div className="relative p-6 border-b-4 border-accentLime/20">
        
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div 
              className="w-20 h-20 bg-accentLime rounded-2xl border-4 border-black flex items-center justify-center overflow-hidden"
              style={{ 
                imageRendering: 'pixelated',
                boxShadow: '0 4px 12px rgba(191, 255, 0, 0.3)'
              }}
            >
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={user?.username || 'Avatar'}
                  className="w-full h-full object-cover"
                  style={{ imageRendering: 'auto' }}
                />
              ) : (
                <span className="pixel-font text-2xl text-black">{initials}</span>
              )}
            </div>
            {/* Nivel badge */}
            <div className="absolute -bottom-2 -right-2 bg-accentLime border-4 border-black rounded-lg px-3 py-1">
              <span className="pixel-font text-xs text-black font-bold">LV {stats.level}</span>
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <p className="pixel-font text-sm text-accentLime truncate mb-3 leading-tight font-bold">
              {user?.username || 'Usuario'}
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="pixel-font text-[9px] text-gray-400 font-bold">TÍTULO</span>
                <span className="pixel-font text-[9px] text-accentLime font-bold">{stats.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="pixel-font text-[9px] text-gray-400 font-bold">ITEMS</span>
                <span className="pixel-font text-[9px] text-white font-bold">{stats.totalFavorites + stats.totalLater}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de EXP */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="pixel-font text-[8px] text-accentLime tracking-wider font-bold">EXP</span>
            <span className="pixel-font text-[8px] text-white font-bold">
              {stats.exp} / {stats.maxExp}
            </span>
          </div>
          {/* Barra de progreso chunky */}
          <div className="h-4 bg-gray-800 rounded-lg border-3 border-gray-700 overflow-hidden">
            <div 
              className="h-full bg-accentLime transition-all duration-300"
              style={{ width: `${expPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navegación Principal */}
      <div className="px-4 py-4 space-y-3">
        <NavLink 
          to="/profile" 
          onClick={onClose} 
          className="group w-full flex items-center justify-center px-6 py-4 rounded-2xl transition-all bg-gray-800 hover:bg-accentLime/20 border-4 border-gray-700 hover:border-accentLime"
        >
          <span className="pixel-font text-sm tracking-wider text-white group-hover:text-accentLime font-bold">MI PERFIL</span>
        </NavLink>

        <button
          type="button"
          onClick={() => onClose()}
          className="group w-full flex items-center justify-center px-6 py-4 rounded-2xl transition-all bg-gray-800 hover:bg-accentLime/20 border-4 border-gray-700 hover:border-accentLime"
        >
          <span className="pixel-font text-sm tracking-wider text-white group-hover:text-accentLime font-bold">AJUSTES</span>
        </button>
      </div>

      {/* Separador */}
      <div className="mx-4 h-1 bg-gray-800" />

      {/* Botón de Salir */}
      <div className="px-4 py-4">
        <button
          type="button"
          onClick={() => {
            auth?.logout();
            onClose();
          }}
          className="group w-full flex items-center justify-center px-6 py-4 rounded-2xl transition-all bg-gray-800 hover:bg-red-500/20 border-4 border-gray-700 hover:border-red-500"
        >
          <span className="pixel-font text-sm tracking-wider text-white group-hover:text-red-400 font-bold">CERRAR SESIÓN</span>
        </button>
      </div>
      </div>
    </div>
  );
}
