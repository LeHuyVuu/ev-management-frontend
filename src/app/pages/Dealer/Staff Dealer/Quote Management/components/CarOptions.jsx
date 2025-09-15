import React from "react";
import { Car } from "lucide-react";

export default function CarOptions() {
    return (
        <div className="border rounded-xl p-4 bg-white shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
                <Car className="text-blue-500" size={20} />
                <h3 className="font-semibold text-base">Chọn Xe và Tùy chọn</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select className="border rounded-md px-3 py-2 text-sm w-full">
                    <option>Toyota Camry</option>
                </select>
                <select className="border rounded-md px-3 py-2 text-sm w-full">
                    <option>2.5Q</option>
                </select>
                <select className="border rounded-md px-3 py-2 text-sm w-full">
                    <option>Đen</option>
                </select>
                <select className="border rounded-md px-3 py-2 text-sm w-full">
                    <option>Gói cao cấp (Cảm biến lùi, Camera 360)</option>
                </select>
                <input
                    type="text"
                    defaultValue="20,000,000 VND"
                    className="border rounded-md px-3 py-2 text-sm w-full md:col-span-2"
                />
            </div>
        </div>
    );
}
