import React from "react";
import CarList from "./Components/CarList";
import FilterSearch from "./Components/FilterSearch";

export default function VehicleSearch() {
    return (
        <div className="min-h-screen bg-gray-50">
            <main className="flex-1 p-8">
                <h1 className="text-2xl font-bold mb-6">Thông tin & Tra cứu</h1>

                {/* Layout 2 cột: FilterSearch (trái) - CarList (phải) */}
                <div className="flex gap-6">
                    {/* FilterSearch bên trái */}


                    {/* CarList bên phải (chiếm phần còn lại) */}
                    <div className="flex-1">
                        <CarList />
                    </div>
                    <div className="w-full max-w-xs">
                        <FilterSearch />
                    </div>
                </div>
            </main>
        </div>
    );
}
