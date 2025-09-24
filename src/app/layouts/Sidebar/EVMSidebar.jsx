import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Package,
  Users,
  BarChart3,
  Settings,
  LayoutDashboard,
} from "lucide-react";

const menuItems = [
  {
    id: "staff",
    label: "Staff Control",
    path: "/evm/staff-controller",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    id: "products",
    label: "Products & Distribution",
    path: "/evm/product-distribution",
    icon: <Package className="w-4 h-4" />,
  },
  {
    id: "dealers",
    label: "Dealer Management",
    path: "/evm/dealer-management",
    icon: <Users className="w-4 h-4" />,
  },
  {
    id: "reports",
    label: "Reports & Analytics",
    path: "/evm/reports-analytics",
    icon: <BarChart3 className="w-4 h-4" />,
  },
  {
    id: "system",
    label: "System Administration",
    path: "/evm/system-administration",
    icon: <Settings className="w-4 h-4" />,
  },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="px-4 py-6 border-b border-gray-100">
        <h2 className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
          MANAGEMENT
        </h2>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={`flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors duration-150 ease-in-out group ${
              location.pathname === item.path
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span
              className={`${
                location.pathname === item.path
                  ? "text-blue-500"
                  : "text-gray-400 group-hover:text-gray-500"
              }`}
            >
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
