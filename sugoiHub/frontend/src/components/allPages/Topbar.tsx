import { Menu } from "lucide-react";
import Logo from './Logo';
import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import UserMenu from './UserMenu';

const Topbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      {/* Topbar Fijo */}
      <header
        className="w-full h-16 flex items-center justify-center bg-darkPanel border-b border-gray-800/50 px-6 text-[10px] sm:text-[11px]"
        style={{ fontFamily: "'Press Start 2P', monospace" }}
      >
        {/* Contenedor centrado con max-width */}
        <div className="w-full max-w-7xl flex items-center justify-between">
          {/* Logo a la izquierda */}
          <div className="flex items-center gap-5">
            <Logo size="sm" showText={false} />
            
            {/* Nav Desktop - Centrado */}
            <nav className="hidden sm:flex items-center gap-1 sm:gap-2 absolute left-1/2 transform -translate-x-1/2">
              <NavLink
                to="/anime"
                className={({ isActive }: { isActive?: boolean }) =>
                  `text-gray-300 link inline-flex items-center h-9 px-2 rounded-md transition-colors ${isActive ? 'active text-accentLime' : 'hover:text-white'}`
                }
              >
                Anime
              </NavLink>
              <NavLink
                to="/manga"
                className={({ isActive }: { isActive?: boolean }) =>
                  `text-gray-300 link inline-flex items-center h-9 px-2 rounded-md transition-colors ${isActive ? 'active text-accentLime' : 'hover:text-white'}`
                }
              >
                Manga
              </NavLink>
              <NavLink
                to="/games"
                className={({ isActive }: { isActive?: boolean }) =>
                  `text-gray-300 link inline-flex items-center h-9 px-2 rounded-md transition-colors ${isActive ? 'active text-accentLime' : 'hover:text-white'}`
                }
              >
                Juegos
              </NavLink>
              <NavLink
                to="/music"
                className={({ isActive }: { isActive?: boolean }) =>
                  `text-gray-300 link inline-flex items-center h-9 px-2 rounded-md transition-colors ${isActive ? 'active text-accentLime' : 'hover:text-white'}`
                }
              >
                Música
              </NavLink>
            </nav>

            {/* Botón Menu Móvil */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden h-9 w-9 rounded-lg bg-panel hover:bg-panel/80 transition inline-flex items-center justify-center"
              aria-label="Abrir menú de navegación"
            >
              <Menu size={18} />
            </button>
          </div>

          {/* Menu de usuario a la derecha */}
          <div className="flex items-center">
            <div className="relative">
              <button
                type="button"
                aria-label="Abrir menú de usuario"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
                className="h-9 w-9 rounded-lg bg-panel hover:bg-panel/80 btn-panel transition inline-flex items-center justify-center"
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
        </div>
      </header>

      {/* Menú Móvil Expandible */}
      {mobileMenuOpen && (
        <div className="fixed top-16 left-0 right-0 bg-darkPanel border-b border-gray-800 z-20 sm:hidden">
          <nav className="flex flex-col p-4 space-y-2 max-w-7xl mx-auto">
            <NavLink
              to="/anime"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }: { isActive?: boolean }) =>
                `text-gray-300 link block px-4 py-3 rounded-md transition-colors ${isActive ? 'active text-accentLime bg-gray-800/50' : 'hover:bg-gray-800/30 hover:text-white'}`
              }
            >
              Anime
            </NavLink>
            <NavLink
              to="/manga"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }: { isActive?: boolean }) =>
                `text-gray-300 link block px-4 py-3 rounded-md transition-colors ${isActive ? 'active text-accentLime bg-gray-800/50' : 'hover:bg-gray-800/30 hover:text-white'}`
              }
            >
              Manga
            </NavLink>
            <NavLink
              to="/games"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }: { isActive?: boolean }) =>
                `text-gray-300 link block px-4 py-3 rounded-md transition-colors ${isActive ? 'active text-accentLime bg-gray-800/50' : 'hover:bg-gray-800/30 hover:text-white'}`
              }
            >
              Juegos
            </NavLink>
            <NavLink
              to="/music"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }: { isActive?: boolean }) =>
                `text-gray-300 link block px-4 py-3 rounded-md transition-colors ${isActive ? 'active text-accentLime bg-gray-800/50' : 'hover:bg-gray-800/30 hover:text-white'}`
              }
            >
              Música
            </NavLink>
          </nav>
        </div>
      )}
    </>
  );
};

export default Topbar;