import React from "react";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 h-full">
      <div className="p-6">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          MANAGEMENT
        </h2>
        <div className="space-y-2">
          <div className="p-2 text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
            Products & Distribution
          </div>
          <div className="p-2 text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
            Dealers
          </div>
          <div className="p-2 text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
            Reports & Analytics
          </div>
          <div className="p-2 text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
            System Administration
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
