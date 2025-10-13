import React, { useEffect, useState } from "react";

const RoleAndAccess = () => {
  const [roles, setRoles] = useState([]);
  const [actions, setActions] = useState([
    { action: "View Products", roles: [true, true, true, true, false] },
    { action: "Edit Prices", roles: [true, true, false, true, false] },
    { action: "Manage Dealers", roles: [true, false, true, false, false] },
    { action: "View Reports", roles: [true, true, true, true, true] },
    { action: "Edit System Settings", roles: [true, false, false, false, false] },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch(
          "https://prn232.freeddns.org/identity-service/api/admin/roles",
          { headers: { accept: "text/plain" } }
        );
        const data = await res.json();
        if (data.status === 200) {
          setRoles(data.data);
        } else {
          throw new Error("Failed to load roles");
        }
      } catch (err) {
        setError("Không thể tải danh sách roles.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  if (loading)
    return (
      <div className="text-center py-8 text-gray-500 animate-pulse">
        Đang tải vai trò...
      </div>
    );

  if (error)
    return <div className="text-red-600 text-center py-6">{error}</div>;

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
              {roles.map((role) => (
                <th
                  key={role.roleId}
                  className="px-6 py-3 text-center text-sm font-medium text-gray-500"
                >
                  {role.roleName}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {actions.map((row, i) => (
              <tr key={i}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {row.action}
                </td>

                {roles.map((role, j) => (
                  <td
                    key={role.roleId}
                    className="px-6 py-4 text-center text-sm text-gray-700"
                  >
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked={row.roles[j] || false}
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
