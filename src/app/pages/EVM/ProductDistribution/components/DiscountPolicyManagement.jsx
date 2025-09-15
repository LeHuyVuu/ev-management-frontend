import React from "react";

const DiscountPolicyManagement = () => {
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
        Discount Policy Management
      </h2>
      <p className="text-gray-600 mb-6">
        Configure and manage discount rates for individual dealers.
      </p>

      {/* Dealer Discount Policies */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Dealer Discount Policies
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Dealer Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Discount Rate (%)
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Validity Period
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
                  AutoDrive Solutions
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">5%</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  2024-01-01 to 2024-12-31
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      "Active"
                    )}`}
                  >
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 space-x-2">
                  <button className="px-3 py-1 text-sm border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50">
                    Edit
                  </button>
                  <button className="px-3 py-1 text-sm bg-pink-500 text-white rounded-md hover:bg-pink-600">
                    Activate
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  GreenMobility Inc.
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">7%</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  2024-03-15 to 2024-09-30
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      "Active"
                    )}`}
                  >
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 space-x-2">
                  <button className="px-3 py-1 text-sm border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50">
                    Edit
                  </button>
                  <button className="px-3 py-1 text-sm bg-pink-500 text-white rounded-md hover:bg-pink-600">
                    Activate
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  FutureWheels Corp.
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">3%</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  2023-07-01 to 2024-06-30
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      "Expired"
                    )}`}
                  >
                    Expired
                  </span>
                </td>
                <td className="px-6 py-4 space-x-2">
                  <button className="px-3 py-1 text-sm border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50">
                    Edit
                  </button>
                  <button className="px-3 py-1 text-sm bg-pink-500 text-white rounded-md hover:bg-pink-600">
                    Activate
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  Urban EV Dealers
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">6%</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  2024-05-01 to 2024-11-30
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      "Pending"
                    )}`}
                  >
                    Pending
                  </span>
                </td>
                <td className="px-6 py-4 space-x-2">
                  <button className="px-3 py-1 text-sm border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50">
                    Edit
                  </button>
                  <button className="px-3 py-1 text-sm bg-pink-500 text-white rounded-md hover:bg-pink-600">
                    Activate
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  EV Universe Ltd.
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">4%</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  2024-02-01 to 2024-08-31
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      "Active"
                    )}`}
                  >
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 space-x-2">
                  <button className="px-3 py-1 text-sm border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50">
                    Edit
                  </button>
                  <button className="px-3 py-1 text-sm bg-pink-500 text-white rounded-md hover:bg-pink-600">
                    Activate
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Discount Policy */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Add New Discount Policy
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dealer Name
            </label>
            <input
              type="text"
              placeholder="e.g., Global Motors"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Rate (%)
            </label>
            <input
              type="text"
              placeholder="e.g., 10"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Validity Period
            </label>
            <input
              type="text"
              placeholder="e.g., YYYY-MM-DD to YYYY-MM-DD"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            Add Policy
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscountPolicyManagement;
