import React from "react";

const ContractsAndDebts = () => {
  const contractStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "valid":
        return "bg-indigo-100 text-indigo-700";
      case "terminated":
        return "bg-red-100 text-red-700";
      case "expiring":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const debtStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "due soon":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "paid":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const contracts = [
    {
      dealer: "EVM Motors North",
      status: "Valid",
      startDate: "2023-01-01",
      endDate: "2024-01-01",
    },
    {
      dealer: "EVM Motors South",
      status: "Expiring",
      startDate: "2023-03-15",
      endDate: "2023-12-31",
    },
    {
      dealer: "EVM Motors Central",
      status: "Terminated",
      startDate: "2022-06-01",
      endDate: "2023-06-01",
    },
    {
      dealer: "EVM Motors West",
      status: "Valid",
      startDate: "2023-09-01",
      endDate: "2024-09-01",
    },
  ];

  const debts = [
    {
      dealer: "EVM Motors North",
      amount: "$25,000",
      dueDate: "2023-12-15",
      status: "Due Soon",
    },
    {
      dealer: "EVM Motors Central",
      amount: "$75,000",
      dueDate: "2023-11-01",
      status: "Overdue",
    },
    {
      dealer: "EVM Motors East",
      amount: "$15,000",
      dueDate: "2024-01-01",
      status: "Due Soon",
    },
    {
      dealer: "EVM Motors South",
      amount: "$0",
      dueDate: "2023-11-30",
      status: "Paid",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Contracts & Debts
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contract Overview */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Contract Overview
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Dealer
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    End Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contracts.map((c, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {c.dealer}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${contractStatusColor(
                          c.status
                        )}`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {c.startDate}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {c.endDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Outstanding Debts */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Outstanding Debts
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Dealer
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Amount Owed
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {debts.map((d, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {d.dealer}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {d.amount}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {d.dueDate}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${debtStatusColor(
                          d.status
                        )}`}
                      >
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractsAndDebts;
