import React from 'react';

const Sidebar = () => (
    <div className="w-64 h-screen bg-white shadow-md flex flex-col justify-between">
        {/* <!-- Menu --> */}
        <div>
            {/* <!-- Bảng điều khiển --> */}
            <div class="px-4 py-2 text-gray-700 font-medium flex items-center space-x-2">
                <span class="text-lg">📊</span>
                <span>Bảng điều khiển</span>
            </div>

            {/* <!-- BÁN HÀNG & CRM --> */}
            <p class="px-4 mt-4 mb-2 text-xs font-bold text-gray-400 uppercase">Bán hàng & CRM</p>
            <nav class="space-y-1">
                <a href="#" class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 space-x-2">
                    <span>🚗</span><span>Thông tin xe</span>
                </a>
                <a href="#" class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 space-x-2">
                    <span>📋</span><span>Quản lý báo giá</span>
                </a>
                <a href="#" class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 space-x-2">
                    <span>🛡️</span><span>Quản lý hợp đồng</span>
                </a>
                <a href="#" class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 space-x-2">
                    <span>📅</span><span>Lịch lái thử</span>
                </a>
                <a href="#" class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 space-x-2">
                    <span>👤</span><span>Quản lý khách hàng</span>
                </a>
            </nav>

            {/* <!-- HOẠT ĐỘNG --> */}
            <p class="px-4 mt-4 mb-2 text-xs font-bold text-gray-400 uppercase">Hoạt động</p>
            <nav class="space-y-1">
                <a href="#" class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 space-x-2">
                    <span>🚚</span><span>Yêu cầu phân bổ xe</span>
                </a>
                <a href="#" class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 space-x-2">
                    <span>📄</span><span>Theo dõi giao hàng</span>
                </a>
            </nav>

            {/* <!-- BÁO CÁO --> */}
            <p class="px-4 mt-4 mb-2 text-xs font-bold text-gray-400 uppercase">Báo cáo</p>
            <nav>
                <a href="#" class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 space-x-2">
                    <span>📂</span><span>Báo cáo doanh số & nợ</span>
                </a>
            </nav>
        </div>

        {/* <!-- Footer --> */}
        <div class="border-t p-4">
            <a href="#" class="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 px-2 py-2 rounded">
                <span>⚙️</span><span>Cài đặt</span>
            </a>
            <a href="#" class="flex items-center justify-center mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                Đăng xuất
            </a>
        </div>
    </div>
);

export default Sidebar;
