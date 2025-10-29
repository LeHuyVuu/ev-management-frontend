import React, { useEffect, useMemo, useState } from "react";
import { X, MapPin, User, Car } from "lucide-react";

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

const ORDER_STATUS_LIST = [
  { value: "draft", label: "Nháp" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "expired", label: "Hết hạn" },
  { value: "cancelled", label: "Đã hủy" },
];

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

// Simple skeleton
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

export default function DeliveryDetailCard({ delivery, isOpen, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Order status editor
  const [orderStatus, setOrderStatus] = useState("draft");
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState(false);

  // PATCH delivery info (no extra form)
  const [savingInfo, setSavingInfo] = useState(false);
  const [saveInfoError, setSaveInfoError] = useState("");

  // Token từ localStorage
  const token =
    typeof window !== "undefined" ? window.localStorage.getItem("token") : "";

  // Fetch chi tiết đơn hàng khi mở
  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!isOpen || !delivery?.id) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_ROOT}/${delivery.id}`, {
          headers: {
            accept: "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const d = json?.data || null;
        if (!ignore) {
          setDetail(d);
          // ưu tiên statusOrder, fallback status, cuối cùng draft
          const initial = (d?.statusOrder || d?.status || "draft").toLowerCase();
          setOrderStatus(initial);
        }
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

  // Chuẩn hoá dữ liệu hiển thị
  const ui = useMemo(() => {
    const d = detail || {};
    const displayStatus =
      viStatus[d.status] || viStatus[d.statusOrder] || delivery?.status || "Đang chờ";
    return {
      id: d?.id || d?.orderId || delivery?.id,
      customer: d.name || delivery?.customer,
      phone: d.phone || "+84 123 456 789",
      email: d.email || "customer@email.com",
      car: [d.brand, d.modelName].filter(Boolean).join(" ") || delivery?.car,
      color: d.color || "Trắng ngọc trai",
      address: d.deliveryAddress || delivery?.address,
      time: formatDateISOToVN(d.deliveryDate) || delivery?.time,
      note: d.note || "Giao hàng trong giờ hành chính",
      status: displayStatus,
    };
  }, [detail, delivery]);

  if (!isOpen || !delivery) return null;

  // ===== PATCH: Order status (with validation & correct field name) =====
  async function handleOrderStatusPatch() {
    const ALLOWED = new Set(["draft", "confirmed", "expired", "cancelled"]);
    const status = String(orderStatus || "").trim().toLowerCase();

    if (!ALLOWED.has(status)) {
      alert(
        "Invalid status value. Only accepted: draft, confirmed, expired, cancelled."
      );
      return;
    }

    // id thật sự (khớp với route GET)
    const id = (detail && (detail.id || detail.orderId)) || delivery?.id || "";
    if (!id) {
      alert("Thiếu order id.");
      return;
    }

    // khớp tên trường với payload server trả về
    const statusKey =
      detail && Object.prototype.hasOwnProperty.call(detail, "statusOrder")
        ? "statusOrder"
        : "status";

    try {
      setUpdatingOrderStatus(true);
      const res = await fetch(`${API_ROOT}/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify({ [statusKey]: status }),
      });

      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
          const j = await res.json();
          if (j?.message) msg = j.message;
        } catch (_) {}
        console.error("PATCH /status failed:", msg);
        throw new Error(msg);
      }

      // đồng bộ UI ngay
      setDetail((prev) => ({ ...(prev || {}), [statusKey]: status }));
      alert("Đã cập nhật trạng thái đơn hàng.");
    } catch (e) {
      alert(e?.message || "Cập nhật trạng thái đơn hàng thất bại");
    } finally {
      setUpdatingOrderStatus(false);
    }
  }

  // ===== PATCH: Delivery info (không tạo form – lấy từ dữ liệu hiển thị) =====
  async function handleSaveInfo() {
    const id = (detail && (detail.id || detail.orderId)) || delivery?.id || "";
    if (!id) {
      setSaveInfoError("Thiếu order id.");
      return;
    }
    try {
      setSavingInfo(true);
      setSaveInfoError("");
      const payload = {
        deliveryAddress: detail?.deliveryAddress || "",
        deliveryDate: detail?.deliveryDate || "",
        note: detail?.note || "",
      };
      const res = await fetch(`${API_ROOT}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
          const j = await res.json();
          if (j?.message) msg = j.message;
        } catch {}
        throw new Error(msg);
      }
      setDetail((prev) => ({ ...(prev || {}), ...payload }));
      alert("Đã cập nhật thông tin giao hàng.");
    } catch (e) {
      setSaveInfoError(e?.message || "Cập nhật thông tin giao hàng thất bại");
    } finally {
      setSavingInfo(false);
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
                        <p>
                          <span className="font-medium">Tên:</span> {ui.customer}
                        </p>
                        <p>
                          <span className="font-medium">Điện thoại:</span> {ui.phone}
                        </p>
                        <p>
                          <span className="font-medium">Email:</span> {ui.email}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-3">
                        <Car size={20} /> Thông tin xe
                      </h3>
                      <div className="space-y-2">
                        <p>
                          <span className="font-medium">Xe:</span> {ui.car}
                        </p>
                        <p>
                          <span className="font-medium">Màu:</span> {ui.color}
                        </p>
                        <p>
                          <span className="font-medium">VIN:</span> JTDKARFP8J0123456
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-3">
                      <MapPin size={20} /> Chi tiết giao hàng
                    </h3>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Địa chỉ:</span> {ui.address}
                      </p>
                      <p>
                        <span className="font-medium">Thời gian:</span> {ui.time}
                      </p>
                      <p>
                        <span className="font-medium">Ghi chú:</span> {ui.note}
                      </p>
                    </div>
                    {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
                    {saveInfoError && <div className="text-sm text-red-600 mt-2">{saveInfoError}</div>}
                  </div>
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order status API */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Trạng thái đơn hàng (API)</h3>
                <div className="space-y-3">
                  <select
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {ORDER_STATUS_LIST.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label} ({s.value})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleOrderStatusPatch}
                    disabled={updatingOrderStatus}
                    className="w-full bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    {updatingOrderStatus ? "Đang cập nhật…" : "Cập nhật trạng thái đơn hàng"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Giá trị hợp lệ: draft, confirmed, expired, cancelled.
                </p>

                <div className="mt-4">
                  <button
                    onClick={handleSaveInfo}
                    disabled={savingInfo}
                    className="w-full bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {savingInfo ? "Đang lưu…" : "Lưu thông tin giao hàng"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button onClick={onClose} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg">
            Đóng
          </button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg">In báo cáo</button>
        </div>
      </div>
    </div>
  );
}
