import { NavLink, Outlet } from "react-router-dom";

const EVMLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header EVM */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">EVM Admin</h1>
          <nav className="flex space-x-6">
            <NavLink
              to="/evm/product-distribution"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-blue-100 hover:text-white hover:bg-white/10"
                }`
              }
            >
              Product Distribution
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Nội dung trang con */}
      <main className="container mx-auto px-6 py-8 flex-1">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="container mx-auto px-6 py-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} EV Sales Management System
        </div>
      </footer>
    </div>
  );
};

export default EVMLayout;