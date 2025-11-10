import Sidebar from "../components/allPages/Sidebar";
import Topbar from "../components/allPages/Topbar";
import MainCard from "../components/allPages/MainCard";
import ProfileCard from "../components/homeComponents/ProfileCard";
import RecommendationCard from "../components/homeComponents/RecommendationCard";

const Dashboard = () => {
  return (
    <div className="bg-dark text-white min-h-screen flex">
      {/* Sidebar: siempre visible (ancho responsivo para móviles) */}
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />
  {/* Main: column on small screens, row on md+ */}
  <main className="flex-1 p-4 md:p-6 flex flex-col md:flex-row gap-6">
          <MainCard />

          {/* Right column: hide on small screens, show on large */}
          <aside className="hidden lg:block w-80 space-y-6">
            <ProfileCard />
            <RecommendationCard />
          </aside>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
