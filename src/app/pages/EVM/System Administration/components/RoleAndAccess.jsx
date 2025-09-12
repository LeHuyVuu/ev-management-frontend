import React from "react";

const RoleAndAccess = () => {
  const actions = [
    { action: "View Products", roles: [true, true, true, true] },
    { action: "Edit Prices", roles: [true, true, false, true] },
    { action: "Manage Dealers", roles: [true, false, true, false] },
    { action: "View Reports", roles: [true, true, true, true] },
    { action: "Edit System Settings", roles: [true, false, false, false] },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Role & Access Control
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Action
              </th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                Admin
              </th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                EVM Staff
              </th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                Dealer Manager
              </th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                Dealer Staff
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {actions.map((row, i) => (
              <tr key={i}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {row.action}
                </td>
                {row.roles.map((enabled, j) => (
                  <td
                    key={j}
                    className="px-6 py-4 text-center text-sm text-gray-700"
                  >
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked={enabled}
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 relative transition-colors">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
                      </div>
                    </label>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoleAndAccess;
