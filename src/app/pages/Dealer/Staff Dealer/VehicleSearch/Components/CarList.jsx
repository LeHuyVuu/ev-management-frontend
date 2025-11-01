import React, { useEffect, useState } from "react";

const BASE_URL =
  "https://prn232.freeddns.org/brand-service/api/vehicle-versions/dealer-stock";
const DETAIL_URL =
  "https://prn232.freeddns.org/brand-service/api/vehicle-versions";
const TOKEN = localStorage.getItem("token");

function formatPrice(price) {
  return price?.toLocaleString("vi-VN") + " ₫";
}

export default function CarList({ filters }) {
  const [cars, setCars] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState("");

  const [selectedCar, setSelectedCar] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  const fetchCars = async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        pageNumber: page,
        pageSize: pageSize,
      });

      if (filters.searchValue)
        params.append("searchValue", filters.searchValue);
      if (filters.selectedModel && filters.selectedModel !== "Tất cả")
        params.append("vehicleId", filters.selectedModel);
      if (filters.priceMin) params.append("minPrice", filters.priceMin);
      if (filters.priceMax) params.append("maxPrice", filters.priceMax);

      // ✅ Thêm danh sách màu (dạng list<string>)
      if (filters.selectedColors?.length > 0) {
        filters.selectedColors.forEach((color) =>
          params.append("colors", color)
        );
      }

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
        setCars(data.data.items);
        setTotalItems(data.data.totalItems || 0);
        setTotalPages(data.data.totalPages || 1);
      } else {
        setCars([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (err) {
      setError(err.message || "Không thể tải dữ liệu từ máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars(pageNumber);
  }, [filters, pageNumber]);

  const sortedCars = React.useMemo(() => {
    let sorted = [...cars];
    if (sortOption === "priceLowHigh")
      sorted.sort((a, b) => a.basePrice - b.basePrice);
    else if (sortOption === "priceHighLow")
      sorted.sort((a, b) => b.basePrice - a.basePrice);
    else if (sortOption === "horsePower")
      sorted.sort((a, b) => b.horsePower - a.horsePower);
    return sorted;
  }, [cars, sortOption]);

  const fetchCarDetail = async (vehicleVersionId, setFunc) => {
    try {
      const res = await fetch(`${DETAIL_URL}/${vehicleVersionId}/dealer`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.status === 200 && data.data) {
        setFunc(data.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải chi tiết xe:", error);
    }
  };

  const toggleCompare = (car) => {
    setCompareList((prev) => {
      const exists = prev.find(
        (c) => c.vehicleVersionId === car.vehicleVersionId
      );

      // Nếu xe đã tồn tại → bỏ chọn
      if (exists) {
        return prev.filter((c) => c.vehicleVersionId !== car.vehicleVersionId);
      }

      // Giới hạn tối đa 5 xe
      if (prev.length >= 5) {
        alert("Chỉ có thể so sánh tối đa 5 xe cùng lúc!");
        return prev;
      }

      // Thêm xe mới
      return [...prev, car];
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPageNumber(newPage);
  };

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">
          Kết quả Tìm kiếm ({totalItems} xe)
        </h2>

        {/* Sort dropdown */}
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="border rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Sắp xếp</option>
          <option value="priceLowHigh">Giá (Thấp đến Cao)</option>
          <option value="priceHighLow">Giá (Cao đến Thấp)</option>
          <option value="horsePower">Công suất (HP)</option>
        </select>
      </div>

      {error && <div className="text-red-600 mb-3">Lỗi: {error}</div>}

      {loading ? (
        <div className="grid grid-cols-3 gap-4 opacity-50 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      ) : sortedCars.length === 0 ? (
        <p className="text-gray-500">Không có xe nào phù hợp.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedCars.map((car) => (
            <div
              key={car.vehicleVersionId}
              className="border rounded-xl shadow-sm bg-white overflow-hidden flex flex-col relative hover:shadow-lg transition"
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

                <div className="flex justify-between items-center mt-auto pt-2 border-t">
                  <label className="flex items-center space-x-1 text-xs text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={compareList.some(
                        (c) => c.vehicleVersionId === car.vehicleVersionId
                      )}
                      onChange={() => toggleCompare(car)}
                      className="rounded"
                    />
                    <span>So sánh</span>
                  </label>
                  <button
                    onClick={() =>
                      fetchCarDetail(car.vehicleVersionId, setSelectedCar)
                    }
                    className="text-blue-600 text-xs font-medium hover:underline"
                  >
                    Xem chi tiết →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
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
      )}

      {/* Modal chi tiết */}
      {selectedCar && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 relative">
            <button
              onClick={() => setSelectedCar(null)}
              className="absolute top-2 right-3 text-gray-500 hover:text-black text-lg"
            >
              ✕
            </button>

            {/* Ảnh xe */}
            <img
              src={selectedCar.imageUrl}
              alt={selectedCar.modelName}
              className="w-full h-56 object-cover rounded-xl mb-5"
            />

            {/* Tiêu đề */}
            <h3 className="text-xl font-bold mb-3 text-gray-800 text-center">
              {selectedCar.brand} {selectedCar.modelName}{" "}
              {selectedCar.versionName}
            </h3>

            {/* Giá */}
            <p className="text-blue-600 font-semibold text-center text-lg mb-5">
              {formatPrice(selectedCar.basePrice)}
            </p>

            {/* Bảng thông tin */}
            <table className="w-full border border-gray-200 text-sm text-gray-700 rounded-lg overflow-hidden">
              <tbody>
                <tr className="odd:bg-gray-50 even:bg-white">
                  <td className="font-medium px-3 py-2 w-1/3">Hãng</td>
                  <td className="px-3 py-2">{selectedCar.brand}</td>
                </tr>
                <tr className="odd:bg-gray-50 even:bg-white">
                  <td className="font-medium px-3 py-2">Model</td>
                  <td className="px-3 py-2">{selectedCar.modelName}</td>
                </tr>
                <tr className="odd:bg-gray-50 even:bg-white">
                  <td className="font-medium px-3 py-2">Phiên bản</td>
                  <td className="px-3 py-2">{selectedCar.versionName}</td>
                </tr>
                <tr className="odd:bg-gray-50 even:bg-white">
                  <td className="font-medium px-3 py-2">Màu</td>
                  <td className="px-3 py-2">{selectedCar.color}</td>
                </tr>
                <tr className="odd:bg-gray-50 even:bg-white">
                  <td className="font-medium px-3 py-2">Kiểu xe</td>
                  <td className="px-3 py-2">{selectedCar.evType}</td>
                </tr>
                <tr className="odd:bg-gray-50 even:bg-white">
                  <td className="font-medium px-3 py-2">Công suất</td>
                  <td className="px-3 py-2">{selectedCar.horsePower} HP</td>
                </tr>
                <tr className="odd:bg-gray-50 even:bg-white">
                  <td className="font-medium px-3 py-2">Tồn kho</td>
                  <td className="px-3 py-2">{selectedCar.stockQuantity}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal so sánh dạng bảng */}
      {showCompare && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div
            className={`bg-white rounded-2xl shadow-xl p-6 relative overflow-x-auto ${
              compareList.length === 1
                ? "max-w-md" // 1 xe → bảng nhỏ gọn
                : compareList.length === 2
                ? "max-w-3xl" // 2 xe → vừa
                : compareList.length === 3
                ? "max-w-5xl" // 3 xe → rộng hơn
                : "max-w-7xl" // ≥4 xe → full rộng
            } w-full`}
          >
            <button
              onClick={() => setShowCompare(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-black text-lg"
            >
              ✕
            </button>

            <h3 className="text-xl font-semibold mb-4 text-center">
              So sánh chi tiết xe
            </h3>

            {compareList.length === 0 ? (
              <p className="text-gray-500 text-center mt-6">
                Bạn chưa chọn xe nào để so sánh.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 text-sm text-gray-700 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gray-100 text-center">
                      <th className="p-2 w-40 text-left">Thông số</th>
                      {compareList.map((car) => (
                        <th key={car.vehicleVersionId} className="p-2 relative">
                          {/* Nút xoá */}
                          <button
                            onClick={() =>
                              setCompareList((prev) =>
                                prev.filter(
                                  (x) =>
                                    x.vehicleVersionId !== car.vehicleVersionId
                                )
                              )
                            }
                            className="absolute top-1 right-1 text-gray-400 hover:text-red-500"
                            title="Xóa khỏi so sánh"
                          >
                            ✕
                          </button>

                          <div className="flex flex-col items-center">
                            <img
                              src={car.imageUrl}
                              alt={car.modelName}
                              className="w-32 h-24 object-cover rounded-md mb-1"
                            />
                            <div className="font-semibold text-xs text-gray-800">
                              {car.brand} {car.modelName}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {car.versionName}
                            </div>
                            <div className="text-blue-600 font-bold text-sm mt-1">
                              {formatPrice(car.basePrice)}
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    <tr className="border-t">
                      <td className="font-medium px-3 py-2">Hãng</td>
                      {compareList.map((car) => (
                        <td
                          key={car.vehicleVersionId}
                          className="text-center px-3 py-2"
                        >
                          {car.brand}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t bg-gray-50">
                      <td className="font-medium px-3 py-2">Model</td>
                      {compareList.map((car) => (
                        <td
                          key={car.vehicleVersionId}
                          className="text-center px-3 py-2"
                        >
                          {car.modelName}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t">
                      <td className="font-medium px-3 py-2">Phiên bản</td>
                      {compareList.map((car) => (
                        <td
                          key={car.vehicleVersionId}
                          className="text-center px-3 py-2"
                        >
                          {car.versionName}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t bg-gray-50">
                      <td className="font-medium px-3 py-2">Màu sắc</td>
                      {compareList.map((car) => (
                        <td
                          key={car.vehicleVersionId}
                          className="text-center px-3 py-2"
                        >
                          {car.color}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t">
                      <td className="font-medium px-3 py-2">Kiểu xe</td>
                      {compareList.map((car) => (
                        <td
                          key={car.vehicleVersionId}
                          className="text-center px-3 py-2"
                        >
                          {car.evType}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t bg-gray-50">
                      <td className="font-medium px-3 py-2">Công suất</td>
                      {compareList.map((car) => (
                        <td
                          key={car.vehicleVersionId}
                          className="text-center px-3 py-2"
                        >
                          {car.horsePower} HP
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t">
                      <td className="font-medium px-3 py-2">Tồn kho</td>
                      {compareList.map((car) => (
                        <td
                          key={car.vehicleVersionId}
                          className="text-center px-3 py-2"
                        >
                          {car.stockQuantity}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating compare button */}
      {compareList.length > 0 && !showCompare && (
        <div className="fixed bottom-5 right-5">
          <button
            onClick={() => {
              // fetch detail từng xe trước khi so sánh
              Promise.all(
                compareList.map((c) =>
                  fetchCarDetail(c.vehicleVersionId, (detail) =>
                    setCompareList((prev) =>
                      prev.map((x) =>
                        x.vehicleVersionId === detail.vehicleVersionId
                          ? detail
                          : x
                      )
                    )
                  )
                )
              ).then(() => setShowCompare(true));
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700"
          >
            So sánh ({compareList.length})
          </button>
        </div>
      )}
    </div>
  );
}
