import React, { useEffect, useState } from "react";
import AddModelModal from "./AddModelModal";
import { Button, Input } from "antd";
import { EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";

// Map tên màu (VN/EN) -> mã hex gần đúng
const COLOR_MAP = {
  den: "#111827", // Đen
  do: "#B91C1C", // Đỏ
  xam: "#6B7280",
  trang: "#F3F4F6",
  xanh: "#2563EB", // Xanh dương
  "xanh la": "#10B981",
  bac: "#D1D5DB", // Silver
  vang: "#F59E0B",
  nau: "#92400E",
  tim: "#7C3AED",
};

// chuẩn hoá chuỗi để map màu (bỏ dấu, lowercase, chỉ lấy từ chính)
const normalize = (str = "") =>
  str
    .normalize("NFD")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

// lấy mã màu từ tên màu tự do
const resolveColor = (raw) => {
  if (!raw) return "#E5E7EB"; // xám nhạt
  const key = normalize(raw);
  console.log("Resolving color for:", raw, "->", key);
  // thử trực tiếp
  if (COLOR_MAP[key]) return COLOR_MAP[key];
  // tách từ để bắt cụm (vd: "Trắng ngọc trai" → "trang", "ngoc trai")
  const parts = key.split(/\s+/);
  for (let i = parts.length; i > 0; i--) {
    const probe = parts.slice(0, i).join(" ");
    if (COLOR_MAP[probe]) return COLOR_MAP[probe];
  }
  // fallback theo vài từ khoá phổ biến
  if (key.includes("den")) return COLOR_MAP.den;
  if (key.includes("do")) return COLOR_MAP.do;
  if (key.includes("xam") || key.includes("ghi")) return COLOR_MAP.xam;
  if (key.includes("trang")) return COLOR_MAP.trang;
  if (key.includes("xanh") && key.includes("la")) return COLOR_MAP["xanh la"];
  if (key.includes("xanh")) return COLOR_MAP.xanh;
  if (key.includes("bac")) return COLOR_MAP.bac;
  if (key.includes("vang")) return COLOR_MAP.vang;
  if (key.includes("nau")) return COLOR_MAP.nau;
  if (key.includes("tim")) return COLOR_MAP.tim;
  return "#E5E7EB";
};

// đơn giản hoá chuyện tương phản chữ trên nền pill
const isDark = (hex) => {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  // perceived luminance
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum < 0.6;
};

const EVModelManagement = ({ onModelAdded }) => {
  const [models, setModels] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [searchValue, setSearchValue] = useState("");

  const fetchModels = async (page, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://prn232.freeddns.org/brand-service/api/vehicle-versions?pageNumber=${page}&pageSize=${pageSize}&searchValue=${encodeURIComponent(
          search
        )}`
      );
      const json = await res.json();
      if (json.status === 200 && json.data) {
        setModels(json.data.items || []);
        setTotalPages(json.data.totalPages ?? 1);
      } else {
        throw new Error(json.message || "Failed to fetch data");
      }
    } catch (err) {
      setError(err.message);
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels(pageNumber);
  }, [pageNumber]);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchModels(1, searchValue);
    }, 400);

    return () => clearTimeout(delay);
  }, [searchValue]);

  const handleSearch = () => {
    fetchModels(1, searchValue);
  };

  const handlePrev = () =>
    pageNumber > 1 &&
    setPageNumber((p) => {
      fetchModels(p - 1, searchValue);
      return p - 1;
    });
  const handleNext = () =>
    pageNumber < totalPages &&
    setPageNumber((p) => {
      fetchModels(p + 1, searchValue);
      return p + 1;
    });

  // skeleton 5 hàng giữ bố cục bảng
  const SkeletonRow = ({ keyIdx }) => (
    <tr key={`sk-${keyIdx}`} className="animate-pulse">
      <td className="px-6 py-4">
        <div className="w-16 h-10 bg-gray-200 rounded-md" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
        <div className="h-3 w-24 bg-gray-100 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="h-6 w-20 bg-gray-100 rounded-full" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-24 bg-gray-100 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-10 bg-gray-100 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-24 bg-gray-100 rounded" />
      </td>
    </tr>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        {/* Left: Title */}
        <h2 className="text-xl font-bold text-gray-900 whitespace-nowrap">
          EV Model Management
        </h2>

        {/* Right: Search + Add */}
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm kiếm model hoặc phiên bản..."
            prefix={<SearchOutlined />}
            allowClear
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-72 !h-[38px] !rounded-md !border-gray-300 !text-sm !font-medium !text-gray-800"
            style={{ fontFamily: "inherit" }}
          />

          <button
            onClick={() => {
              setEditData(null);
              setModalOpen(true);
            }}
            className="h-[38px] px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <span>＋</span>
            <span>Add New Model</span>
          </button>
        </div>
      </div>

      {/* Table (khung luôn hiện) */}
      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="min-w-full border-collapse">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-blue-700 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-blue-700 uppercase tracking-wider">
                Model Version
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-blue-700 uppercase tracking-wider">
                Color
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-blue-700 uppercase tracking-wider">
                EV Type
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-blue-700 uppercase tracking-wider">
                EVM Stock
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-blue-700 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-blue-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100">
            {/* Loading skeleton rows */}
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow keyIdx={i} />
              ))}

            {/* Error message row (giữ khung bảng) */}
            {!loading && error && (
              <tr>
                <td className="px-6 py-6 text-center text-red-600" colSpan={6}>
                  ⚠️ {error}
                </td>
              </tr>
            )}

            {/* Empty state */}
            {!loading && !error && models.length === 0 && (
              <tr>
                <td className="px-6 py-6 text-center text-gray-500" colSpan={6}>
                  No models found
                </td>
              </tr>
            )}

            {/* Data rows */}
            {!loading &&
              !error &&
              models.length > 0 &&
              models.map((m) => {
                const bg = resolveColor(m.color);
                const dark = isDark(bg);
                return (
                  <tr key={m.vehicleVersionId} className="hover:bg-blue-50">
                    <td className="px-6 py-4">
                      <img
                        src={m.imageUrl}
                        alt={m.modelName}
                        className="w-16 h-10 object-cover rounded-md border border-gray-200"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg";
                        }}
                      />
                    </td>

                    {/* Model + Version cùng một dòng; version nhỏ & xám */}
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      <span>
                        {m.brand} {m.modelName}
                      </span>
                      <span className="ml-2 text-xs text-gray-500 font-normal">
                        {m.versionName}
                      </span>
                    </td>

                    {/* Color pill có màu thật */}
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 text-xs rounded-full border`}
                        style={{
                          backgroundColor: bg,
                          color: dark ? "#fff" : "#111827",
                          borderColor: dark
                            ? "rgba(255,255,255,0.25)"
                            : "#e5e7eb",
                        }}
                        title={m.color}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-white/50"
                          style={{ backgroundColor: bg }}
                        />
                        {m.color}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {m.evType}
                    </td>
                    <td className="px-6 py-4 text-sm text-center font-bold text-gray-900">
                      {m.stockQuantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {Number(m.basePrice || 0).toLocaleString("vi-VN")} ₫
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        size="small"
                        type="default"
                        icon={<EditOutlined />}
                        onClick={() => {
                          setEditData({
                            ...m,
                            versionId: m.vehicleVersionId,
                          });
                          setModalOpen(true);
                        }}
                      ></Button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && !error && models.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-500">
            Page {pageNumber} of {totalPages}
          </p>
          <div className="flex space-x-2">
            <button
              onClick={handlePrev}
              disabled={pageNumber === 1}
              className={`px-3 py-1 border rounded-md text-sm ${
                pageNumber === 1
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-blue-600 border-gray-300 hover:bg-blue-50"
              }`}
            >
              ← Prev
            </button>
            <button
              onClick={handleNext}
              disabled={pageNumber === totalPages}
              className={`px-3 py-1 border rounded-md text-sm ${
                pageNumber === totalPages
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-blue-600 border-gray-300 hover:bg-blue-50"
              }`}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <AddModelModal
        isOpen={modalOpen}
        mode={editData ? "edit" : "create"}
        initialData={editData ?? undefined}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          fetchModels(pageNumber);
          onModelAdded?.(); // 👈 gọi callback báo dashboard refresh
        }} // hàm có sẵn của bạn để reload
      />
    </div>
  );
};

export default EVModelManagement;
