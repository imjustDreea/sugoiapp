
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import MainCard from "../components/MainCard";
import ProfileCard from "../components/ProfileCard";
import RecommendationCard from "../components/RecommendationCard";

const Dashboard = () => {
  return (
    <div className="bg-dark text-white min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6 flex gap-6">
          <MainCard />
          <aside className="w-80 space-y-6">
            <ProfileCard />
            <RecommendationCard />
          </aside>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
