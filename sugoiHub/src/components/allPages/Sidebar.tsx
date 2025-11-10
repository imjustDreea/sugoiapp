import { Home, Search, MessageCircle, User } from "lucide-react";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-darkPanel p-6 flex flex-col justify-between">
      <div>
        <h1 className="text-2xl font-bold mb-10 text-transparent bg-clip-text bg-linear-to-r from-accentPurple to-accentPink">
          愛 SugoiHub
        </h1>

        <nav className="space-y-4">
          <a className="flex items-center gap-3 text-gray-300 hover:text-white">
            <Home size={18} /> Home
          </a>
          <a className="flex items-center gap-3 text-gray-300 hover:text-white">
            <Search size={18} /> Discover
          </a>
          <a className="flex items-center gap-3 text-gray-300 hover:text-white">
            <MessageCircle size={18} /> Community
          </a>
          <a className="flex items-center gap-3 bg-linear-to-r from-accentPurple to-accentPink text-white px-3 py-2 rounded-xl">
            <User size={18} /> Profile
          </a>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;