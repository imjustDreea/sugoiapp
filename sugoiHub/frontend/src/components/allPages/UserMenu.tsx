import { NavLink } from 'react-router-dom';
import { type ReactNode, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

type MenuItemProps = {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  danger?: boolean;
};

function MenuItem({ icon, label, onClick, danger }: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`user-menu-item ${danger ? 'user-menu-danger' : ''}`}
    >
      <span className="user-menu-icon" aria-hidden>
        {icon}
      </span>
      <span className="user-menu-label">{label}</span>
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

  return (
    <div className="user-menu" role="menu" aria-label="User menu">
      <div className="user-menu-section">
        <div className="user-menu-searchRow">
          <span className="user-menu-searchIcon" aria-hidden>
            <PixelSearchIcon />
          </span>
          <input className="user-menu-search" placeholder="Search..." autoFocus />
        </div>
      </div>

      <div className="user-menu-divider" />

      <div className="user-menu-section">
        <MenuItem icon={<PixelGearIcon />} label="Ajustes" onClick={() => onClose()} />
      </div>

      <div className="user-menu-divider" />

      <div className="user-menu-user">
        <div className="user-menu-avatar" aria-hidden>
          <PixelAvatarIcon />
        </div>
        <div className="min-w-0">
          <p className="user-menu-username truncate">{user?.username || 'Usuario'}</p>
          <p className="user-menu-email truncate">{user?.email || '—'}</p>
        </div>
      </div>

      <div className="user-menu-divider" />

      <div className="user-menu-section">
        <NavLink to="/profile" onClick={onClose} className="user-menu-link">
          <span className="user-menu-icon" aria-hidden>
            <PixelUserIcon />
          </span>
          <span className="user-menu-label">Mi perfil</span>
        </NavLink>
        <MenuItem
          icon={<PixelDoorIcon />}
          label="Cerrar sesión"
          danger
          onClick={() => {
            auth?.logout();
            onClose();
          }}
        />
      </div>
    </div>
  );
}
