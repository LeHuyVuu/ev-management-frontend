import React, { useEffect, useState } from "react";

const VEHICLE_API =
  "https://prn232.freeddns.org/brand-service/api/vehicles?pageNumber=1&pageSize=10";
const TOKEN = localStorage.getItem("token");

const COLOR_OPTIONS = [
  { name: "Đen", code: "#000000" },
  { name: "Đỏ", code: "#e53935" },
  { name: "Xám", code: "#9e9e9e" },
  { name: "Trắng", code: "#ffffff" },
  { name: "Xanh", code: "#2196f3" },
  { name: "Bạc", code: "#dddbdbff" },
  { name: "Vàng", code: "#f8b032ff" },
];

export default function FilterSearch({ onFilterChange }) {
  const [vehicles, setVehicles] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedModel, setSelectedModel] = useState("Tất cả");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [selectedColors, setSelectedColors] = useState([]);

  // fetch danh sách model
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch(VEHICLE_API, {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (data.status === 200) {
          // Support two response shapes:
          // 1) { status:200, data: { items: [...] } }
          // 2) { status:200, data: [ ... ] }
          const items = data.data?.items ?? data.data ?? [];
          if (Array.isArray(items)) setVehicles(items);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchVehicles();
  }, []);

  // debounce filter update
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange?.({
        searchValue,
        selectedModel,
        priceMin,
        priceMax,
        selectedColors, // thêm color
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [
    searchValue,
    selectedModel,
    priceMin,
    priceMax,
    selectedColors,
    onFilterChange,
  ]);

  const handleClear = () => {
    setSearchValue("");
    setSelectedModel("Tất cả");
    setPriceMin("");
    setPriceMax("");
    setSelectedColors([]);
    onFilterChange?.({
      searchValue: "",
      selectedModel: "Tất cả",
      priceMin: "",
      priceMax: "",
      selectedColors: [],
    });
  };

  const toggleColor = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color)
        ? prev.filter((c) => c !== color)
        : [...prev, color]
    );
  };

  return (
    <div className="w-64 border rounded-lg p-3 shadow-sm bg-white">
      <h2 className="font-semibold text-lg mb-3">Bộ lọc & Tìm kiếm</h2>

      {/* Tìm kiếm */}
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Tìm kiếm</label>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Tìm kiếm theo mẫu, phiên bản..."
          className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* Mô hình xe */}
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Mô hình Xe</label>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="Tất cả">Tất cả</option>
          {vehicles.map((v) => (
            <option key={v.vehicleId} value={v.vehicleId}>
              {v.brand} {v.modelName}
            </option>
          ))}
        </select>
      </div>

      {/* Màu sắc */}
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Màu sắc</label>
        <div className="grid grid-cols-2 gap-2">
          {COLOR_OPTIONS.map((color) => (
            <label
              key={color.name}
              className="flex items-center space-x-2 text-sm cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedColors.includes(color.name)}
                onChange={() => toggleColor(color.name)}
                className="rounded"
              />
              <span
                className="inline-block w-4 h-4 rounded border"
                style={{ backgroundColor: color.code }}
              ></span>
              <span>{color.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Phạm vi giá */}
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">
          Phạm vi Giá (₫)
        </label>
        <div className="flex space-x-2">
          <input
            type="number"
            placeholder="Tối thiểu"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="w-1/2 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Tối đa"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="w-1/2 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex space-x-2 mt-3">
        <button
          onClick={() =>
            onFilterChange?.({
              searchValue,
              selectedModel,
              priceMin,
              priceMax,
              selectedColors,
            })
          }
          className="flex-1 bg-blue-500 text-white rounded-md py-2 text-sm font-medium hover:bg-blue-600"
        >
          Áp dụng
        </button>
        <button
          onClick={handleClear}
          className="flex-1 border text-gray-600 rounded-md py-2 text-sm font-medium hover:bg-gray-100"
        >
          Xóa
        </button>
      </div>
    </div>
  );
}
