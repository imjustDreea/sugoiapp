import { Home, Search, MessageCircle, User, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const Sidebar = () => {
  // Responsive widths: compact (icons-only) on very small screens, full labels from sm+
  const [collapsed, setCollapsed] = useState(false);

  const containerWidth = collapsed ? "w-16" : "w-56 md:w-64";

  return (
    <aside className={`${containerWidth} bg-darkPanel p-2 sm:p-4 md:p-6 flex flex-col justify-between transition-all duration-200`}>
      <div>
        <h1 className="text-2xl font-bold mb-10 bg-clip-text bg-linear-to-r from-accentPurple to-accentPink flex items-center">
          <span className="text-2xl">愛</span>
          <span className={`${collapsed ? 'hidden' : 'hidden sm:inline'} ml-2`}>SugoiHub</span>
        </h1>

        <nav className="space-y-4">
          <a className={`flex items-center gap-3 w-full ${collapsed ? 'justify-center py-2' : 'px-2 sm:px-0 py-2'} text-gray-300 hover:text-white`}>
            <Home size={18} /> <span className={`${collapsed ? 'hidden' : 'hidden sm:inline'} ml-2`}>Home</span>
          </a>
          <a className={`flex items-center gap-3 w-full ${collapsed ? 'justify-center py-2' : 'px-2 sm:px-0 py-2'} text-gray-300 hover:text-white`}>
            <Search size={18} /> <span className={`${collapsed ? 'hidden' : 'hidden sm:inline'} ml-2`}>Discover</span>
          </a>
          <a className={`flex items-center gap-3 w-full ${collapsed ? 'justify-center py-2' : 'px-2 sm:px-0 py-2'} text-gray-300 hover:text-white`}>
            <MessageCircle size={18} /> <span className={`${collapsed ? 'hidden' : 'hidden sm:inline'} ml-2`}>Community</span>
          </a>
          <a className={`flex items-center gap-3 w-full ${collapsed ? 'justify-center py-2' : 'px-2 sm:px-0 py-2 rounded-xl bg-linear-to-r from-accentPurple to-accentPink'} text-white`}>
            <User size={18} /> <span className={`${collapsed ? 'hidden' : 'hidden sm:inline'} ml-2`}>Profile</span>
          </a>
        </nav>
      </div>

      {/* Collapse control */}
      <div className="mt-4">
        <button
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-md bg-[#1a1a2e] hover:bg-[#232342] text-gray-200 transition"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;