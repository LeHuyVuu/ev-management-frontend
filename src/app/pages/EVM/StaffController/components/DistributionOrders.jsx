import React, { useEffect, useState } from "react";
import { Eye, Plus } from "lucide-react";

/**
 * DistributionOrders
 * - Lấy dữ liệu thực từ VehicleAllocation API
 * - Giao diện bảng hiện đại
 * - Dùng lucide-react icons
 */

const API_TOKEN = localStorage.getItem("token");
export default function DistributionOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          "https://prn232.freeddns.org/order-service/api/VehicleAllocation?pageNumber=1&pageSize=10",
          {
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );

        const json = await res.json();
        if (json.status !== 200 || !json.data?.items) {
          throw new Error("Không thể tải dữ liệu đơn hàng.");
        }

        const mapped = json.data.items.map((item) => ({
          id: item.allocationId,
          dealer: item.dealerName,
          model: item.vehicleName,
          quantity: item.quantity,
          status: item.status,
          deliveryDate: item.expectedDelivery,
          requestDate: item.requestDate,
        }));

        setOrders(mapped);
      } catch (err) {
        setError(err.message || "Lỗi khi tải dữ liệu đơn hàng.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN");
  };

  const getStatusColor = (status = "") => {
    switch (status.toLowerCase()) {
      case "received":
        return "bg-gray-100 text-gray-700";
      case "in_transit":
        return "bg-blue-100 text-blue-700";
      case "at_dealer":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-50 text-yellow-700";
    }
  };

  const handleView = (id) => {
    alert(`Xem chi tiết đơn hàng ${id}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Các yêu cầu phân bổ hiện có        </h2>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2">
          <Plus size={18} />
          <span>Create New Order</span>
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-gray-500 italic">Đang tải dữ liệu...</p>
      ) : error ? (
        <p className="text-red-500 italic">Lỗi: {error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">
                  Dealer
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-center font-medium text-gray-500">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">
                  Expected Delivery
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">
                  Request Date
                </th>
                <th className="px-6 py-3 text-center font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td
                      className="px-6 py-3 font-medium text-gray-900"
                      title={order.id}
                    >
                      {order.id.slice(0, 8)}…
                    </td>
                    <td className="px-6 py-3 text-gray-700">{order.dealer}</td>
                    <td className="px-6 py-3 text-gray-700">{order.model}</td>
                    <td className="px-6 py-3 text-center text-gray-900">
                      {order.quantity}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status === "received"
                          ? "Đã nhận yêu cầu"
                          : order.status === "in_transit"
                            ? "Đang vận chuyển"
                            : order.status === "at_dealer"
                              ? "Tại đại lý"
                              : order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {formatDate(order.deliveryDate)}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {formatDate(order.requestDate)}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => handleView(order.id)}
                        className="text-gray-500 hover:text-indigo-600 transition"
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-6 text-center text-gray-500 italic"
                  >
                    Không có đơn hàng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
