import { Settings, Search, X } from "lucide-react";
import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'

const Topbar = () => {
  // showOverlay: controls whether overlay remains mounted in DOM
  // overlayOpen: controls visual open/close state (for transitions)
  const [showOverlay, setShowOverlay] = useState(false)
  const [overlayOpen, setOverlayOpen] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleOpen = () => {
    setShowOverlay(true)
    // allow next tick for mount, then open for transition
    requestAnimationFrame(() => setOverlayOpen(true))
  }

  const handleClose = () => {
    setOverlayOpen(false)
    // keep mounted until transition ends (200ms)
    window.setTimeout(() => setShowOverlay(false), 220)
  }

  return (
    <header className="flex items-center justify-between bg-darkPanel p-4 border-b border-gray-800 relative">
      <nav className="flex space-x-4 sm:space-x-8">
  <NavLink to="/anime" className={({ isActive }: { isActive?: boolean })=> `text-gray-300 link ${isActive? 'active' : ''}`}>Anime</NavLink>
  <NavLink to="/manga" className={({ isActive }: { isActive?: boolean })=> `text-gray-300 link ${isActive? 'active' : ''}`}>Manga</NavLink>
  <NavLink to="/games" className={({ isActive }: { isActive?: boolean })=> `text-gray-300 link ${isActive? 'active' : ''}`}>Games</NavLink>
  <NavLink to="/music" className={({ isActive }: { isActive?: boolean })=> `text-gray-300 link ${isActive? 'active' : ''}`}>Music</NavLink>
      </nav>

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