import React, { useState } from 'react';
import { 
  ChevronDown,
  ChevronRight,
  Package,
  Users,
  BarChart3,
  Settings,
  FileText,
  Percent,
  Gift,
  UserCheck,
  FileBarChart,
  Target,
  TrendingUp,
  Package2,
  Brain,
  UserCog,
  Shield
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  children?: { label: string; icon: React.ReactNode }[];
}

const menuItems: MenuItem[] = [
  {
    id: 'products',
    label: 'Products & Distribution',
    icon: <Package className="w-4 h-4" />,
    children: [
      { label: 'Wholesale Price', icon: <FileText className="w-4 h-4" /> },
      { label: 'Discount Policy', icon: <Percent className="w-4 h-4" /> },
      { label: 'Promotion', icon: <Gift className="w-4 h-4" /> }
    ]
  },
  {
    id: 'dealers',
    label: 'Dealers',
    icon: <Users className="w-4 h-4" />,
    children: [
      { label: 'Dealer Accounts', icon: <UserCheck className="w-4 h-4" /> },
      { label: 'Contracts & Debts', icon: <FileBarChart className="w-4 h-4" /> },
      { label: 'Sales Targets', icon: <Target className="w-4 h-4" /> }
    ]
  },
  {
    id: 'reports',
    label: 'Reports & Analytics',
    icon: <BarChart3 className="w-4 h-4" />,
    children: [
      { label: 'Sales Report', icon: <TrendingUp className="w-4 h-4" /> },
      { label: 'Inventory & Speed', icon: <Package2 className="w-4 h-4" /> },
      { label: 'AI Forecast', icon: <Brain className="w-4 h-4" /> }
    ]
  },
  {
    id: 'system',
    label: 'System Administration',
    icon: <Settings className="w-4 h-4" />,
    children: [
      { label: 'User Management', icon: <UserCog className="w-4 h-4" /> },
      { label: 'Role & Access', icon: <Shield className="w-4 h-4" /> }
    ]
  }
];

const Sidebar: React.FC = () => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

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
          <div key={item.id}>
            {/* Main Menu Item */}
            <button
              onClick={() => toggleExpanded(item.id)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors duration-150 ease-in-out group"
            >
              <div className="flex items-center space-x-3">
                <span className="text-gray-400 group-hover:text-gray-500">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.children && (
                <span className="text-gray-400 group-hover:text-gray-500">
                  {expandedItems.has(item.id) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </span>
              )}
            </button>

            {/* Submenu Items */}
            {item.children && expandedItems.has(item.id) && (
              <div className="ml-4 mt-1 space-y-1">
                {item.children.map((child, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors duration-150 ease-in-out group"
                  >
                    <span className="text-gray-400 group-hover:text-gray-500">
                      {child.icon}
                    </span>
                    <span>{child.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;