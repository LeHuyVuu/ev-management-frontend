import React from "react";
import { Plus } from "lucide-react"; // icon từ lucide-react (cài bằng npm i lucide-react)

export default function QuoteHeader() {
    return (
        <div className="flex items-center justify-between mb-4">
            {/* Tiêu đề */}
            <h2 className="text-lg font-semibold">Quản lý Báo giá</h2>

            {/* Nút tạo báo giá mới */}
            <button className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md shadow">
                <Plus size={16} />
                <span>Tạo Báo giá Mới</span>
            </button>
        </div>
    );
}
