import { Settings } from "lucide-react";
import { NavLink } from 'react-router-dom'

const Topbar = () => {
  return (
    <header className="flex items-center justify-between bg-darkPanel p-4 border-b border-gray-800">
      <nav className="flex space-x-4 sm:space-x-8">
  <NavLink to="/" className={({ isActive }: { isActive?: boolean })=> `text-gray-300 link ${isActive? 'active' : ''}`}>Home</NavLink>
  <NavLink to="/manga" className={({ isActive }: { isActive?: boolean })=> `text-gray-300 link ${isActive? 'active' : ''}`}>Manga</NavLink>
  <NavLink to="/games" className={({ isActive }: { isActive?: boolean })=> `text-gray-300 link ${isActive? 'active' : ''}`}>Games</NavLink>
  <NavLink to="/music" className={({ isActive }: { isActive?: boolean })=> `text-gray-300 link ${isActive? 'active' : ''}`}>Music</NavLink>
      </nav>

      <div className="flex items-center gap-4 ml-auto">
        <input
          type="text"
          placeholder="Search"
          className="bg-dark text-gray-200 px-3 sm:px-4 py-2 rounded-xl focus-ring w-24 sm:w-48"
        />
        <button className="p-2 rounded-lg bg-panel btn-panel transition">
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;