import { Settings, Search, X, LogOut } from "lucide-react";
import Logo from './Logo';
import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'

const Topbar = () => {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const [showOverlay, setShowOverlay] = useState(false)
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleOpen = () => {
    setShowOverlay(true)
    requestAnimationFrame(() => setOverlayOpen(true))
  }

  const handleClose = () => {
    setOverlayOpen(false)
    window.setTimeout(() => setShowOverlay(false), 220)
  }

  const handleLogout = () => {
    auth?.logout();
    navigate('/login');
  }

  return (
    <header className="flex items-center justify-between bg-darkPanel px-6 py-4 border-b border-gray-800 relative" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.5rem' }}>
      <div className="flex items-center gap-6">
        <Logo size="xs" showText={false} />
        <nav className="flex space-x-2 sm:space-x-4">
  <NavLink to="/anime" className={({ isActive }: { isActive?: boolean })=> `text-gray-300 link ${isActive? 'active' : ''}`}>Anime</NavLink>
  <NavLink to="/manga" className={({ isActive }: { isActive?: boolean })=> `text-gray-300 link ${isActive? 'active' : ''}`}>Manga</NavLink>
  <NavLink to="/games" className={({ isActive }: { isActive?: boolean })=> `text-gray-300 link ${isActive? 'active' : ''}`}>Games</NavLink>
  <NavLink to="/music" className={({ isActive }: { isActive?: boolean })=> `text-gray-300 link ${isActive? 'active' : ''}`}>Music</NavLink>
        </nav>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        {/* Search: show icon on xs, full input on sm+ */}
        <button aria-label="Open search" onClick={handleOpen} className="p-2 rounded-lg bg-panel btn-panel transition inline-flex items-center justify-center sm:hidden">
          <Search size={18} />
        </button>
        <input
          type="text"
          placeholder="Search"
          className="hidden sm:inline-block bg-dark text-gray-200 px-3 sm:px-4 py-2 rounded-xl focus-ring w-24 sm:w-48"
        />
        <button className="p-2 rounded-lg bg-panel btn-panel transition">
          <Settings size={18} />
        </button>

        {/* Profile Menu */}
        <div className="relative">
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="p-2 rounded-lg bg-accent/20 hover:bg-accent/30 text-accent transition text-sm font-medium"
          >
            {auth?.user?.username || 'Perfil'}
          </button>
          {showProfile && (
            <div className="absolute right-0 mt-2 bg-darkCard rounded-lg shadow-lg border border-gray-700 min-w-48 z-50">
              <div className="p-3 border-b border-gray-700">
                <p className="text-sm text-white font-medium">{auth?.user?.name} {auth?.user?.last_name}</p>
                <p className="text-xs text-muted">{auth?.user?.email}</p>
              </div>
              <NavLink to="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-darkBg transition">
                Mi perfil
              </NavLink>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition text-left"
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile search overlay */}
      {showOverlay && (
        <div className={`fixed inset-0 z-50 flex items-start sm:hidden search-overlay ${overlayOpen ? 'open' : 'closing'}`}>
          <div className={`absolute inset-0 bg-black/50 transition-opacity ${overlayOpen ? 'opacity-50' : 'opacity-0'}`} onClick={handleClose} aria-hidden />
          <div className="relative w-full px-4 pt-6">
            <div className={`mx-auto max-w-md transform transition-all ${overlayOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              <div className="flex items-center gap-2">
                <input autoFocus type="text" placeholder="Search" className="flex-1 bg-dark text-gray-200 px-4 py-3 rounded-xl focus-ring w-full" />
                <button aria-label="Close search" onClick={handleClose} className="p-2 rounded-lg bg-panel btn-panel">
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Topbar;