import Sidebar from "../components/allPages/Sidebar";
import Topbar from "../components/allPages/Topbar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="bg-dark text-white min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
