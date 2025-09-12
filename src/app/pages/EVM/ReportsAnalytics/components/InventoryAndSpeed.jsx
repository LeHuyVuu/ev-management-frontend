import React from "react";

const InventoryAndSpeed = () => {
  const inventory = [
    { model: "Model S", version: "Long Range", stock: 120, updated: "2024-07-28" },
    { model: "Model S", version: "Performance", stock: 85, updated: "2024-07-28" },
    { model: "Model X", version: "Standard", stock: 90, updated: "2024-07-28" },
    { model: "Model Y", version: "Standard Range", stock: 150, updated: "2024-07-27" },
    { model: "Model 3", version: "Standard Plus", stock: 200, updated: "2024-07-27" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Inventory & Sales Speed
      </h2>

      {/* Current Inventory Stock */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Current Inventory Stock
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Model</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Version</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Stock Quantity</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Last Updated</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventory.map((item, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.model}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.version}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.stock}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales Speed */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Sales Speed Per Model
        </h3>
        <div className="h-64 bg-gray-50 border border-gray-200 rounded-md flex items-center justify-center text-gray-400">
          [Chart Placeholder]
        </div>
      </div>
    </div>
  );
};

export default InventoryAndSpeed;
