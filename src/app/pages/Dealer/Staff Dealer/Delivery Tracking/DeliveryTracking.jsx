// DeliveryTracking.jsx
import React, { useEffect, useMemo, useState } from "react";
import NewDeliveryCard from "./components/NewDeliveryCard";
import DeliveryDetailCard from "./components/DeliveryDetailCard";

const API_URL = "https://prn232.freeddns.org/customer-service/api/orders";

function getTokenFromLocalStorage() {
  const keys = ["access_token", "token", "authToken", "jwt"];
  for (const k of keys) {
    const v = window.localStorage.getItem(k);
    if (v) return v;
  }
  return null;
}

// Map status từ API -> label VN + progress màu
const statusMap = {
  preparing: { label: "Đang chuẩn bị", color: "bg-black", progress: "w-2/4" },
  pending: { label: "Đang chờ", color: "bg-gray-500", progress: "w-1/4" },
  arrived: { label: "Đã đến", color: "bg-blue-500", progress: "w-3/4" },
  completed: { label: "Đã hoàn thành", color: "bg-green-500", progress: "w-full" },
};

function mapStatus(apiStatus) {
  const key = String(apiStatus || "").toLowerCase();
  return statusMap[key] || { label: apiStatus || "Đang chờ", color: "bg-gray-500", progress: "w-1/4" };
}

function formatCar(brand, modelName, color) {
  const parts = [brand, modelName].filter(Boolean).join(" ");
  return [parts, color ? `(${color})` : ""].filter(Boolean).join(" ");
}

function formatDate(d) {
  if (!d) return "";
  // API trả "YYYY-MM-DD", hiển thị dạng "YYYY-MM-DD 00:00" cho đồng nhất UI cũ
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${day} 00:00`;
  } catch {
    return d;
  }
}

export default function DeliveryTracking() {
  const [deliveriesList, setDeliveriesList] = useState([]);
  const [showNewDeliveryCard, setShowNewDeliveryCard] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showDeliveryDetail, setShowDeliveryDetail] = useState(false);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Load từ API orders
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setErr("");
      try {
        const token = getTokenFromLocalStorage();
        if (!token) {
          setErr("Không tìm thấy token trong localStorage.");
          setLoading(false);
          return;
        }
        const res = await fetch(API_URL, {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`API lỗi (${res.status}): ${text || res.statusText}`);
        }
        const json = await res.json();
        const arr = Array.isArray(json?.data) ? json.data : [];

        // Map về cấu trúc UI đang dùng
        const mapped = arr.map((o) => {
          const st = mapStatus(o.status);
          return {
            // các field UI cần
            id: o.orderId,
            customer: o.name,
            car: formatCar(o.brand, o.modelName, o.color),
            address: o.deliveryAddress || "",
            time: formatDate(o.deliveryDate),
            status: st.label,
            // giữ thêm info thô nếu modal detail cần xài
            _raw: o,
            _style: st, // chứa color, progress
          };
        });

        if (mounted) setDeliveriesList(mapped);
      } catch (e) {
        if (mounted) setErr(e.message || "Đã xảy ra lỗi khi tải đơn giao hàng.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleAddNewDelivery = (newDelivery) => {
    // newDelivery nên có cấu trúc giống deliveriesList item
    setDeliveriesList((prev) => [newDelivery, ...prev]);
  };

  const handleViewDetail = (delivery) => {
    setSelectedDelivery(delivery);
    setShowDeliveryDetail(true);
  };

  const handleUpdateStatus = (deliveryId, newStatusKey) => {
    // newStatusKey: dùng key của statusMap (e.g., 'preparing','pending','arrived','completed')
    const mapped = mapStatus(newStatusKey);
    setDeliveriesList((prev) =>
      prev.map((delivery) =>
        delivery.id === deliveryId
          ? { ...delivery, status: mapped.label, _style: mapped }
          : delivery
      )
    );
    if (selectedDelivery && selectedDelivery.id === deliveryId) {
      setSelectedDelivery((prev) => ({ ...prev, status: mapped.label, _style: mapped }));
    }
  };

  const filteredDeliveries = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return deliveriesList;
    return deliveriesList.filter(
      (delivery) =>
        delivery.id.toLowerCase().includes(q) ||
        (delivery.customer || "").toLowerCase().includes(q) ||
        (delivery.car || "").toLowerCase().includes(q)
    );
  }, [searchTerm, deliveriesList]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Theo dõi Giao hàng</h1>
        <button
          onClick={() => setShowNewDeliveryCard(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Thêm Giao hàng Mới
        </button>
      </div>

      <input
        type="text"
        placeholder="Tìm kiếm theo mã đơn hàng, khách hàng..."
        className="w-full border rounded-lg px-4 py-2 mb-6"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 shadow-sm bg-white animate-pulse">
              <div className="h-4 w-1/2 bg-gray-200 rounded mb-2" />
              <div className="h-5 w-2/3 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-1/2 bg-gray-200 rounded mb-2" />
              <div className="h-2 w-full bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      )}

      {!loading && err && <p className="text-red-600 text-sm mb-4">⚠️ {err}</p>}

      {!loading && !err && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredDeliveries.map((d) => {
            const color = d._style?.color || "bg-gray-500";
            const progress = d._style?.progress || "w-1/4";
            return (
              <div
                key={d.id}
                className="border rounded-lg p-4 shadow-sm bg-white flex flex-col justify-between"
              >
                <div>
                  <p className="text-sm text-gray-500">Mã đơn hàng: {d.id}</p>
                  <h2 className="text-lg font-semibold">{d.customer}</h2>
                  <p className="text-sm text-gray-700 mt-2">{d.car}</p>
                  <p className="text-sm text-gray-700 mt-1">{d.address}</p>
                  <p className="text-sm text-gray-700 mt-1">{d.time}</p>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-white text-xs px-2 py-1 rounded ${color}`}>
                      {d.status}
                    </span>
                    <button
                      onClick={() => handleViewDetail(d)}
                      className="text-blue-600 hover:underline"
                    >
                      Chi tiết
                    </button>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`${color} h-2 rounded-full ${progress}`}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Delivery Card Modal */}
      <NewDeliveryCard
        isOpen={showNewDeliveryCard}
        onClose={() => setShowNewDeliveryCard(false)}
        onSubmit={handleAddNewDelivery}
      />

      {/* Delivery Detail Modal */}
      <DeliveryDetailCard
        delivery={selectedDelivery}
        isOpen={showDeliveryDetail}
        onClose={() => {
          setShowDeliveryDetail(false);
          setSelectedDelivery(null);
        }}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
