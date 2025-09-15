import React from "react";

const PromotionManagement = () => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Title + Description */}
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Promotion Management
      </h2>
      <p className="text-gray-600 mb-6">
        Create, approve, and manage promotional campaigns for EV models.
      </p>

      {/* Active & Upcoming Promotions */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Active & Upcoming Promotions
          </h3>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            Create Promotion
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Promotion Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  End Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  Spring Savings
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">Discount</td>
                <td className="px-6 py-4 text-sm text-gray-500">2024-03-01</td>
                <td className="px-6 py-4 text-sm text-gray-500">2024-05-31</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor("Active")}`}>
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 space-x-1">
                  <button className="px-3 py-1 text-sm bg-pink-500 text-white rounded hover:bg-pink-600">Approve</button>
                  <button className="px-3 py-1 text-sm border border-indigo-300 text-indigo-600 rounded hover:bg-indigo-50">Activate</button>
                  <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">Deactivate</button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  Loyalty Bonus
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">Gift</td>
                <td className="px-6 py-4 text-sm text-gray-500">2024-01-01</td>
                <td className="px-6 py-4 text-sm text-gray-500">2024-12-31</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor("Active")}`}>
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 space-x-1">
                  <button className="px-3 py-1 text-sm bg-pink-500 text-white rounded hover:bg-pink-600">Approve</button>
                  <button className="px-3 py-1 text-sm border border-indigo-300 text-indigo-600 rounded hover:bg-indigo-50">Activate</button>
                  <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">Deactivate</button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  Fleet Upgrade
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">Bulk Discount</td>
                <td className="px-6 py-4 text-sm text-gray-500">2023-09-01</td>
                <td className="px-6 py-4 text-sm text-gray-500">2024-02-29</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor("Expired")}`}>
                    Expired
                  </span>
                </td>
                <td className="px-6 py-4 space-x-1">
                  <button className="px-3 py-1 text-sm bg-pink-500 text-white rounded hover:bg-pink-600">Approve</button>
                  <button className="px-3 py-1 text-sm border border-indigo-300 text-indigo-600 rounded hover:bg-indigo-50">Activate</button>
                  <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">Deactivate</button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  Referral Program
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">Bonus</td>
                <td className="px-6 py-4 text-sm text-gray-500">2024-04-10</td>
                <td className="px-6 py-4 text-sm text-gray-500">2024-10-31</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor("Active")}`}>
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 space-x-1">
                  <button className="px-3 py-1 text-sm bg-pink-500 text-white rounded hover:bg-pink-600">Approve</button>
                  <button className="px-3 py-1 text-sm border border-indigo-300 text-indigo-600 rounded hover:bg-indigo-50">Activate</button>
                  <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">Deactivate</button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  Summer Drive
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">Special Rate</td>
                <td className="px-6 py-4 text-sm text-gray-500">2024-06-01</td>
                <td className="px-6 py-4 text-sm text-gray-500">2024-08-31</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor("Pending")}`}>
                    Pending
                  </span>
                </td>
                <td className="px-6 py-4 space-x-1">
                  <button className="px-3 py-1 text-sm bg-pink-500 text-white rounded hover:bg-pink-600">Approve</button>
                  <button className="px-3 py-1 text-sm border border-indigo-300 text-indigo-600 rounded hover:bg-indigo-50">Activate</button>
                  <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">Deactivate</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PromotionManagement; 
