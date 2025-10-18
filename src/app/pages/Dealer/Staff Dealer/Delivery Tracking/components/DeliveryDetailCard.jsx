import React, { useEffect, useMemo, useState } from "react";
import { X, MapPin, User, Car, Phone, Edit, CheckCircle, XCircle, Truck } from "lucide-react";

// ===== Config =====
const API_ROOT = "https://prn232.freeddns.org/customer-service/api/orders";

// ===== Helpers =====
const viStatus = {
  preparing: "Đang chuẩn bị",
  shipped_from_warehouse: "Đã xuất kho",
  in_transit: "Đang vận chuyển",
  arrived_hub: "Đã đến",
  out_for_delivery: "Đang giao hàng",
  delivered: "Đã hoàn thành",
  failed: "Giao hàng thất bại",
  pending: "Đang chờ",
};

// VN label list for dropdown
const statusOptions = [
  "Đang chuẩn bị",
  "Đã xuất kho",
  "Đang vận chuyển",
  "Đã đến",
  "Đang giao hàng",
  "Đã hoàn thành",
  "Giao hàng thất bại",
  "Đang chờ",
];

const statusColors = {
  "Đang chuẩn bị": "bg-yellow-500",
  "Đã xuất kho": "bg-orange-500",
  "Đang vận chuyển": "bg-blue-500",
  "Đã đến": "bg-purple-500",
  "Đang giao hàng": "bg-indigo-500",
  "Đã hoàn thành": "bg-green-500",
  "Giao hàng thất bại": "bg-red-500",
  "Đang chờ": "bg-gray-500",
};

// VN -> API enum map
const apiStatusMap = {
  "Đang chuẩn bị": "preparing",
  "Đã xuất kho": "shipped_from_warehouse",
  "Đang vận chuyển": "in_transit",
  "Đã đến": "arrived_hub",
  "Đang giao hàng": "out_for_delivery",
  "Đã hoàn thành": "delivered",
  "Giao hàng thất bại": "failed",
  "Đang chờ": "pending",
};

function formatDateISOToVN(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

// Skeleton component
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

export default function DeliveryDetailCard({ delivery, isOpen, onClose, onUpdateStatus }) {
  const [editMode, setEditMode] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Token lấy từ localStorage như yêu cầu
  const token = typeof window !== "undefined" ? window.localStorage.getItem("token") : "";

  // Fetch chi tiết đơn hàng khi mở
  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!isOpen || !delivery?.id) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_ROOT}/${delivery.id}`, {
          headers: { accept: "*/*", Authorization: token ? `Bearer ${token}` : undefined },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!ignore) setDetail(json?.data || null);
      } catch (e) {
        if (!ignore) setError(e?.message || "Không tải được chi tiết đơn hàng");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [isOpen, delivery?.id, token]);

  // Chuẩn hoá dữ liệu cho UI (giữ nguyên giao diện)
  const ui = useMemo(() => {
    const d = detail || {};
    const displayStatus = viStatus[d.status] || delivery?.status || "Đang chờ";
    return {
      id: d.orderId || delivery?.id,
      customer: d.name || delivery?.customer,
      phone: d.phone || "+84 123 456 789",
      email: d.email || "customer@email.com",
      car: [d.brand, d.modelName].filter(Boolean).join(" ") || delivery?.car,
      color: d.color || "Trắng ngọc trai",
      address: d.deliveryAddress || delivery?.address,
      time: formatDateISOToVN(d.deliveryDate) || delivery?.time,
      status: displayStatus,
    };
  }, [detail, delivery]);

  const [newStatus, setNewStatus] = useState(ui.status);
  useEffect(() => setNewStatus(ui.status), [ui.status]);

  if (!isOpen || !delivery) return null;

  const trackingHistory = [
    { status: "Đơn hàng được tạo", time: "2024-08-14 09:00", description: "Đơn giao hàng được khởi tạo trong hệ thống" },
    { status: "Đang chuẩn bị", time: "2024-08-14 10:30", description: "Xe đang được chuẩn bị và kiểm tra trước giao" },
    { status: "Đã xuất kho", time: "2024-08-15 08:00", description: "Xe đã được xuất khỏi kho và sẵn sàng vận chuyển" },
    { status: "Đang vận chuyển", time: "2024-08-15 09:30", description: "Xe đang trên đường vận chuyển đến địa chỉ khách hàng" },
  ];

  async function handleStatusUpdate() {
    try {
      setSaving(true);
      setSaveError("");
      const apiStatus = apiStatusMap[newStatus] || newStatus; // map VN -> enum
      const res = await fetch(`${API_ROOT}/${ui.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify({ status: apiStatus }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // cập nhật lạc quan và báo cho parent
      setDetail((prev) => ({ ...(prev || {}), status: apiStatus }));
      if (onUpdateStatus) onUpdateStatus(ui.id, newStatus);
      setEditMode(false);
    } catch (e) {
      setSaveError(e?.message || "Cập nhật trạng thái thất bại");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Chi tiết đơn giao hàng</h2>
            <p className="text-gray-600">Mã đơn hàng: {ui.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main */}
            <div className="lg:col-span-2 space-y-6">
              {loading ? (
                <>
                  <Skeleton className="h-32 w-full mb-4" />
                  <Skeleton className="h-32 w-full mb-4" />
                  <Skeleton className="h-24 w-full" />
                </>
              ) : (
                <>
                  {/* Customer & Vehicle Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-3">
                        <User size={20} /> Thông tin khách hàng
                      </h3>
                      <div className="space-y-2">
                        <p><span className="font-medium">Tên:</span> {ui.customer}</p>
                        <p><span className="font-medium">Điện thoại:</span> {ui.phone}</p>
                        <p><span className="font-medium">Email:</span> {ui.email}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-3">
                        <Car size={20} /> Thông tin xe
                      </h3>
                      <div className="space-y-2">
                        <p><span className="font-medium">Xe:</span> {ui.car}</p>
                        <p><span className="font-medium">Màu:</span> {ui.color}</p>
                        <p><span className="font-medium">VIN:</span> JTDKARFP8J0123456</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-3">
                      <MapPin size={20} /> Chi tiết giao hàng
                    </h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Địa chỉ:</span> {ui.address}</p>
                      <p><span className="font-medium">Thời gian:</span> {ui.time}</p>
                      <p><span className="font-medium">Ghi chú:</span> Giao hàng trong giờ hành chính</p>
                    </div>
                    {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
                  </div>

                 
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Trạng thái hiện tại</h3>
                {loading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-white text-sm ${statusColors[ui.status] || "bg-gray-500"}`}>
                      {ui.status}
                    </span>
                  </div>
                )}

                {editMode ? (
                  <div className="space-y-3">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={handleStatusUpdate}
                        disabled={saving}
                        className="flex-1 bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle size={16} className="inline mr-1" /> {saving ? "Đang lưu…" : "Lưu"}
                      </button>
                      <button
                        onClick={() => setEditMode(false)}
                        className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <XCircle size={16} className="inline mr-1" /> Hủy
                      </button>
                    </div>
                    {saveError && <div className="text-sm text-red-600 mt-2">{saveError}</div>}
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditMode(true);
                      setNewStatus(ui.status);
                    }}
                    className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit size={16} className="inline mr-2" /> Cập nhật trạng thái
                  </button>
                )}
              </div>

              {/* Actions */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Hành động</h3>
                {loading ? (
                  <Skeleton className="h-24 w-full" />
                ) : (
                  <div className="space-y-2">
                    <button className="w-full bg-green-600 text-white px-3 py-2 rounded-lg text-sm"><Phone size={16} className="inline mr-2" />Gọi khách hàng</button>
                    <button className="w-full bg-purple-600 text-white px-3 py-2 rounded-lg text-sm"><MapPin size={16} className="inline mr-2" />Xem bản đồ</button>
                    <button className="w-full bg-orange-600 text-white px-3 py-2 rounded-lg text-sm"><Truck size={16} className="inline mr-2" />Theo dõi GPS</button>
                    <button className="w-full border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm"><Edit size={16} className="inline mr-2" />Chỉnh sửa thông tin</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button onClick={onClose} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg">Đóng</button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg">In báo cáo</button>
        </div>
      </div>
    </div>
  );
}
