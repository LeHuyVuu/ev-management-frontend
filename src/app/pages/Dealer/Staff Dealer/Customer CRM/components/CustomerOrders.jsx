import React, { useEffect, useState } from "react";
import { Package, Clock } from "lucide-react";

export default function CustomerOrders({ customerId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://prn232.freeddns.org/customer-service/customers/${customerId}/orders`,
        {
          headers: { Accept: "*/*" },
        }
      );
      const json = await res.json();
      if (json.status === 200) {
        setOrders(json.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) fetchOrders();
  }, [customerId]);

  if (loading)
    return (
      <div className="text-center text-sm text-gray-500 mt-2">
        Đang tải đơn hàng...
      </div>
    );

  return (
    <div className="border-t pt-4 mt-4">
      <h3 className="text-md font-semibold mb-3 flex items-center gap-2">
        <Package size={18} className="text-blue-600" />
        Danh sách đơn hàng
      </h3>

      {orders.length === 0 ? (
        <p className="text-sm text-gray-500 italic">Chưa có đơn hàng nào.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div
              key={o.orderId}
              className="border rounded-lg px-4 py-3 bg-gray-50 hover:bg-gray-100 transition"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm text-gray-800">
                  Mã đơn: {o.orderId.slice(0, 8)}...
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    o.status === "preparing"
                      ? "bg-yellow-200 text-yellow-800"
                      : "bg-green-200 text-green-800"
                  }`}
                >
                  {o.status}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                <Clock size={12} />
                Ngày giao: {o.deliveryDate}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
