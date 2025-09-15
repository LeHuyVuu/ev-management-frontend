import React from "react";

const DiscountPolicyManagement = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Discount Policy Management
      </h2>
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Dealer</th>
            <th className="px-4 py-2 text-left">Rate</th>
            <th className="px-4 py-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="px-4 py-2">AutoDrive</td>
            <td className="px-4 py-2">5%</td>
            <td className="px-4 py-2">Active</td>
          </tr>
          <tr className="border-t">
            <td className="px-4 py-2">EV Universe</td>
            <td className="px-4 py-2">7%</td>
            <td className="px-4 py-2">Pending</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DiscountPolicyManagement;
