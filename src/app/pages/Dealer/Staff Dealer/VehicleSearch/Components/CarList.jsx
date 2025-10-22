import { data } from "autoprefixer";
import React, { useEffect, useState } from "react";

// ===== Config =====
const BASE_URL =
  "https://prn232.freeddns.org/brand-service/api/vehicle-versions/dealer";
const TOKEN = localStorage.getItem("token");

function formatPrice(price) {
  return price.toLocaleString("vi-VN") + " ₫";
}

export default function CarList() {
  const [cars, setCars] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ===== Fetch data =====
  const fetchCars = async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BASE_URL}?pageNumber=${page}&pageSize=${pageSize}`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Không thể tải dữ liệu từ máy chủ.");

      const data = await res.json();

      if (data.status === 200 && data.data?.items) {
        setCars(data.data.items);
        setTotalPages(data.data.totalPages);
        setTotalItems(data.data.totalItems);
      } else {
        setError("Không có dữ liệu xe.");
      }
    } catch (err) {
      setError(data?.message || "Không thể tải dữ liệu từ máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars(pageNumber);
  }, [pageNumber]);

  // ===== Pagination handler =====
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPageNumber(newPage);
    }
  };

  // ===== Render =====
  if (loading) return <p>Đang tải dữ liệu xe...</p>;
  if (error) return <p className="text-red-600">Lỗi: {error}</p>;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">
          Kết quả Tìm kiếm ({totalItems} xe)
        </h2>
        <select className="border rounded-md px-2 py-1 text-sm">
          <option>Giá (Thấp đến Cao)</option>
          <option>Giá (Cao đến Thấp)</option>
          <option>Công suất (HP)</option>
        </select>
      </div>

      {/* Grid hiển thị xe */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cars.map((car) => (
          <div
            key={car.vehicleVersionId}
            className="border rounded-xl shadow-sm bg-white overflow-hidden flex flex-col relative"
          >
            {/* Badge */}
            {car.stockQuantity <= 10 && (
              <div className="absolute bg-red-500 text-white text-xs px-2 py-1 rounded-br-lg">
                Sắp hết hàng
              </div>
            )}

            {/* Ảnh */}
            <img
              src={
                car.imageUrl ||
                "https://via.placeholder.com/400x200?text=No+Image"
              }
              alt={`${car.brand} ${car.modelName}`}
              className="w-full h-40 object-cover"
            />

            {/* Nội dung */}
            <div className="p-3 flex-1 flex flex-col">
              <h3 className="font-medium text-sm mb-1">
                {car.brand} {car.modelName} {car.versionName}
              </h3>
              <p className="text-blue-600 font-bold text-lg mb-2">
                {formatPrice(car.basePrice)}
              </p>

              <div className="text-xs text-gray-600 mb-2 space-y-1">
                <p>
                  Màu: {car.color} • Kiểu: {car.evType}
                </p>
                <p>
                  HP: {car.horsePower} • Tồn kho: {car.stockQuantity}
                </p>
              </div>

              <div className="flex justify-between mt-auto">
                <label className="flex items-center space-x-1 text-sm">
                  <input type="checkbox" className="rounded" />
                  <span>So sánh</span>
                </label>
                <button className="text-sm text-blue-600 font-medium hover:underline">
                  Xem chi tiết
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center space-x-2 mt-6">
        <button
          onClick={() => handlePageChange(pageNumber - 1)}
          disabled={pageNumber === 1}
          className={`px-3 py-1 border rounded ${
            pageNumber === 1
              ? "text-gray-400 cursor-not-allowed"
              : "hover:bg-gray-100"
          }`}
        >
          ← Trước
        </button>

        <span className="text-sm">
          Trang {pageNumber} / {totalPages}
        </span>

        <button
          onClick={() => handlePageChange(pageNumber + 1)}
          disabled={pageNumber === totalPages}
          className={`px-3 py-1 border rounded ${
            pageNumber === totalPages
              ? "text-gray-400 cursor-not-allowed"
              : "hover:bg-gray-100"
          }`}
        >
          Sau →
        </button>
      </div>
    </div>
  );
}
