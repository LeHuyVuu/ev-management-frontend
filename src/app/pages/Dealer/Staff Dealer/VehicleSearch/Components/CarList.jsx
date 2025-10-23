import React, { useEffect, useState } from "react";

const BASE_URL =
  "https://prn232.freeddns.org/brand-service/api/vehicle-versions/dealer-stock";
const TOKEN = localStorage.getItem("token");

function formatPrice(price) {
  return price.toLocaleString("vi-VN") + " ₫";
}

export default function CarList({ filters }) {
  const [cars, setCars] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gọi API backend có filter & phân trang
  const fetchCars = async (page = 1) => {
  setLoading(true);
  setError(null);

  try {
    // ✅ Danh sách màu cần fetch (nếu không chọn màu nào thì fetch 1 lần)
    const colorsToFetch =
      filters.selectedColors?.length > 0 ? filters.selectedColors : [null];

    // ✅ Gọi nhiều request song song
    const responses = await Promise.all(
      colorsToFetch.map(async (color) => {
        const params = new URLSearchParams({
          pageNumber: page,
          pageSize: pageSize,
        });

        // Các filter khác
        if (filters.searchValue)
          params.append("searchValue", filters.searchValue);
        if (filters.selectedModel && filters.selectedModel !== "Tất cả")
          params.append("vehicleId", filters.selectedModel);
        if (filters.priceMin) params.append("minPrice", filters.priceMin);
        if (filters.priceMax) params.append("maxPrice", filters.priceMax);

        // ✅ Nếu có chọn màu → thêm vào searchValue để backend lọc
        if (color) params.append("searchValue", color);

        const url = `${BASE_URL}?${params.toString()}`;
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Không thể tải dữ liệu từ máy chủ.");

        const data = await res.json();
        if (data.status === 200 && data.data?.items) {
          return {
            items: data.data.items,
            totalItems: data.data.totalItems || 0,
            totalPages: data.data.totalPages || 1,
          };
        }
        return { items: [], totalItems: 0, totalPages: 1 };
      })
    );

    // ✅ Gộp toàn bộ kết quả (multi-color)
    const allItems = responses.flatMap((r) => r.items);
    const unique = Array.from(
      new Map(allItems.map((c) => [c.vehicleVersionId, c])).values()
    );

    // ✅ Nếu chỉ chọn 1 màu → dùng total từ backend
    if (responses.length === 1) {
      const res = responses[0];
      setCars(res.items);
      setTotalItems(res.totalItems);
      setTotalPages(res.totalPages);
    } else {
      // ✅ Nếu nhiều màu → gộp kết quả thủ công
      setCars(unique);
      setTotalItems(unique.length);
      setTotalPages(Math.ceil(unique.length / pageSize));
    }
  } catch (err) {
    setError(err.message || "Không thể tải dữ liệu từ máy chủ.");
  } finally {
    setLoading(false);
  }
};



  // gọi lại API khi filter hoặc page thay đổi
  useEffect(() => {
    fetchCars(pageNumber);
  }, [filters, pageNumber]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPageNumber(newPage);
  };

  if (loading) {
    return (
      <div className="flex-1">
        <div className="grid grid-cols-3 gap-4 opacity-50 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) return <p className="text-red-600">Lỗi: {error}</p>;

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">
          Kết quả Tìm kiếm ({totalItems} xe)
        </h2>
      </div>

      {/* Danh sách xe */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cars.map((car) => (
          <div
            key={car.vehicleVersionId}
            className="border rounded-xl shadow-sm bg-white overflow-hidden flex flex-col relative"
          >
            {/* Badge tồn kho */}
            {car.stockQuantity === 0 ? (
              <div className="absolute bg-gray-700 text-white text-xs px-2 py-1 rounded-br-lg">
                Hết hàng
              </div>
            ) : car.stockQuantity <= 10 ? (
              <div className="absolute bg-red-500 text-white text-xs px-2 py-1 rounded-br-lg">
                Sắp hết hàng
              </div>
            ) : (
              <div className="absolute bg-green-600 text-white text-xs px-2 py-1 rounded-br-lg">
                Còn hàng
              </div>
            )}

            <img
              src={
                car.imageUrl ||
                "https://via.placeholder.com/400x200?text=No+Image"
              }
              alt={`${car.brand} ${car.modelName}`}
              className="w-full h-40 object-cover"
            />

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
