import { Settings } from "lucide-react";

const Topbar = () => {
  return (
    <header className="flex items-center justify-between bg-darkPanel p-4 border-b border-gray-800">
      <nav className="flex space-x-8">
        <a className="text-gray-300 hover:text-accentPurple">Home</a>
        <a className="text-accentPurple border-b-2 border-accentPurple pb-1">Manga</a>
        <a className="text-gray-300 hover:text-accentPurple">Games</a>
        <a className="text-gray-300 hover:text-accentPurple">Music</a>
      </nav>

      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search"
          className="bg-dark text-gray-200 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-accentPurple"
        />
        <button className="p-2 rounded-lg bg-[#1a1a2e] hover:bg-[#232342] transition">
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;