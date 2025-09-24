import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => (
    <div className="w-64 h-screen bg-white shadow-md flex flex-col justify-between">
        {/* Menu */}
        <div>
            {/* Bảng điều khiển */}
            <div className="px-4 py-2 text-gray-700 font-medium flex items-center space-x-2">
                <span className="text-lg">📊</span>
                <span>Bảng điều khiển</span>
            </div>

            {/* BÁN HÀNG & CRM */}
            <p className="px-4 mt-4 mb-2 text-xs font-bold text-gray-400 uppercase">Bán hàng & CRM</p>
            <nav className="space-y-1">
                <Link to="/dealer/vehicle-search" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 space-x-2">
                    <span>🚗</span><span>Thông tin xe</span>
                </Link>
                <Link to="/dealer/quote-management" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 space-x-2">
                    <span>📋</span><span>Quản lý báo giá</span>
                </Link>
                <Link to="/dealer/contract" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 space-x-2">
                    <span>🛡️</span><span>Quản lý hợp đồng</span>
                </Link>
                <Link to="/dealer/driver-schedule" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 space-x-2">
                    <span>📅</span><span>Lịch lái thử</span>
                </Link>
                <Link to="/dealer/customer-crm" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 space-x-2">
                    <span>👤</span><span>Quản lý khách hàng</span>
                </Link>
            </nav>

            {/* HOẠT ĐỘNG */}
            <p className="px-4 mt-4 mb-2 text-xs font-bold text-gray-400 uppercase">Hoạt động</p>
            <nav className="space-y-1">
                <Link to="/dealer/vehicle-allocation" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 space-x-2">
                    <span>🚚</span><span>Yêu cầu phân bổ xe</span>
                </Link>
                <Link to="/dealer/delivery-tracking" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 space-x-2">
                    <span>📄</span><span>Theo dõi giao hàng</span>
                </Link>
            </nav>

            {/* BÁO CÁO */}
            <p className="px-4 mt-4 mb-2 text-xs font-bold text-gray-400 uppercase">Báo cáo</p>
            <nav>
                <Link to="/evm/reports-analytics" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 space-x-2">
                    <span>📂</span><span>Báo cáo doanh số & nợ</span>
                </Link>
            </nav>
        </div>

        {/* Footer */}
        {/* <div className="border-t p-4">
            <Link to="/dealer/profile" className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 px-2 py-2 rounded">
                <span>⚙️</span><span>Cài đặt</span>
            </Link>
            <Link to="/login" className="flex items-center justify-center mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                Đăng xuất
            </Link>
        </div> */}
    </div>
);

export default Sidebar;
