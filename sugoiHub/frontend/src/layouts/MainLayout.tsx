import Sidebar from "../components/allPages/Sidebar";
import Topbar from "../components/allPages/Topbar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-x-hidden flex">
      {/* Fondo estilo aurora + grilla sutil */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500 rounded-full mix-blend-screen filter blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl"></div>
      </div>
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(168, 85, 247, 0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Contenido */}
      <Sidebar />
      <div className="relative z-10 flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 px-3 py-6 sm:px-5 sm:py-6 md:px-6 md:py-6 lg:px-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
