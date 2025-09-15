import React from "react";
import { Folder } from "lucide-react";

const recentQuotes = [
    {
        id: "20240701-001",
        customer: "Trần Thị B",
        car: "Honda CRV",
        total: "950.000.000 VND",
    },
    {
        id: "20240628-005",
        customer: "Lê Văn C",
        car: "Mazda 3",
        total: "720.000.000 VND",
    },
    {
        id: "20240625-010",
        customer: "Phạm Thị D",
        car: "Toyota Vios",
        total: "600.000.000 VND",
    },
];

export default function RecentQuotes() {
    return (
        <div className="border rounded-xl p-4 bg-white shadow-sm w-full max-w-md">
            {/* Header */}
            <div className="flex items-center space-x-2 mb-4">
                <Folder className="text-blue-500" size={20} />
                <h3 className="font-semibold text-base">Báo giá Gần đây</h3>
            </div>

            {/* Danh sách báo giá */}
            <div className="space-y-3 text-sm">
                {recentQuotes.map((quote, index) => (
                    <div key={index} className="pb-2 border-b last:border-b-0 last:pb-0">
                        <p className="font-medium">Báo giá #{quote.id}</p>
                        <p className="text-gray-600">
                            Khách hàng: {quote.customer}, Xe: {quote.car}, Tổng:{" "}
                            {quote.total}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
