import React from "react";

const DealerInventoryStatus = () => {
  const inventory = [
    { dealer: "EVM Dealer Saigon", model: "EVM Model X", version: "Standard", available: 35 },
    { dealer: "EVM Dealer Hanoi", model: "EVM Model X", version: "Extended Range", available: 20 },
    { dealer: "EVM Dealer Danang", model: "EVM Model Y", version: "Performance", available: 45 },
    { dealer: "EVM Dealer Can Tho", model: "EVM Model Z", version: "Premium", available: 25 },
    { dealer: "EVM Dealer Haiphong", model: "EVM Model Y", version: "Standard", available: 30 },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Dealer Inventory Status
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Dealer
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Model
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Version
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Available Stock
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inventory.map((item, i) => (
              <tr key={i}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {item.dealer}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{item.model}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{item.version}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.available}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DealerInventoryStatus;
