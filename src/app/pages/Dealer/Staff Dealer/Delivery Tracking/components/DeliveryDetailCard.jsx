import React, { useEffect, useMemo, useState } from "react";
import { X, MapPin, User, Car } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ===== Config =====
const API_ROOT = "https://prn232.freeddns.org/customer-service/api/orders";

// ===== Helpers =====
const viStatus = {
  "preparing": "Đang chuẩn bị",
  "shipped from warehouse": "Đã xuất kho",
  "in transit": "Đang vận chuyển",
  "arrived": "Đã đến điểm trung chuyển",
  "out for delivery": "Đang giao hàng",
  "completed": "Đã hoàn thành",
  "delivery failed": "Giao hàng thất bại",
  "waiting": "Đang chờ",
};

// Danh sách status theo backend
const DELIVERY_STATUS_LIST = [
  { value: "preparing", label: "Đang chuẩn bị" },
  { value: "shipped from warehouse", label: "Đã xuất kho" },
  { value: "in transit", label: "Đang vận chuyển" },
  { value: "arrived", label: "Đã đến điểm trung chuyển" },
  { value: "out for delivery", label: "Đang giao hàng" },
  { value: "completed", label: "Đã hoàn thành" },
  { value: "delivery failed", label: "Giao hàng thất bại" },
  { value: "waiting", label: "Đang chờ" },
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

  const [orderStatus, setOrderStatus] = useState("waiting");
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState(false);

  const [savingInfo, setSavingInfo] = useState(false);
  const [saveInfoError, setSaveInfoError] = useState("");

  const token =
    typeof window !== "undefined" ? window.localStorage.getItem("token") : "";

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
          const initial = d?.statusOrder || d?.status || "waiting";
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

  const ui = useMemo(() => {
    const d = detail || {};
    const displayStatus =
      viStatus[d?.status] ||
      viStatus[d?.statusOrder] ||
      viStatus[delivery?.status] ||
      "Đang chờ";
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

  // PATCH status (có toast)
  async function handleOrderStatusPatch() {
    const ALLOWED = new Set(DELIVERY_STATUS_LIST.map((s) => s.value));
    const status = String(orderStatus || "").trim();

    if (!ALLOWED.has(status)) {
      toast.error(
        "Giá trị trạng thái không hợp lệ! Hợp lệ: preparing, shipped from warehouse, in transit, arrived, out for delivery, completed, delivery failed, waiting."
      );
      return;
    }

    const id = (detail && (detail.id || detail.orderId)) || delivery?.id || "";
    if (!id) {
      toast.error("Thiếu order id.");
      return;
    }

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

      setDetail((prev) => ({ ...(prev || {}), [statusKey]: status }));
      toast.success("✅ Cập nhật trạng thái đơn hàng thành công!");
    } catch (e) {
      toast.error("❌ " + (e?.message || "Cập nhật trạng thái thất bại"));
    } finally {
      setUpdatingOrderStatus(false);
    }
  }

  // PATCH delivery info (có toast)
  async function handleSaveInfo() {
    const id = (detail && (detail.id || detail.orderId)) || delivery?.id || "";
    if (!id) {
      setSaveInfoError("Thiếu order id.");
      toast.error("Thiếu order id.");
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
      toast.success("💾 Lưu thông tin giao hàng thành công!");
    } catch (e) {
      setSaveInfoError(e?.message || "Cập nhật thông tin giao hàng thất bại");
      toast.error("❌ " + (e?.message || "Cập nhật thông tin giao hàng thất bại"));
    } finally {
      setSavingInfo(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <ToastContainer position="top-right" autoClose={2500} theme="colored" />
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
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Trạng thái đơn hàng (API)</h3>
                <div className="space-y-3">
                  <select
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {DELIVERY_STATUS_LIST.map((s) => (
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
                  Giá trị hợp lệ: preparing, shipped from warehouse, in transit, arrived, out for delivery, completed, delivery failed, waiting.
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
