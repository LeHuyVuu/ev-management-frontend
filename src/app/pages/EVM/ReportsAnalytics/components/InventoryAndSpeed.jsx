import React, { useEffect, useState } from "react";

const InventoryAndSpeed = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        "https://prn232.freeddns.org/brand-service/api/reports/current-inventory"
      );
      const json = await res.json();
      if (json.status === 200 && json.data) setInventory(json.data);
      else throw new Error(json.message || "Failed to load inventory");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // 🔍 Utility: check if a date is "recent" (within 7 days)
  const isRecent = (dateStr) => {
    const date = new Date(dateStr);
    const diff = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        ⚡ Inventory & Sales Speed
      </h2>

      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        📦 Current Inventory Stock
      </h3>

      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="min-w-full border-collapse">
          <thead className="bg-indigo-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-indigo-700 uppercase tracking-wider">
                Model
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-indigo-700 uppercase tracking-wider">
                Version
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-indigo-700 uppercase tracking-wider">
                Dealers Stock
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-indigo-700 uppercase tracking-wider">
                Last Updated
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4 text-sm text-gray-300 bg-gray-50">
                      ▬▬▬▬▬▬▬▬▬▬▬
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 bg-gray-50">
                      ▬▬▬▬▬▬
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 bg-gray-50 text-right">
                      ▬▬
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 bg-gray-50 text-right">
                      ▬▬▬▬
                    </td>
                  </tr>
                ))
              : error
              ? (
                <tr>
                  <td colSpan={4} className="px-6 py-6 text-center text-red-600 font-medium">
                    ⚠️ {error}
                  </td>
                </tr>
              )
              : inventory.length === 0
              ? (
                <tr>
                  <td colSpan={4} className="px-6 py-6 text-center text-gray-500">
                    No inventory data available
                  </td>
                </tr>
              )
              : (
                inventory.map((item, i) => (
                  <tr
                    key={i}
                    className="hover:bg-indigo-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">
                      {item.model}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {item.versionName}
                    </td>
                    <td className="px-6 py-3 text-sm font-bold text-center text-indigo-700">
                      {item.dealersStock.toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-sm text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          isRecent(item.lastUpdated)
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {item.lastUpdated}
                      </span>
                    </td>
                  </tr>
                ))
              )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryAndSpeed;
