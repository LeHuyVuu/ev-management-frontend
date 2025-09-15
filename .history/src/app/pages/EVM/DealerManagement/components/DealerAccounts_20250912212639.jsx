import React from "react";

const DealerAccounts = () => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "locked":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const dealers = [
    {
      name: "EVM Motors North",
      contact: "john.doe@evm.com",
      role: "Dealer Manager",
      status: "Active",
      lastActivity: "2023-11-28",
    },
    {
      name: "EVM Motors South",
      contact: "jane.smith@evm.com",
      role: "Dealer Staff",
      status: "Active",
      lastActivity: "2023-11-27",
    },
    {
      name: "EVM Motors Central",
      contact: "alex.k@evm.com",
      role: "Dealer Manager",
      status: "Locked",
      lastActivity: "2023-11-20",
    },
    {
      name: "EVM Motors West",
      contact: "sarah.l@evm.com",
      role: "Dealer Staff",
      status: "Active",
      lastActivity: "2023-11-29",
    },
    {
      name: "EVM Motors East",
      contact: "mike.t@evm.com",
      role: "Dealer Manager",
      status: "Active",
      lastActivity: "2023-11-26",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Title + Actions */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dealer Accounts</h2>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            + Create Account
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
            <span>⚙️</span>
            <span>Assign Roles</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Dealer Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Role
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Last Activity
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dealers.map((dealer, index) => (
              <tr key={index}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {dealer.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {dealer.contact}
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                    {dealer.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      dealer.status
                    )}`}
                  >
                    {dealer.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {dealer.lastActivity}
                </td>
                <td className="px-6 py-4 text-sm space-x-3 flex items-center">
                  {/* Lock */}
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    title="Lock/Unlock"
                  >
                    🔒
                  </button>
                  {/* Edit */}
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  {/* Delete */}
                  <button
                    className="text-gray-500 hover:text-red-600"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DealerAccounts;
