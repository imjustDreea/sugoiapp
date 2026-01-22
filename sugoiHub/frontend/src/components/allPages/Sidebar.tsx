import { Home, Search, MessageCircle, User, Music, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Logo from './Logo';
import { useState } from "react";
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const sidebarWidth = collapsed ? "w-20" : "w-64";

  return (
    <div
      className={`${sidebarWidth} h-[calc(100vh-4rem)] transition-all duration-300 flex flex-col overflow-y-auto`}
    >
      {/* Logo */}
      <div className="p-4 border-b border-gray-800/50 flex items-center justify-between h-20">
        {!collapsed ? (
          <Logo size="sm" showText={true} />
        ) : (
          <div className="w-full flex justify-center">
            <Logo size="xs" showText={false} />
          </div>
        )}
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <NavLink 
          to="/" 
          className={({ isActive }) => `
            flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200
            ${isActive 
              ? 'bg-accentLime text-black font-bold' 
              : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
            }
            ${collapsed ? 'justify-center px-3' : ''}
          `}
          title="Inicio"
        >
          <Home size={24} className="shrink-0" />
          {!collapsed && <span className="text-sm font-semibold whitespace-nowrap">Inicio</span>}
        </NavLink>

        <NavLink 
          to="/discover" 
          className={({ isActive }) => `
            flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200
            ${isActive 
              ? 'bg-accentLime text-black font-bold' 
              : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
            }
            ${collapsed ? 'justify-center px-3' : ''}
          `}
          title="Descubrir"
        >
          <Search size={24} className="shrink-0" />
          {!collapsed && <span className="text-sm font-semibold whitespace-nowrap">Descubrir</span>}
        </NavLink>

        <NavLink 
          to="/community" 
          className={({ isActive }) => `
            flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200
            ${isActive 
              ? 'bg-accentLime text-black font-bold' 
              : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
            }
            ${collapsed ? 'justify-center px-3' : ''}
          `}
          title="Comunidad"
        >
          <MessageCircle size={24} className="shrink-0" />
          {!collapsed && <span className="text-sm font-semibold whitespace-nowrap">Comunidad</span>}
        </NavLink>

        <NavLink 
          to="/music" 
          className={({ isActive }) => `
            flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200
            ${isActive 
              ? 'bg-accentLime text-black font-bold' 
              : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
            }
            ${collapsed ? 'justify-center px-3' : ''}
          `}
          title="Música"
        >
          <Music size={24} className="shrink-0" />
          {!collapsed && <span className="text-sm font-semibold whitespace-nowrap">Música</span>}
        </NavLink>

        <NavLink 
          to="/profile" 
          className={({ isActive }) => `
            flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200
            ${isActive 
              ? 'bg-accentLime text-black font-bold' 
              : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
            }
            ${collapsed ? 'justify-center px-3' : ''}
          `}
          title="Perfil"
        >
          <User size={24} className="shrink-0" />
          {!collapsed && <span className="text-sm font-semibold whitespace-nowrap">Perfil</span>}
        </NavLink>
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-gray-800/50 p-3 space-y-2">
        <NavLink 
          to="/community" 
          className={({ isActive }) => `
            w-full flex items-center gap-4 px-4 py-3 rounded-lg
            transition-all duration-200 font-semibold
            ${isActive 
              ? 'bg-accentLime text-black' 
              : 'text-accentLime hover:bg-accentLime hover:text-black'
            }
            ${collapsed ? 'justify-center px-3' : ''}
          `}
          title="Crear publicación"
        >
          <Plus size={24} className="shrink-0" />
          {!collapsed && <span className="text-sm whitespace-nowrap">Crear</span>}
        </NavLink>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`
            w-full flex items-center gap-4 px-4 py-3 rounded-lg
            text-gray-400 hover:bg-gray-800/50 hover:text-white
            transition-all duration-200
            ${collapsed ? 'justify-center px-3' : ''}
          `}
          title={collapsed ? 'Expandir' : 'Contraer'}
          aria-label={collapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
        >
          {collapsed ? (
            <ChevronRight size={24} className="shrink-0" />
          ) : (
            <>
              <ChevronLeft size={24} className="shrink-0" />
              <span className="text-sm whitespace-nowrap">Menos</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;