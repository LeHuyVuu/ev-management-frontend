import React from "react";

export default function FilterSearch() {
    return (
        <div className="w-64 border rounded-lg p-2 shadow-sm bg-white">
            <h2 className="font-semibold text-lg mb-3">Bộ lọc & Tìm kiếm</h2>

            {/* Ô tìm kiếm */}
            <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Tìm kiếm</label>
                <input
                    type="text"
                    placeholder="Tìm kiếm theo mẫu, phiên bản..."
                    className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
            </div>

            {/* Mô hình xe */}
            <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Mô hình Xe</label>
                <select className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option>Tất cả</option>
                </select>
            </div>

            {/* Phiên bản */}
            <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Phiên bản</label>
                <select className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option>Tất cả</option>
                </select>
            </div>

            {/* Màu sắc */}
            <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Màu sắc</label>
                <select className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option>Tất cả</option>
                </select>
            </div>

            {/* Phạm vi giá */}
            <div className="mb-3">
                <label className="block text-sm font-medium mb-1">
                    Phạm vi Giá (0 - Max VND)
                </label>
                <div className="flex space-x-2">
                    <input
                        type="number"
                        placeholder="Tối thiểu"
                        className="w-1/2 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <input
                        type="number"
                        placeholder="Tối đa"
                        className="w-1/2 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>
            </div>

            {/* Kho hàng */}
            <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Kho hàng</label>
                <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm">
                        <input type="checkbox" className="rounded" />
                        <span>Kho của đại lý</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                        <input type="checkbox" className="rounded" />
                        <span>Kho toàn hệ thống</span>
                    </label>
                </div>
            </div>

            {/* Nút */}
            <div className="flex space-x-2">
                <button className="flex-1 bg-blue-500 text-white rounded-md py-2 text-sm font-medium hover:bg-blue-600">
                    Áp dụng Bộ lọc
                </button>
                <button className="flex-1 border text-gray-600 rounded-md py-2 text-sm font-medium hover:bg-gray-100">
                    Xóa Bộ lọc
                </button>
            </div>
        </div>
    );
}
