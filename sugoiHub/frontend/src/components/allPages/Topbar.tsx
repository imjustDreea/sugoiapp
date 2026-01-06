import { Menu } from "lucide-react";
import Logo from './Logo';
import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import UserMenu from './UserMenu';

const Topbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header
      className="flex h-16 items-center justify-between bg-darkPanel px-6 border-b border-gray-800 relative text-[10px] sm:text-[11px]"
      style={{ fontFamily: "'Press Start 2P', monospace" }}
    >
      <div className="flex items-center gap-5">
        <Logo size="sm" showText={false} />
        <nav className="flex items-center gap-1 sm:gap-2">
          <NavLink
            to="/anime"
            className={({ isActive }: { isActive?: boolean }) =>
              `text-gray-300 link inline-flex items-center h-9 px-2 rounded-md transition-colors ${isActive ? 'active' : ''}`
            }
          >
            Anime
          </NavLink>
          <NavLink
            to="/manga"
            className={({ isActive }: { isActive?: boolean }) =>
              `text-gray-300 link inline-flex items-center h-9 px-2 rounded-md transition-colors ${isActive ? 'active' : ''}`
            }
          >
            Manga
          </NavLink>
          <NavLink
            to="/games"
            className={({ isActive }: { isActive?: boolean }) =>
              `text-gray-300 link inline-flex items-center h-9 px-2 rounded-md transition-colors ${isActive ? 'active' : ''}`
            }
          >
            Games
          </NavLink>
          <NavLink
            to="/music"
            className={({ isActive }: { isActive?: boolean }) =>
              `text-gray-300 link inline-flex items-center h-9 px-2 rounded-md transition-colors ${isActive ? 'active' : ''}`
            }
          >
            Music
          </NavLink>
        </nav>
      </div>

      <div className="flex items-center ml-auto">
        <div className="relative">
          <button
            type="button"
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="h-9 w-9 rounded-lg bg-panel btn-panel transition inline-flex items-center justify-center"
          >
            <Menu size={18} />
          </button>

          {menuOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40 cursor-default"
                aria-label="Cerrar menú"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 z-50">
                <UserMenu onClose={() => setMenuOpen(false)} />
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;