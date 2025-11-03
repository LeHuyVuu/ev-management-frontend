import React, { useEffect, useState } from "react";
import { Package, Clock, X, Filter } from "lucide-react";

export default function CustomerOrders({ customerId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://prn232.freeddns.org/customer-service/customers/${customerId}/orders`,
        { headers: { Accept: "*/*" } }
      );
      const json = await res.json();
      if (json.status === 200) setOrders(json.data);
      else setOrders([]);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) fetchOrders();
  }, [customerId]);

  // --- Lọc theo trạng thái ---
  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter(
          (o) => (o.status || "").toLowerCase() === statusFilter.toLowerCase()
        );

  // --- Xem chi tiết ---
  async function openDetail(orderId) {
    setOpen(true);
    setDetail(null);
    setDetailError("");
    setDetailLoading(true);
    try {
      const res = await fetch(
        `https://prn232.freeddns.org/customer-service/api/orders/${orderId}`,
        { headers: { Accept: "application/json" } }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setDetail(json?.data ?? json);
    } catch (e) {
      setDetailError(e?.message || "Không tải được chi tiết đơn hàng");
    } finally {
      setDetailLoading(false);
    }
  }

  const closeDetail = () => {
    setOpen(false);
    setDetail(null);
    setDetailError("");
  };

  const fmtDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return `${d.getDate().toString().padStart(2, "0")}/${(
      d.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${d.getFullYear()}`;
  };

  const STATUSES = [
    "all",
    "preparing",
    "shipped from warehouse",
    "in transit",
    "arrived",
    "out for delivery",
    "completed",
    "delivery failed",
    "waiting",
  ];

  return (
    <div className="border-t pt-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-md font-semibold flex items-center gap-2">
          <Package size={18} className="text-blue-600" />
          Danh sách đơn hàng
        </h3>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-md px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "Tất cả" : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-sm text-gray-500">Đang tải...</div>
      ) : filteredOrders.length === 0 ? (
        <p className="text-sm text-gray-500 italic">
          Không có đơn hàng nào phù hợp.
        </p>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((o) => (
            <button
              key={o.orderId}
              onClick={() => openDetail(o.orderId)}
              className="w-full text-left border rounded-lg px-4 py-3 bg-gray-50 hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm text-gray-800">
                  Mã đơn: {o.orderId?.slice(0, 8)}...
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    o.status === "preparing"
                      ? "bg-yellow-200 text-yellow-800"
                      : o.status === "completed"
                      ? "bg-green-200 text-green-800"
                      : o.status === "delivery failed"
                      ? "bg-red-200 text-red-800"
                      : "bg-blue-200 text-blue-800"
                  }`}
                >
                  {o.status}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                <Clock size={12} />
                Ngày giao: {fmtDate(o.deliveryDate)}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Popup chi tiết */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeDetail}
          ></div>
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h4 className="text-lg font-semibold">Chi tiết đơn hàng</h4>
              <button
                onClick={closeDetail}
                className="p-2 rounded hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 max-h-[70vh] overflow-y-auto">
              {detailLoading && (
                <div className="text-sm text-gray-500">Đang tải...</div>
              )}
              {detailError && (
                <div className="text-sm text-red-600">{detailError}</div>
              )}
              {!detailLoading && !detailError && detail && (
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                  {JSON.stringify(detail, null, 2)}
                </pre>
              )}
            </div>
            <div className="px-5 py-3 border-t flex justify-end bg-gray-50">
              <button
                onClick={closeDetail}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-white"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
