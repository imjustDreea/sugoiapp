import { Home, Search, MessageCircle, User, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  // Responsive widths: compact (icons-only) on very small screens, full labels from sm+
  const [collapsed, setCollapsed] = useState(false);

  const containerWidth = collapsed ? "w-16" : "w-56 md:w-64";

  return (
    <aside className={`${containerWidth} bg-darkPanel p-2 sm:p-4 md:p-6 flex flex-col justify-between transition-all duration-200`}>
      <div>
        <h1 className="text-2xl font-bold mb-10 flex items-center">
          {/* Kanji badge: subtle lime outline rather than a purple block */}
          <span className="inline-flex items-center justify-center w-8 h-8 rounded border border-grid text-accentLime bg-transparent">愛</span>
          <span className={`${collapsed ? 'hidden' : 'hidden sm:inline'} ml-3 text-white`}>SugoiHub</span>
        </h1>

        <nav className="space-y-4">
          <NavLink to="/" className={({ isActive }: { isActive?: boolean }) => `sidebar-link flex items-center gap-3 w-full ${collapsed ? 'justify-center py-2' : 'px-2 sm:px-0 py-2'} text-gray-300 ${isActive ? 'active' : ''}`}>
            <Home size={18} /> <span className={`${collapsed ? 'hidden' : 'hidden sm:inline'} ml-2`}>Home</span>
          </NavLink>
          <NavLink to="/discover" className={({ isActive }: { isActive?: boolean }) => `sidebar-link flex items-center gap-3 w-full ${collapsed ? 'justify-center py-2' : 'px-2 sm:px-0 py-2'} text-gray-300 ${isActive ? 'active' : ''}`}>
            <Search size={18} /> <span className={`${collapsed ? 'hidden' : 'hidden sm:inline'} ml-2`}>Discover</span>
          </NavLink>
          <NavLink to="/community" className={({ isActive }: { isActive?: boolean }) => `sidebar-link flex items-center gap-3 w-full ${collapsed ? 'justify-center py-2' : 'px-2 sm:px-0 py-2'} text-gray-300 ${isActive ? 'active' : ''}`}>
            <MessageCircle size={18} /> <span className={`${collapsed ? 'hidden' : 'hidden sm:inline'} ml-2`}>Community</span>
          </NavLink>
          <NavLink to="/profile" className={({ isActive }: { isActive?: boolean }) => `sidebar-link flex items-center gap-3 w-full ${collapsed ? 'justify-center py-2' : 'px-2 sm:px-0 py-2'} text-gray-300 ${isActive ? 'active' : ''}`}>
            <User size={18} /> <span className={`${collapsed ? 'hidden' : 'hidden sm:inline'} ml-2`}>Profile</span>
          </NavLink>
        </nav>
      </div>

      {/* Collapse control */}
      <div className="mt-4 sticky bottom-4">
        <button
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-md bg-panel btn-panel text-gray-200 transition sidebar-toggle"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;