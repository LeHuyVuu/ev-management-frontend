import { NavLink, Outlet } from "react-router-dom";

const EVMLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header EVM */}
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            EVM Admin
          </h1>
          <nav className="flex space-x-8">
            <NavLink 
              to="/evm/dashboard" 
              className={({ isActive }) =>
                `relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-white/20 text-white shadow-sm' 
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink 
              to="/evm/account" 
              className={({ isActive }) =>
                `relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-white/20 text-white shadow-sm' 
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`
              }
            >
              Accounts
            </NavLink>
            <NavLink 
              to="/evm/dealer" 
              className={({ isActive }) =>
                `relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-white/20 text-white shadow-sm' 
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`
              }
            >
              Dealers
            </NavLink>
            <NavLink 
              to="/evm/vehicle" 
              className={({ isActive }) =>
                `relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-white/20 text-white shadow-sm' 
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`
              }
            >
              Vehicles
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Nội dung EVM */}
      <main className="container mx-auto px-6 py-8 flex-1">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[500px] p-1">
          <div className="p-6">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Footer EVM */}
      <footer className="bg-white border-t border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 font-medium">
              © {new Date().getFullYear()} EV Sales Management System
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Powered by modern web technologies
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EVMLayout;