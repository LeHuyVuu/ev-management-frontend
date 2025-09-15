import React from "react";

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-600 rounded"></div>
          <h1 className="text-xl font-semibold text-gray-900">EV AdminDashboard</h1>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search..."
            className="pl-3 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="w-5 h-5 bg-gray-400 rounded"></div>
          <div className="flex items-center space-x-2 cursor-pointer">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span className="text-sm text-gray-600">Logout</span>
          </div>
          <div className="w-8 h-8 bg-orange-400 rounded-full"></div>
        </div>
      </div>
    </header>
  );
};

export default Header;
