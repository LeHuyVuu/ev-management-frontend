import React from "react";

export default function ContractHeader() {
    return (
        <div className="border rounded-xl p-4 bg-white shadow-sm w-full">
            <h2 className="text-lg font-semibold">Quản lý điều phối xe</h2>
            <p className="text-sm text-gray-600 mt-1">
                Xem và quản lý tất cả các điều phối xe giữa các đại lý trong hệ thống.
            </p>
        </div>
    );
}
