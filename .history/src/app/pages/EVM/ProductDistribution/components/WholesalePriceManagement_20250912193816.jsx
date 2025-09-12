import React from "react";

const WholesalePriceManagement = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Wholesale Price Management
      </h2>
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">EV Model</th>
            <th className="px-4 py-2 text-left">Version</th>
            <th className="px-4 py-2 text-left">Wholesale Price</th>
            <th className="px-4 py-2 text-left">Min Order</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="px-4 py-2">Model X</td>
            <td className="px-4 py-2">Standard Range</td>
            <td className="px-4 py-2">$85,000</td>
            <td className="px-4 py-2">5</td>
          </tr>
          <tr className="border-t">
            <td className="px-4 py-2">Model Y</td>
            <td className="px-4 py-2">Performance</td>
            <td className="px-4 py-2">$65,000</td>
            <td className="px-4 py-2">7</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default WholesalePriceManagement;
