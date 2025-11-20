import Sidebar from "../components/allPages/Sidebar";
import Topbar from "../components/allPages/Topbar";
import MainCard from "../components/allPages/MainCard";
import ProfileCard from "../components/homeComponents/ProfileCard";
import RecommendationCard from "../components/homeComponents/RecommendationCard";
import MangaPage from "../components/pages/MangaPage";
import GamesPage from "../components/pages/GamesPage";
import HomePage from "../components/pages/HomePage";
import DiscoverPage from "../components/pages/DiscoverPage";
import CommunityPage from "../components/pages/CommunityPage";
import MusicPage from "../components/pages/MusicPage";
import ProfilePage from "../components/pages/ProfilePage";

const Dashboard = () => {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';

  return (
    <div className="bg-dark text-white min-h-screen flex">
      {/* Sidebar: siempre visible (ancho responsivo para móviles) */}
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />
  {/* Main: column on small screens, row on md+ */}
  <main className="flex-1 p-4 md:p-6 flex flex-col md:flex-row gap-6">
          {/* Si la ruta es /manga renderizamos la página de mangas dentro del layout */}
          {path.startsWith('/manga') ? (
            <div className="flex-1">
              <MangaPage />
            </div>
          ) : path.startsWith('/games') ? (
            <div className="flex-1">
              <GamesPage />
            </div>
          ) : path.startsWith('/discover') ? (
            <div className="flex-1">
              <DiscoverPage />
            </div>
          ) : path.startsWith('/community') ? (
            <div className="flex-1">
              <CommunityPage />
            </div>
          ) : path.startsWith('/music') ? (
            <div className="flex-1">
              <MusicPage />
            </div>
          ) : path.startsWith('/profile') ? (
            <div className="flex-1">
              <ProfilePage />
            </div>
          ) : path === '/' || path.startsWith('/home') ? (
            <div className="flex-1">
              <HomePage />
            </div>
          ) : (
            <>
              <MainCard />

              {/* Right column: hide on small screens, show on large */}
              <aside className="hidden lg:block w-80 space-y-6">
                <ProfileCard />
                <RecommendationCard />
              </aside>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
