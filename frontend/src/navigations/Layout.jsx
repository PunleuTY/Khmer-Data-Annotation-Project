import { Outlet } from "react-router-dom";
import Sidebar from "./navigate";

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Fixed Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-gray-100 ">
        <div className="h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
