import React from "react";
import { DollarSign } from "lucide-react";

export default function Promotion() {
    return (
        <div className="border rounded-xl p-4 bg-white shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
                <DollarSign className="text-blue-500" size={20} />
                <h3 className="font-semibold text-base">Áp dụng Khuyến mãi</h3>
            </div>
            <div className="flex space-x-2">
                <input
                    type="text"
                    defaultValue="SUMMERSALE2024"
                    className="border rounded-md px-3 py-2 text-sm flex-1"
                />
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm rounded-md">
                    Áp dụng
                </button>
            </div>
        </div>
    );
}
