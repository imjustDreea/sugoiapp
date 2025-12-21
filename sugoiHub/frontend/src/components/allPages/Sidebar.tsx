import { Home, Search, MessageCircle, User, ChevronLeft, ChevronRight } from "lucide-react";
import Logo from './Logo';
import { useState } from "react";
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  // Responsive widths: compact (icons-only) on very small screens, full labels from sm+
  const [collapsed, setCollapsed] = useState(false);

  const containerWidth = collapsed ? "w-20" : "w-56 lg:w-72";

  return (
    <aside
      className={`${containerWidth} bg-darkPanel p-3 sm:p-4 md:p-6 flex flex-col justify-between transition-all duration-300 border-r border-gray-800/50`}
      style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.75rem' }}
    >
      <div>
        <div className="mb-10">
          <Logo size="sm" showText={!collapsed} />
        </div>

        <nav className="space-y-2">
          <NavLink to="/" className={({ isActive }: { isActive?: boolean }) => `sidebar-link flex items-center gap-3 w-full ${collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'} text-gray-300 ${isActive ? 'active' : ''}`}>
            <Home size={18} /> <span className={`${collapsed ? 'hidden' : 'hidden sm:inline'} ml-2`}>Home</span>
          </NavLink>
          <NavLink to="/discover" className={({ isActive }: { isActive?: boolean }) => `sidebar-link flex items-center gap-3 w-full ${collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'} text-gray-300 ${isActive ? 'active' : ''}`}>
            <Search size={18} /> <span className={`${collapsed ? 'hidden' : 'hidden sm:inline'} ml-2`}>Discover</span>
          </NavLink>
          <NavLink to="/community" className={({ isActive }: { isActive?: boolean }) => `sidebar-link flex items-center gap-3 w-full ${collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'} text-gray-300 ${isActive ? 'active' : ''}`}>
            <MessageCircle size={18} /> <span className={`${collapsed ? 'hidden' : 'hidden sm:inline'} ml-2`}>Community</span>
          </NavLink>
          <NavLink to="/profile" className={({ isActive }: { isActive?: boolean }) => `sidebar-link flex items-center gap-3 w-full ${collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'} text-gray-300 ${isActive ? 'active' : ''}`}>
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