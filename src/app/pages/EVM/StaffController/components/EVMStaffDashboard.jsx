import React from "react";

const EVMStaffDashboard = () => {
  const stats = [
    {
      title: "Total EV Models",
      value: 15,
      description: "Increased 5% compared to last month",
      icon: "🚗",
    },
    {
      title: "Total Inventory",
      value: 875,
      description: "Updated today",
      icon: "📦",
    },
    {
      title: "Total Dealers",
      value: 28,
      description: "Added 2 new dealers",
      icon: "🏬",
    },
    {
      title: "Pending Distribution Orders",
      value: 12,
      description: "Require urgent review",
      icon: "📑",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        EVM Staff Dashboard
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col"
          >
            <div className="flex items-center space-x-2 text-gray-600 mb-2">
              <span>{stat.icon}</span>
              <span className="text-sm font-medium">{stat.title}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <p className="text-sm text-gray-500 mt-1">{stat.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EVMStaffDashboard;
