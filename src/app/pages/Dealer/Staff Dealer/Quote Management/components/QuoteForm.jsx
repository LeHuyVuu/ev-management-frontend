import React from "react";
import CustomerInfo from "./CustomerInfo";
import CarOptions from "./CarOptions";
import Promotion from "./Promotion";

export default function QuoteForm() {
    return (
        <div className="space-y-6">
            <CustomerInfo />
            <CarOptions />
            <Promotion />

            {/* Nút hành động */}
            <div className="flex justify-end space-x-3">
                <button className="border px-4 py-2 text-sm rounded-md hover:bg-gray-100">
                    Hủy
                </button>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm rounded-md shadow">
                    Xác nhận Báo giá
                </button>
            </div>
        </div>
    );
}
