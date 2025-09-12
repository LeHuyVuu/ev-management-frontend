import React from "react";

const WholesalePriceManagement = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Title + Description */}
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Wholesale Price Management
      </h2>
      <p className="text-gray-600 mb-6">
        Manage the wholesale pricing and minimum order quantities for EV models.
      </p>

      {/* Current Pricing */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Current Pricing
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  EV Model
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Version
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Wholesale Price
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Minimum Order Quantity
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  Model X
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  Standard Range
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">$85,000</td>
                <td className="px-6 py-4 text-sm text-gray-900">5</td>
                <td className="px-6 py-4 space-x-2">
                  <button className="px-3 py-1 text-sm border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50">
                    Edit
                  </button>
                  <button className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">
                    Delete
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  Model X
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">Long Range</td>
                <td className="px-6 py-4 text-sm text-gray-900">$95,000</td>
                <td className="px-6 py-4 text-sm text-gray-900">3</td>
                <td className="px-6 py-4 space-x-2">
                  <button className="px-3 py-1 text-sm border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50">
                    Edit
                  </button>
                  <button className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">
                    Delete
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  Model Y
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  Performance
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">$65,000</td>
                <td className="px-6 py-4 text-sm text-gray-900">7</td>
                <td className="px-6 py-4 space-x-2">
                  <button className="px-3 py-1 text-sm border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50">
                    Edit
                  </button>
                  <button className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">
                    Delete
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  Model 3
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">Standard</td>
                <td className="px-6 py-4 text-sm text-gray-900">$40,000</td>
                <td className="px-6 py-4 text-sm text-gray-900">10</td>
                <td className="px-6 py-4 space-x-2">
                  <button className="px-3 py-1 text-sm border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50">
                    Edit
                  </button>
                  <button className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">
                    Delete
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  Model S
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">Plaid</td>
                <td className="px-6 py-4 text-sm text-gray-900">$120,000</td>
                <td className="px-6 py-4 text-sm text-gray-900">2</td>
                <td className="px-6 py-4 space-x-2">
                  <button className="px-3 py-1 text-sm border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50">
                    Edit
                  </button>
                  <button className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Set New Wholesale Price */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Set New Wholesale Price
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              EV Model
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Select Model</option>
              <option>Model X</option>
              <option>Model Y</option>
              <option>Model 3</option>
              <option>Model S</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Version
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Select Version</option>
              <option>Standard</option>
              <option>Long Range</option>
              <option>Performance</option>
              <option>Plaid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wholesale Price ($)
            </label>
            <input
              type="text"
              placeholder="e.g., 50000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Order Quantity
            </label>
            <input
              type="text"
              placeholder="e.g., 5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <button className="px-4 py-2 border border-indigo-300 text-indigo-600 rounded-md hover:bg-indigo-50">
            Add Price
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default WholesalePriceManagement;
