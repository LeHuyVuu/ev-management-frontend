import React, { useEffect, useState } from "react";

const EVMStaffDashboard = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(
        "https://prn232.freeddns.org/brand-service/api/dashboard"
      );
      const json = await response.json();

      if (json.status === 200 && json.data) {
        const data = json.data;

        const mappedStats = [
          {
            title: "Total EV Models",
            value: data.totalVersions,
            description: "Increased 5% compared to last month",
            icon: "🚗",
          },
          {
            title: "Total Inventory",
            value: data.totalInventory,
            description: "Updated today",
            icon: "📦",
          },
          {
            title: "Total Dealers",
            value: data.totalDealers,
            description: "Added 2 new dealers",
            icon: "🏬",
          },
          {
            title: "Pending Distribution Orders",
            value: data.pendingDistributionOrders,
            description: "Require urgent review",
            icon: "📑",
          },
        ];

        setStats(mappedStats);
      } else {
        throw new Error(json.message || "Invalid API response");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Skeleton placeholder card
  const SkeletonCard = () => (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 animate-pulse">
      <div className="flex items-center space-x-2 mb-3">
        <div className="w-5 h-5 bg-gray-300 rounded"></div>
        <div className="h-4 bg-gray-300 rounded w-2/3"></div>
      </div>
      <div className="h-6 bg-gray-300 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
    </div>
  );

  // Fallback cards (for error or empty)
  const FallbackCard = ({ title, icon }) => (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col items-center justify-center text-gray-400">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-sm font-medium">{title}</div>
      <div className="text-xs text-gray-400 mt-1">No data</div>
    </div>
  );

  const titles = [
    { title: "Total EV Models", icon: "🚗" },
    { title: "Total Inventory", icon: "📦" },
    { title: "Total Dealers", icon: "🏬" },
    { title: "Pending Distribution Orders", icon: "📑" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        EVM Staff Dashboard
      </h2>

      {/* Error message inside dashboard frame */}
      {error && (
        <div className="mb-4 bg-red-50 text-red-700 border border-red-200 rounded-md p-3 text-sm">
          ⚠️ Failed to load data
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Loading state */}
        {loading
          ? Array(4)
              .fill(0)
              .map((_, i) => <SkeletonCard key={i} />)
          : stats.length > 0
          ? stats.map((stat, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col transition hover:shadow-md"
              >
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <span>{stat.icon}</span>
                  <span className="text-sm font-medium">{stat.title}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value?.toLocaleString()}
                </div>
                <p className="text-sm text-gray-500 mt-1">{stat.description}</p>
              </div>
            ))
          : titles.map((t, i) => <FallbackCard key={i} {...t} />)}
      </div>
    </div>
  );
};

export default EVMStaffDashboard;
