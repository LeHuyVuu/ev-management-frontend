import React from "react";

const OrderDistribution = () => {
  const orders = [
    {
      source: "EVM Motors North",
      destination: "EVM Motors South",
      product: "EV Model A",
      quantity: 10,
      date: "2023-12-20",
      status: "Processing",
    },
    {
      source: "EVM Motors West",
      destination: "EVM Motors Central",
      product: "Spare Part B",
      quantity: 50,
      date: "2023-12-25",
      status: "Processing",
    },
    {
      source: "EVM Motors East",
      destination: "EVM Motors North",
      product: "EV Model C",
      quantity: 5,
      date: "2024-01-05",
      status: "Confirmed",
    },
    {
      source: "EVM Motors South",
      destination: "EVM Motors West",
      product: "Spare Part D",
      quantity: 20,
      date: "2024-01-10",
      status: "Processing",
    },
    {
      source: "EVM Motors Central",
      destination: "EVM Motors East",
      product: "EV Model E",
      quantity: 8,
      date: "2024-01-15",
      status: "Cancelled",
    },
  ];

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "processing":
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Order Distribution
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Table */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Pending Orders
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm text-gray-500">Source</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-500">Destination</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-500">Product</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-500">Qty</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-500">Date</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-500">Status</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 text-sm text-gray-700">{order.source}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{order.destination}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{order.product}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{order.quantity}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{order.date}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500 space-x-2">
                      <button className="text-green-600 hover:text-green-800">✔</button>
                      <button className="text-red-600 hover:text-red-800">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* New Order Form */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Create New Order
          </h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Source Dealer</label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500">
                <option>Select source dealer</option>
                <option>EVM Motors North</option>
                <option>EVM Motors West</option>
                <option>EVM Motors East</option>
                <option>EVM Motors South</option>
                <option>EVM Motors Central</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Destination Dealer</label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500">
                <option>Select destination dealer</option>
                <option>EVM Motors North</option>
                <option>EVM Motors West</option>
                <option>EVM Motors East</option>
                <option>EVM Motors South</option>
                <option>EVM Motors Central</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Product</label>
              <input
                type="text"
                placeholder="Enter product name"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                placeholder="Enter quantity"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Delivery Date</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Order
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderDistribution;
