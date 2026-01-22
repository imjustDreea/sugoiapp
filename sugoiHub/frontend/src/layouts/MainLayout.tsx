import Sidebar from "../components/allPages/Sidebar";
import Topbar from "../components/allPages/Topbar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
      
      {/* TOPBAR — Completamente independiente, fuera del layout */}
      <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-darkPanel border-b border-gray-800/50">
        <Topbar />
      </header>

      {/* LAYOUT — Empieza debajo del TopBar */}
      <div className="pt-16 h-full flex">

        {/* SIDEBAR */}
        <aside className="bg-darkPanel border-r border-gray-800/50 transition-all duration-300 overflow-y-auto flex-shrink-0">
          <Sidebar />
        </aside>

        {/* MAIN */}
        <main className="flex-1 h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden relative">
          {/* Fondo estilo aurora + grilla sutil */}
          <div className="fixed inset-0 opacity-20 pointer-events-none z-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500 rounded-full mix-blend-screen filter blur-3xl"></div>
            <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl"></div>
          </div>
          <div
            className="fixed inset-0 opacity-5 pointer-events-none z-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(168, 85, 247, 0.5) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Contenido - Centrado con ancho máximo */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-4 sm:px-6 md:px-8">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}
