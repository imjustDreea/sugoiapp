import { Home, Search, MessageCircle, User, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  // Responsive widths: compact (icons-only) on very small screens, full labels from sm+
  const [collapsed, setCollapsed] = useState(false);

  // Responsive widths: compact by default on xs, expand at sm+
  const containerWidth = collapsed ? "w-16" : "w-16 sm:w-48 md:w-56";

  return (
    <aside className={`${containerWidth} bg-darkPanel p-2 sm:p-3 md:p-4 flex flex-col justify-between relative sidebar-seam`}>
      <div>
        <h1 className="text-2xl font-bold mb-10 flex items-center">
          {/* Kanji badge: subtle lime outline rather than a purple block */}
          <span className="inline-flex items-center justify-center w-8 h-8 rounded border border-grid text-accentLime bg-transparent">愛</span>
          <span className={`${collapsed ? 'hidden' : 'hidden sm:inline'} ml-3 text-white`}>SugoiHub</span>
        </h1>

        <nav className="space-y-4">
          <NavLink to="/" className={({ isActive }: { isActive?: boolean }) => `sidebar-link flex items-center gap-4 w-full ${collapsed ? 'justify-center py-2' : 'px-3 sm:px-4 py-2'} text-gray-300 ${isActive ? 'active' : ''}`}>
            <Home size={18} />
            <span className={`ml-3 hidden sm:inline-block sidebar-label ${collapsed ? 'sm:opacity-0 sm:-translate-x-2 sm:pointer-events-none' : 'sm:opacity-100 sm:translate-x-0'}`}>Home</span>
          </NavLink>
          <NavLink to="/discover" className={({ isActive }: { isActive?: boolean }) => `sidebar-link flex items-center gap-4 w-full ${collapsed ? 'justify-center py-2' : 'px-3 sm:px-4 py-2'} text-gray-300 ${isActive ? 'active' : ''}`}>
            <Search size={18} />
            <span className={`ml-3 hidden sm:inline-block sidebar-label ${collapsed ? 'sm:opacity-0 sm:-translate-x-2 sm:pointer-events-none' : 'sm:opacity-100 sm:translate-x-0'}`}>Discover</span>
          </NavLink>
          <NavLink to="/community" className={({ isActive }: { isActive?: boolean }) => `sidebar-link flex items-center gap-4 w-full ${collapsed ? 'justify-center py-2' : 'px-3 sm:px-4 py-2'} text-gray-300 ${isActive ? 'active' : ''}`}>
            <MessageCircle size={18} />
            <span className={`ml-3 hidden sm:inline-block sidebar-label ${collapsed ? 'sm:opacity-0 sm:-translate-x-2 sm:pointer-events-none' : 'sm:opacity-100 sm:translate-x-0'}`}>Community</span>
          </NavLink>
          <NavLink to="/profile" className={({ isActive }: { isActive?: boolean }) => `sidebar-link flex items-center gap-4 w-full ${collapsed ? 'justify-center py-2' : 'px-3 sm:px-4 py-2'} text-gray-300 ${isActive ? 'active' : ''}`}>
            <User size={18} />
            <span className={`ml-3 hidden sm:inline-block sidebar-label ${collapsed ? 'sm:opacity-0 sm:-translate-x-2 sm:pointer-events-none' : 'sm:opacity-100 sm:translate-x-0'}`}>Profile</span>
          </NavLink>
        </nav>
      </div>

    {/* Collapse control: absolute so it can slightly overlap the edge and never be clipped
      Use different horizontal offset when collapsed vs expanded so the button appears visually aligned */}
      <div className={`absolute bottom-4 ${collapsed ? '-right-3' : '-right-3 sm:-right-5'} transition-all z-60`}>
        <button
          type="button"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed(!collapsed)}
          className="w-10 h-10 flex items-center justify-center p-2 rounded-md bg-panel btn-panel text-gray-200 transition sidebar-toggle shadow-card"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;