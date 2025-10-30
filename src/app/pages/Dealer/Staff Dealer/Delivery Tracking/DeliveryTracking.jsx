// DeliveryTracking.jsx
import React, { useEffect, useMemo, useState } from "react";
import NewDeliveryCard from "./components/NewDeliveryCard";
import DeliveryDetailCard from "./components/DeliveryDetailCard";
import { getMockDeliveries } from "../../../../context/mock/deliveries.mock";

const API_URL = "https://prn232.freeddns.org/customer-service/api/orders";

function getTokenFromLocalStorage() {
  const keys = ["access_token", "token", "authToken", "jwt"];
  for (const k of keys) {
    const v = window.localStorage.getItem(k);
    if (v) return v;
  }
  return null;
}

// Map status API -> UI (label + màu + progress)
const statusMap = {
  preparing: { label: "Đang chuẩn bị", color: "bg-yellow-500", progress: "w-1/6" },
  shipped_from_warehouse: { label: "Đã xuất kho", color: "bg-orange-500", progress: "w-2/6" },
  in_transit: { label: "Đang vận chuyển", color: "bg-blue-500", progress: "w-3/6" },
  arrived_hub: { label: "Đã đến", color: "bg-purple-500", progress: "w-4/6" },
  out_for_delivery: { label: "Đang giao hàng", color: "bg-indigo-500", progress: "w-5/6" },
  delivered: { label: "Đã hoàn thành", color: "bg-green-500", progress: "w-full" },
  failed: { label: "Giao hàng thất bại", color: "bg-red-500", progress: "w-full" },
  pending: { label: "Đang chờ", color: "bg-gray-500", progress: "w-0" },
};

// Tạo reverse map: VN label -> enum API
const vnToApi = Object.entries(statusMap).reduce((acc, [apiKey, v]) => {
  acc[v.label] = apiKey;
  return acc;
}, {});

function mapStatus(status) {
  if (!status) return { label: "Đang chờ", color: "bg-gray-500", progress: "w-0" };

  // 1) Nếu là enum API
  const asKey = String(status).toLowerCase();
  if (statusMap[asKey]) return statusMap[asKey];

  // 2) Nếu là nhãn VN
  const apiFromVN = vnToApi[status];
  if (apiFromVN && statusMap[apiFromVN]) return statusMap[apiFromVN];

  // 3) Fallback
  return { label: status || "Đang chờ", color: "bg-gray-500", progress: "w-1/4" };
}

function toApiStatus(status) {
  // nhận enum hoặc nhãn VN, trả về enum API (fallback pending)
  if (!status) return "pending";
  const asKey = String(status).toLowerCase();
  if (statusMap[asKey]) return asKey;          // đã là enum API
  return vnToApi[status] || "pending";         // là nhãn VN
}

function formatCar(brand, modelName, color) {
  const parts = [brand, modelName].filter(Boolean).join(" ");
  return [parts, color ? `(${color})` : ""].filter(Boolean).join(" ");
}

function formatDate(d) {
  if (!d) return "";
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
  
  // 🎯 Phân trang
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(12);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Load danh sách orders
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setErr("");
      try {
        let apiArr = [];

        // Lấy từ API
        try {
          const token = getTokenFromLocalStorage();
          if (token) {
            const res = await fetch(API_URL, {
              method: "GET",
              headers: {
                accept: "*/*",
                Authorization: `Bearer ${token}`,
              },
            });
            if (res.ok) {
              const json = await res.json();
              apiArr = Array.isArray(json?.data) ? json.data : [];
            }
          }
        } catch (apiErr) {
          console.warn("API error:", apiErr.message);
        }

        // 🎯 Lấy mock data
        const mockDeliveries = getMockDeliveries();

        // Gộp cả 2 vào
        const allArr = [...apiArr, ...mockDeliveries];

        const mapped = allArr.map((o) => {
          const st = mapStatus(o.status);
          return {
            id: o.orderId,
            customer: o.name,
            car: formatCar(o.brand, o.modelName, o.color),
            address: o.deliveryAddress || "",
            time: formatDate(o.deliveryDate),
            status: st.label,
            _raw: o,
            _style: st,
          };
        });

        if (mounted) setDeliveriesList(mapped);
      } catch (e) {
        if (mounted) setErr(e.message || "Không thể tải dữ liệu giao hàng.");
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
    setDeliveriesList((prev) => [newDelivery, ...prev]);
  };

  const handleViewDetail = (delivery) => {
    setSelectedDelivery(delivery);
    setShowDeliveryDetail(true);
  };

  // Nhận từ modal: newStatus có thể là enum API *hoặc* nhãn VN
  const handleUpdateStatus = (deliveryId, newStatus) => {
    const apiKey = toApiStatus(newStatus);
    const mapped = mapStatus(apiKey); // trả label + màu + progress

    setDeliveriesList((prev) =>
      prev.map((delivery) =>
        delivery.id === deliveryId
          ? { ...delivery, status: mapped.label, _style: mapped }
          : delivery
      )
    );

    if (selectedDelivery && selectedDelivery.id === deliveryId) {
      setSelectedDelivery((prev) => ({
        ...prev,
        status: mapped.label,
        _style: mapped,
      }));
    }
  };

  const filteredDeliveries = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    let filtered = !q
      ? deliveriesList
      : deliveriesList.filter(
          (delivery) =>
            delivery.id.toLowerCase().includes(q) ||
            (delivery.customer || "").toLowerCase().includes(q) ||
            (delivery.car || "").toLowerCase().includes(q)
        );

    // 🎯 Áp dụng phân trang
    const startIdx = (pageNumber - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const paginatedItems = filtered.slice(startIdx, endIdx);

    setTotalItems(filtered.length);
    setTotalPages(Math.ceil(filtered.length / pageSize));

    return paginatedItems;
  }, [searchTerm, deliveriesList, pageNumber, pageSize]);

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

      {/* 🎯 Pagination Controls */}
      {!loading && !err && totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-2">
          <button
            onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
            disabled={pageNumber === 1}
            className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            ← Trước
          </button>
          <span className="text-sm text-gray-600">
            Trang {pageNumber} / {totalPages} (Tổng: {totalItems})
          </span>
          <button
            onClick={() => setPageNumber(Math.min(totalPages, pageNumber + 1))}
            disabled={pageNumber === totalPages}
            className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Sau →
          </button>
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
  