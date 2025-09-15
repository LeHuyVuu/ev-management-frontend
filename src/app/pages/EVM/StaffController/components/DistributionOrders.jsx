import React from "react";

const DistributionOrders = () => {
  const orders = [
    {
      id: "DO-2024-001",
      dealer: "EVM Dealer Saigon",
      model: "EVM Model Y",
      quantity: 10,
      status: "Processing",
      deliveryDate: "2024-07-15",
    },
    {
      id: "DO-2024-002",
      dealer: "EVM Dealer Hanoi",
      model: "EVM Model X",
      quantity: 5,
      status: "Delivered",
      deliveryDate: "2024-07-01",
    },
    {
      id: "DO-2024-003",
      dealer: "EVM Dealer Danang",
      model: "EVM Model Z",
      quantity: 8,
      status: "Processing",
      deliveryDate: "2024-07-20",
    },
    {
      id: "DO-2024-004",
      dealer: "EVM Dealer Can Tho",
      model: "EVM Model X",
      quantity: 12,
      status: "Cancelled",
      deliveryDate: "2024-07-05",
    },
    {
      id: "DO-2024-005",
      dealer: "EVM Dealer Haiphong",
      model: "EVM Model Y",
      quantity: 7,
      status: "Delivered",
      deliveryDate: "2024-07-10",
    },
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Distribution Orders</h2>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center space-x-2">
          <span>＋</span>
          <span>Create New Order</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Dealer
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Model
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Delivery Date
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order, i) => (
              <tr key={i}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {order.id}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {order.dealer}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {order.model}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {order.quantity}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {order.deliveryDate}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 text-center">
                  <button
                    className="text-gray-500 hover:text-indigo-600"
                    title="View Details"
                  >
                    👁️
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

export default DistributionOrders;
