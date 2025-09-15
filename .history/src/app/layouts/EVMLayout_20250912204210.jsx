import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar"; // 👈 import Sidebar bạn đã viết

const EVMLayout = () => {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar bên trái */}
      <Sidebar />

      {/* Nội dung chính */}
      <main className="flex-1 p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default EVMLayout;
