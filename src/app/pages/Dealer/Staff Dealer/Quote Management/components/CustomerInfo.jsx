import React from "react";
import { User } from "lucide-react";

export default function CustomerInfo() {
    return (
        <div className="border rounded-xl p-4 bg-white shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
                <User className="text-blue-500" size={20} />
                <h3 className="font-semibold text-base">Thông tin Khách hàng</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                    type="text"
                    placeholder="Số điện thoại"
                    defaultValue="0987654321"
                    className="border rounded-md px-3 py-2 text-sm w-full"
                />
                <input
                    type="email"
                    placeholder="Tìm kiếm theo email"
                    className="border rounded-md px-3 py-2 text-sm w-full"
                />
            </div>
            <button className="mt-3 text-blue-500 text-sm font-medium hover:underline">
                + Thêm Khách hàng Mới
            </button>
        </div>
    );
}
