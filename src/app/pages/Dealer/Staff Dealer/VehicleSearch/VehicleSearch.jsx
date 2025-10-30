import React, { useState } from "react";
import CarList from "./Components/CarList";
import FilterSearch from "./Components/FilterSearch";

export default function VehicleSearch() {
  const [filters, setFilters] = useState({
    searchValue: "",
    selectedModel: "Tất cả",
    priceMin: "",
    priceMax: "",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Thông tin & Tra cứu</h1>

        <div className="flex gap-6 items-start">
          <CarList filters={filters} />
          <div className="w-full max-w-xs sticky top-8 h-fit">
            <FilterSearch onFilterChange={setFilters} />
          </div>
        </div>
      </main>
    </div>
  );
}
