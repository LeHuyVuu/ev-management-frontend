// QuoteDetailModal.jsx
import React, { useEffect, useState, useCallback } from "react";

const API_DETAIL_URL = "https://prn232.freeddns.org/customer-service/api/quotes";

/** Lấy token giống code gốc */
function getTokenFromLocalStorage() {
  const keys = ["access_token", "token", "authToken", "jwt"];
  for (const k of keys) {
    const v = window.localStorage.getItem(k);
    if (v) return v;
  }
  return null;
}

function formatVND(n) {
  if (typeof n !== "number") return n || "";
  return new Intl.NumberFormat("vi-VN").format(n) + " VND";
}

/** Toast tối giản (không cần lib) */
function showToast(message, type = "success") {
  const el = document.createElement("div");
  el.className =
    "pointer-events-auto fixed right-4 top-4 z-[9999] rounded-xl shadow-lg px-4 py-3 " +
    (type === "success"
      ? "bg-green-600 text-white"
      : type === "error"
      ? "bg-red-600 text-white"
      : "bg-gray-800 text-white");
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.transition = "opacity .3s";
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 300);
  }, 2200);
}

export default function QuoteDetailModal({ open, quoteId, onClose, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [detail, setDetail] = useState(null);

  // form state để PUT (ẩn trên UI nhưng vẫn lưu & gửi)
  const [customerId, setCustomerId] = useState("");
  const [vehicleVersionId, setVehicleVersionId] = useState("");
  const [optionsJson, setOptionsJson] = useState("");
  const [discountAmt, setDiscountAmt] = useState(0);
  const [status, setStatus] = useState("");

  const [saving, setSaving] = useState(false);

  const syncFormFromDetail = (d) => {
    setCustomerId(d?.customerId || "");
    setVehicleVersionId(d?.vehicleVersionId || "");
    setOptionsJson(
      typeof d?.optionsJson === "string"
        ? d.optionsJson
        : d?.optionsJson
        ? JSON.stringify(d.optionsJson)
        : ""
    );
    setDiscountAmt(Number.isFinite(Number(d?.discountAmt)) ? Number(d.discountAmt) : 0);
    setStatus(d?.status || "");
  };

  const fetchDetail = useCallback(async () => {
    if (!open || !quoteId) return;
    setLoading(true);
    setErr("");
    setDetail(null);
    try {
      const token = getTokenFromLocalStorage();
      if (!token) {
        setErr("Không tìm thấy token trong localStorage.");
        return;
      }
      const res = await fetch(`${API_DETAIL_URL}/${quoteId}`, {
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
      const d = json?.data || null;
      setDetail(d);
      syncFormFromDetail(d);
    } catch (e) {
      setErr(e.message || "Đã xảy ra lỗi khi tải chi tiết báo giá.");
    } finally {
      setLoading(false);
    }
  }, [open, quoteId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // Esc để đóng
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleSave = async (e) => {
    e?.preventDefault?.();
    if (!quoteId) return;

    const token = getTokenFromLocalStorage();
    if (!token) {
      showToast("Không tìm thấy token.", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        customerId: customerId || null,
        vehicleVersionId: vehicleVersionId || null,
        optionsJson: optionsJson ?? "",
        discountAmt: Number(discountAmt) || 0,
        status: status || "",
      };

      const res = await fetch(`${API_DETAIL_URL}/${quoteId}`, {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Cập nhật thất bại (${res.status}): ${text || res.statusText}`);
      }

      showToast("Cập nhật báo giá thành công!", "success");
      await fetchDetail();
      onUpdated?.(quoteId);
    } catch (e) {
      showToast(e.message || "Cập nhật thất bại.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          {/* BỎ hiển thị quoteId */}
          <h3 className="text-xl font-semibold">Chi tiết báo giá</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1 rounded-lg border hover:bg-gray-50 text-gray-700"
            >
              Đóng
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>

        {loading && (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        )}

        {!loading && err && <p className="text-red-600 text-sm">⚠️ {err}</p>}

        {!loading && !err && !detail && (
          <p className="text-gray-600 text-sm">Không tìm thấy dữ liệu.</p>
        )}

        {!loading && !err && detail && (
          <>
            {/* Info khái quát — KHÔNG hiển thị bất kỳ ID nào */}
            <div className="space-y-2 text-sm mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-gray-500">Khách hàng:</span>{" "}
                  <span className="font-medium">{detail.customerName}</span>
                </div>
                <div>
                  <span className="text-gray-500">SĐT:</span>{" "}
                  <span className="font-medium">{detail.customerPhone}</span>
                </div>
                <div>
                  <span className="text-gray-500">Hãng:</span>{" "}
                  <span className="font-medium">{detail.brand}</span>
                </div>
                <div>
                  <span className="text-gray-500">Mẫu:</span>{" "}
                  <span className="font-medium">{detail.modelName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Phiên bản:</span>{" "}
                  <span className="font-medium">{detail.versionName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Màu:</span>{" "}
                  <span className="font-medium">{detail.color}</span>
                </div>
              </div>

              <div className="pt-3 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-semibold">
                    {formatVND(Number(detail.subtotal))}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Giảm giá</span>
                  <span className="font-semibold">
                    {formatVND(Number(detail.discountAmt))}
                  </span>
                </div>
                <div className="flex items-center justify-between text-base mt-1">
                  <span className="text-gray-800 font-medium">Tổng cộng</span>
                  <span className="font-bold text-indigo-600">
                    {formatVND(Number(detail.totalPrice))}
                  </span>
                </div>
              </div>
            </div>

            {/* Form edit: ẨN các ô ID, chỉ cho sửa Options/Discount/Status */}
            <form onSubmit={handleSave} className="grid grid-cols-2 gap-4 text-sm">
              {/* customerId & vehicleVersionId giữ trong state nhưng KHÔNG render input */}

              <div className="col-span-2">
                <label className="block text-gray-600 mb-1">
                  Options JSON (chuỗi JSON hoặc text)
                </label>
                <textarea
                  rows={3}
                  value={optionsJson}
                  onChange={(e) => setOptionsJson(e.target.value)}
                  placeholder='{"phu_kien":"Camera 360"}'
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-gray-600 mb-1">Discount Amount</label>
                <input
                  type="number"
                  value={discountAmt}
                  onChange={(e) => setDiscountAmt(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-gray-600 mb-1">Status</label>
                <input
                  type="text"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  placeholder="draft | pending | confirmed | canceled"
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div className="col-span-2 flex items-center justify-end gap-2 mt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 rounded-lg border hover:bg-gray-50 text-gray-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>

            {/* Tag trạng thái */}
            <div className="pt-4">
              <span className="text-gray-600">Trạng thái hiện tại:</span>{" "}
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                {detail.status}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
