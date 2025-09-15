import React from "react";

const UserManagement = () => {
  const users = [
    { name: "Alice Smith", email: "alice.s@evm.com", role: "Admin", status: "Active" },
    { name: "Bob Johnson", email: "bob.j@evm.com", role: "EVM Staff", status: "Active" },
    { name: "Charlie Brown", email: "charlie.b@dealers.com", role: "Dealer Manager", status: "Active" },
    { name: "Diana Prince", email: "diana.p@evm.com", role: "EVM Staff", status: "Inactive" },
    { name: "Eve Adams", email: "eve.a@dealers.com", role: "Dealer Staff", status: "Locked" },
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "text-green-600 font-semibold";
      case "inactive":
        return "text-gray-500 bg-gray-100 px-2 py-1 rounded-full text-xs";
      case "locked":
        return "text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs font-semibold";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">User Management</h2>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center space-x-2">
            <span>＋</span>
            <span>Add User</span>
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
            Edit
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
            Delete
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">User Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Role</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user, i) => (
              <tr key={i}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{user.role}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={getStatusColor(user.status)}>{user.status}</span>
                </td>
                <td className="px-6 py-4 text-sm flex space-x-3">
                  <button className="text-gray-500 hover:text-indigo-600" title="Edit">✏️</button>
                  <button className="text-gray-500 hover:text-red-600" title="Delete">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
