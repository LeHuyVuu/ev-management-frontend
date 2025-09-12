import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar/EVMSidebar";
import EVMHeader from "./Header/EVMHeader";
import EVMFooter from "./Footer/EVMFooter";

const EVMLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <EVMHeader />

      {/* Nội dung chính chia 2 cột: Sidebar + Content */}
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer */}
      <EVMFooter />
    </div>
  );
};

export default EVMLayout;
