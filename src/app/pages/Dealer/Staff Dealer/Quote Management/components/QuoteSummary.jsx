import React, { useEffect, useState } from "react";
import { FileText } from "lucide-react";

function formatVND(n) {
  const num = Number(n || 0);
  try {
    return num.toLocaleString("vi-VN") + " VND";
  } catch {
    return `${num} VND`;
  }
}

export default function QuoteSummary() {
  const [data, setData] = useState({
    // khách
    customerName: "—",
    customerPhone: "—",
    email: "",
    address: "",
    // xe
    vehicleVersionId: "",
    brand: "—",
    modelName: "—",
    versionName: "—",
    color: "—",
    evType: "",
    horsePower: null,
    imageUrl: "",
    stockQuantity: null,
    // giá
    basePrice: 0,
    promotions: [],
    discountAmt: 0,
  });

  useEffect(() => {
    function onPreview(e) {
      const detail = (e && e.detail) || {};
      setData((prev) => ({ ...prev, ...detail }));
    }
    if (typeof window !== "undefined") {
      window.addEventListener("quote:preview", onPreview);
      return () => window.removeEventListener("quote:preview", onPreview);
    }
  }, []);

  const subtotal = Number(data.basePrice || 0);
  const discount = Math.min(Number(data.discountAmt || 0), subtotal);
  const total = Math.max(subtotal - discount, 0);

  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm w-full max-w-md">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-4">
        <FileText className="text-blue-500" size={20} />
        <h3 className="font-semibold text-base">Tóm tắt Báo giá</h3>
      </div>

      {/* Ảnh xe (nếu có) */}
      {data.imageUrl ? (
        <div className="mb-3">
          <img
            src={data.imageUrl}
            alt={`${data.brand} ${data.modelName}`}
            className="w-full h-40 object-cover rounded-lg"
          />
        </div>
      ) : null}

      {/* Thông tin khách hàng */}
      <div className="text-sm space-y-2">
        <div className="flex justify-between">
          <span>Khách hàng</span>
          <span className="font-medium text-right">{data.customerName || "—"}</span>
        </div>
        <div className="flex justify-between">
          <span>Số điện thoại</span>
          <span className="text-right">{data.customerPhone || "—"}</span>
        </div>
        {data.email ? (
          <div className="flex justify-between">
            <span>Email</span>
            <span className="text-right">{data.email}</span>
          </div>
        ) : null}
        {data.address ? (
          <div className="flex justify-between">
            <span>Địa chỉ</span>
            <span className="text-right">{data.address}</span>
          </div>
        ) : null}

        <hr className="my-2" />

        {/* Thông tin xe */}
        <div className="flex justify-between">
          <span>Dòng xe</span>
          <span className="text-right">
            {data.brand && data.modelName ? `${data.brand} ${data.modelName}` : "—"}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Phiên bản</span>
          <span className="text-right">{data.versionName || "—"}</span>
        </div>
        <div className="flex justify-between">
          <span>Màu sắc</span>
          <span className="text-right">{data.color || "—"}</span>
        </div>
        {data.evType ? (
          <div className="flex justify-between">
            <span>Dòng xe (EV type)</span>
            <span className="text-right">{data.evType}</span>
          </div>
        ) : null}
        {data.horsePower ? (
          <div className="flex justify-between">
            <span>Công suất</span>
            <span className="text-right">{data.horsePower} hp</span>
          </div>
        ) : null}
        {Number.isFinite(data.stockQuantity) && data.stockQuantity !== null ? (
          <div className="flex justify-between">
            <span>Tồn kho</span>
            <span className="text-right">{data.stockQuantity}</span>
          </div>
        ) : null}

        {/* Khuyến mãi */}
        <div className="flex justify-between mt-2">
          <span>Khuyến mãi đã chọn</span>
          <span className="text-right">
            {data.promotions && data.promotions.length
              ? data.promotions.join(", ")
              : "—"}
          </span>
        </div>

        <hr className="my-2" />

        {/* Giá & Tổng */}
        <div className="flex justify-between">
          <span>Giá xe (base price)</span>
          <span className="text-right">{formatVND(subtotal)}</span>
        </div>
        {/* <div className="flex justify-between text-red-500">
          <span>Giảm giá</span>
          <span className="text-right">-{formatVND(discount)}</span>
        </div> */}
        <hr />
        <div className="flex justify-between font-semibold text-lg">
          <span>Tổng cộng</span>
          <span className="text-right">{formatVND(total)}</span>
        </div>
      </div>
    </div>
  );
}
