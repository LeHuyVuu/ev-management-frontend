import React from "react";

const SalesTargets = () => {
  const targets = [
    {
      dealer: "EVM Motors North",
      target: 150000,
      achieved: 120000,
      period: "Monthly",
    },
    {
      dealer: "EVM Motors South",
      target: 400000,
      achieved: 280000,
      period: "Quarterly",
    },
    {
      dealer: "EVM Motors West",
      target: 1200000,
      achieved: 900000,
      period: "Yearly",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Sales Target Management
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form Set New Target */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Set New Target
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dealer
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500">
                <option>Select a dealer</option>
                <option>EVM Motors North</option>
                <option>EVM Motors South</option>
                <option>EVM Motors Central</option>
                <option>EVM Motors West</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Period
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500">
                <option>Monthly</option>
                <option>Quarterly</option>
                <option>Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Amount
              </label>
              <input
                type="text"
                placeholder="e.g., 150000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Set Target
              </button>
            </div>
          </div>
        </div>

        {/* Current Targets & Progress */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Current Targets & Progress
          </h3>
          <div className="space-y-6">
            {targets.map((t, i) => {
              const percent = Math.round((t.achieved / t.target) * 100);
              return (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1">
                    <div>
                      <p className="font-medium text-gray-900">{t.dealer}</p>
                      <p className="text-sm text-gray-600">
                        Target:{" "}
                        <span className="font-semibold">
                          ${t.target.toLocaleString()}
                        </span>{" "}
                        | Achieved:{" "}
                        <span className="font-semibold">
                          ${t.achieved.toLocaleString()}
                        </span>
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">{t.period}</span>
                  </div>
                  <div className="w-full bg-indigo-100 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                  <p className="text-right text-sm font-medium text-gray-700 mt-1">
                    {percent}%
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesTargets;
