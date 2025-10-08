import React from "react";

const SalesReport = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Sales Report</h2>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500">
          <option>Select Month</option>
          <option>January</option>
          <option>February</option>
        </select>
        <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500">
          <option>Select Quarter</option>
          <option>Q1</option>
          <option>Q2</option>
        </select>
        <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500">
          <option>Select Year</option>
          <option>2023</option>
          <option>2024</option>
        </select>
        <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500">
          <option>Select Region</option>
          <option>North America</option>
          <option>Europe</option>
          <option>Asia</option>
        </select>
        <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500">
          <option>Select Dealer</option>
          <option>Electro Motors</option>
          <option>GreenDrive</option>
        </select>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          Apply Filters
        </button>
      </div>

      {/* Charts */}
      <div className="w-full mb-8">
        <div className="p-4 border border-gray-200 rounded-md w-full">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Sales by Model and Region
          </h3>
          <div className="h-64 bg-gray-50 rounded-md flex items-center justify-center text-gray-400 w-full">
            [Bar Chart Placeholder — Full Width]
          </div>
        </div>
      </div>

      {/* Top Dealers Table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top Dealers by Sales Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Dealer
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Region
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Total Sales
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Growth (%)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  Electro Motors Inc.
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  North America
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">$2,500,000</td>
                <td className="px-6 py-4 text-sm text-green-600 font-semibold">
                  +12%
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  GreenDrive EU
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">Europe</td>
                <td className="px-6 py-4 text-sm text-gray-900">$2,100,000</td>
                <td className="px-6 py-4 text-sm text-green-600 font-semibold">
                  +8%
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  Asia Pacific EV
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">Asia</td>
                <td className="px-6 py-4 text-sm text-gray-900">$1,800,000</td>
                <td className="px-6 py-4 text-sm text-green-600 font-semibold">
                  +10%
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  Urban EV Solutions
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  North America
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">$1,750,000</td>
                <td className="px-6 py-4 text-sm text-green-600 font-semibold">
                  +5%
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  Nordic Volt
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">Europe</td>
                <td className="px-6 py-4 text-sm text-gray-900">$1,500,000</td>
                <td className="px-6 py-4 text-sm text-red-600 font-semibold">
                  -2%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;
