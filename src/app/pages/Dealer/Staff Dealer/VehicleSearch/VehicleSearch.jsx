import React from "react";
import CarList from "./Components/CarList";
import FilterSearch from "./Components/FilterSearch";

export default function VehicleSearch() {
    return (
        <div className="min-h-screen bg-gray-50">
            <main className="flex-1 p-8">
                <h1 className="text-2xl font-bold mb-6">Thông tin & Tra cứu</h1>
                <div className="flex">
                    {/* FilterSearch bên trái */}
                    <div className="w-full max-w-xs">
                        <FilterSearch />
                    </div>
                    {/* CarList bên phải */}
                    <div className="flex-1">
                        <CarList />
                    </div>
                </div>
            </main>
        </div>
    );
}
