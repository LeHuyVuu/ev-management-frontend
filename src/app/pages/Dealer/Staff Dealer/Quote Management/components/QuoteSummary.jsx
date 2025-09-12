import React from "react";
import { FileText } from "lucide-react";

export default function QuoteSummary() {
    return (
        <div className="border rounded-xl p-4 bg-white shadow-sm w-full max-w-md">
            {/* Header */}
            <div className="flex items-center space-x-2 mb-4">
                <FileText className="text-blue-500" size={20} />
                <h3 className="font-semibold text-base">Tóm tắt Báo giá</h3>
            </div>

            {/* Nội dung */}
            <div className="text-sm space-y-2">
                <div className="flex justify-between">
                    <span>Khách hàng</span>
                    <span className="font-medium">Nguyễn Văn A</span>
                </div>
                <div className="flex justify-between">
                    <span>Số điện thoại</span>
                    <span>0987654321</span>
                </div>
                <div className="flex justify-between">
                    <span>Dòng xe</span>
                    <span>Toyota Camry</span>
                </div>
                <div className="flex justify-between">
                    <span>Phiên bản</span>
                    <span>2.5Q</span>
                </div>
                <div className="flex justify-between">
                    <span>Màu sắc</span>
                    <span>Đen</span>
                </div>
                <div className="flex justify-between">
                    <span>Phụ kiện</span>
                    <span>Gói cao cấp (Cảm biến lùi, Camera 360)</span>
                </div>
                <div className="flex justify-between">
                    <span>Phí đăng ký</span>
                    <span>20,000,000 VND</span>
                </div>
                <hr />
                <div className="flex justify-between">
                    <span>Tổng phụ</span>
                    <span>1.200.000.000 VND</span>
                </div>
                <div className="flex justify-between text-red-500">
                    <span>Giảm giá khuyến mãi</span>
                    <span>-50.000.000 VND</span>
                </div>
                <hr />
                <div className="flex justify-between font-semibold text-lg">
                    <span>Tổng cộng</span>
                    <span>1.170.000.000 VND</span>
                </div>
            </div>
        </div>
    );
}
