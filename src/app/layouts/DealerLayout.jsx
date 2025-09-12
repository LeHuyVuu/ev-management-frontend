import { NavLink, Outlet } from "react-router-dom";

const DealerLayout = () => {
  return (
    <div className="min-h-screen grid md:grid-cols-[280px_1fr] bg-gradient-to-br from-gray-50 to-slate-100">
      {/* Sidebar Dealer */}
      <aside className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-100 shadow-2xl">
        <div className="p-6 border-b border-slate-700/50">
          <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
            Dealer Panel
          </h2>
        </div>
        
        <nav className="p-4 space-y-1">
          {/* <NavLink 
            to="/dealer/manager" 
            className={({ isActive }) =>
              `group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 hover:shadow-md'
              }`
            }
          >
            <span className="w-2 h-2 rounded-full bg-current mr-3 opacity-60 group-hover:opacity-100 transition-opacity"></span>
            Manager Dashboard
          </NavLink> */}
          
          <NavLink 
            to="/dealer/staff/contact" 
            className={({ isActive }) =>
              `group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 hover:shadow-md'
              }`
            }
          >
            <span className="w-2 h-2 rounded-full bg-current mr-3 opacity-60 group-hover:opacity-100 transition-opacity"></span>
            Contract
          </NavLink>
          
          <NavLink 
            to="/dealer/staff/customer-crm" 
            className={({ isActive }) =>
              `group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 hover:shadow-md'
              }`
            }
          >
            <span className="w-2 h-2 rounded-full bg-current mr-3 opacity-60 group-hover:opacity-100 transition-opacity"></span>
            Customer CRM
          </NavLink>
          
          <NavLink 
            to="/dealer/staff/delivery-tracking" 
            className={({ isActive }) =>
              `group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 hover:shadow-md'
              }`
            }
          >
            <span className="w-2 h-2 rounded-full bg-current mr-3 opacity-60 group-hover:opacity-100 transition-opacity"></span>
            Delivery Tracking
          </NavLink>
          
          <NavLink 
            to="/dealer/staff/driver-schedule" 
            className={({ isActive }) =>
              `group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 hover:shadow-md'
              }`
            }
          >
            <span className="w-2 h-2 rounded-full bg-current mr-3 opacity-60 group-hover:opacity-100 transition-opacity"></span>
            Driver Schedule
          </NavLink>
          
          <NavLink 
            to="/dealer/staff/quote-management" 
            className={({ isActive }) =>
              `group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 hover:shadow-md'
              }`
            }
          >
            <span className="w-2 h-2 rounded-full bg-current mr-3 opacity-60 group-hover:opacity-100 transition-opacity"></span>
            Quote Management
          </NavLink>
          
          <NavLink 
            to="/dealer/staff/vehicle-allocation" 
            className={({ isActive }) =>
              `group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 hover:shadow-md'
              }`
            }
          >
            <span className="w-2 h-2 rounded-full bg-current mr-3 opacity-60 group-hover:opacity-100 transition-opacity"></span>
            Vehicle Allocation
          </NavLink>
          
          <NavLink 
            to="/dealer/staff/vehicle-management" 
            className={({ isActive }) =>
              `group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 hover:shadow-md'
              }`
            }
          >
            <span className="w-2 h-2 rounded-full bg-current mr-3 opacity-60 group-hover:opacity-100 transition-opacity"></span>
            Vehicle Management
          </NavLink>
        </nav>
      </aside>

      {/* Nội dung Dealer */}
      <main className="p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[600px] p-1">
          <div className="p-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DealerLayout;