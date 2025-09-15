// CustomerProfile.jsx
import React, { useState } from "react";

export default function CustomerProfile() {
    const [activeTab, setActiveTab] = useState("profile");

    const customer = {
        name: "Nguyễn Văn A",
        email: "nguyen.a@example.com",
        phone: "0901234567",
        address: "123 Đường Số 1, Quận 1, TP.HCM",
        status: "Hoạt động",
        lastInteraction: "2023-11-20",
    };

    const orders = [
        { id: "ORD001", date: "2023-11-15", status: "Completed", amount: "15.000.000 ₫" },
        { id: "ORD002", date: "2023-11-14", status: "Pending", amount: "7.500.000 ₫" },
        { id: "ORD003", date: "2023-11-13", status: "Cancelled", amount: "2.000.000 ₫" },
        { id: "ORD004", date: "2023-11-12", status: "Shipped", amount: "30.000.000 ₫" },
        { id: "ORD005", date: "2023-11-11", status: "Processing", amount: "12.000.000 ₫" },
        { id: "ORD006", date: "2023-11-10", status: "Completed", amount: "8.000.000 ₫" },
    ];

    const contracts = [
        { id: "HD2023001", status: "Hoạt động", start: "2023-01-15", end: "2024-01-15" },
        { id: "HD2023002", status: "Đang chờ", start: "2023-03-01", end: "2024-03-01" },
        { id: "HD2022003", status: "Đã hết hạn", start: "2022-05-10", end: "2023-05-10" },
        { id: "HD2024004", status: "Hoạt động", start: "2024-02-20", end: "2025-02-20" },
        { id: "HD2023005", status: "Hoạt động", start: "2023-07-01", end: "2024-07-01" },
        { id: "HD2024006", status: "Đang chờ", start: "2024-04-10", end: "2025-04-10" },
    ];

    const getOrderStatusStyle = (status) => {
        switch (status) {
            case "Completed":
                return "text-green-600 font-medium";
            case "Pending":
                return "text-gray-500 font-medium";
            case "Cancelled":
                return "bg-red-100 text-red-600 px-2 py-1 rounded text-sm";
            case "Shipped":
                return "bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm";
            case "Processing":
                return "bg-orange-100 text-orange-600 px-2 py-1 rounded text-sm";
            default:
                return "text-gray-500";
        }
    };

    const getContractStatusStyle = (status) => {
        switch (status) {
            case "Hoạt động":
                return "text-green-600 font-semibold";
            case "Đang chờ":
                return "text-blue-600 font-semibold";
            case "Đã hết hạn":
                return "bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-medium";
            default:
                return "text-gray-500";
        }
    };

    return (
        <div className="p-4 border rounded-lg shadow-sm bg-white w-full max-w-6xl">
            {/* Header */}
            <h1 className="text-xl font-semibold mb-4">{customer.name}</h1>

            {/* Tabs */}
            <div className="bg-gray-100 rounded-lg p-2 mb-6">
                <div className="inline-flex rounded-md overflow-hidden">
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === "profile"
                            ? "bg-white shadow-sm text-gray-800"
                            : "text-gray-500"
                            }`}
                    >
                        Hồ sơ
                    </button>
                    <button
                        onClick={() => setActiveTab("orders")}
                        className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === "orders"
                            ? "bg-white shadow-sm text-gray-800"
                            : "text-gray-500"
                            }`}
                    >
                        Lịch sử Đơn hàng
                    </button>
                    <button
                        onClick={() => setActiveTab("contracts")}
                        className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === "contracts"
                            ? "bg-white shadow-sm text-gray-800"
                            : "text-gray-500"
                            }`}
                    >
                        Hợp đồng khách hàng
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="border rounded-lg p-6 bg-white">
                {activeTab === "profile" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm text-gray-600">Tên Khách hàng</label>
                            <input
                                type="text"
                                value={customer.name}
                                readOnly
                                className="mt-2 block w-full border border-gray-200 rounded-md px-3 py-2 bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Email</label>
                            <input
                                type="text"
                                value={customer.email}
                                readOnly
                                className="mt-2 block w-full border border-gray-200 rounded-md px-3 py-2 bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Điện thoại</label>
                            <input
                                type="text"
                                value={customer.phone}
                                readOnly
                                className="mt-2 block w-full border border-gray-200 rounded-md px-3 py-2 bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Địa chỉ</label>
                            <input
                                type="text"
                                value={customer.address}
                                readOnly
                                className="mt-2 block w-full border border-gray-200 rounded-md px-3 py-2 bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Trạng thái</label>
                            <select
                                value={customer.status}
                                disabled
                                className="mt-2 block w-full border border-gray-200 rounded-md px-3 py-2 bg-white text-gray-700"
                            >
                                <option>Hoạt động</option>
                                <option>Không hoạt động</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Tương tác gần nhất</label>
                            <input
                                type="text"
                                value={customer.lastInteraction}
                                readOnly
                                className="mt-2 block w-full border border-gray-200 rounded-md px-3 py-2 bg-white"
                            />
                        </div>
                    </div>
                )}

                {activeTab === "orders" && (
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Lịch sử đơn hàng</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border border-gray-200 rounded-lg">
                                <thead className="bg-gray-100 text-gray-700 text-sm font-medium">
                                    <tr>
                                        <th className="px-4 py-2 border-b">ID Đơn hàng</th>
                                        <th className="px-4 py-2 border-b">Ngày</th>
                                        <th className="px-4 py-2 border-b">Trạng thái</th>
                                        <th className="px-4 py-2 border-b">Số tiền</th>
                                        <th className="px-4 py-2 border-b">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 border-b">{order.id}</td>
                                            <td className="px-4 py-2 border-b">{order.date}</td>
                                            <td className="px-4 py-2 border-b">
                                                <span className={getOrderStatusStyle(order.status)}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 border-b">{order.amount}</td>
                                            <td className="px-4 py-2 border-b text-blue-600 cursor-pointer">
                                                Xem chi tiết
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === "contracts" && (
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Hợp đồng khách hàng</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {contracts.map((c) => (
                                <div
                                    key={c.id}
                                    className="border rounded-lg p-4 shadow-sm hover:shadow-md transition bg-white"
                                >
                                    <h3 className="font-semibold text-gray-800 mb-2">
                                        Mã hợp đồng: {c.id}
                                    </h3>
                                    <p className="text-sm mb-1">
                                        Trạng thái:{" "}
                                        <span className={getContractStatusStyle(c.status)}>
                                            {c.status}
                                        </span>
                                    </p>
                                    <p className="text-sm">Bắt đầu: {c.start}</p>
                                    <p className="text-sm">Kết thúc: {c.end}</p>

                                    {/* Actions */}
                                    <div className="flex gap-4 mt-3 text-sm text-gray-600">
                                        <button className="flex items-center gap-1 hover:text-blue-600">
                                            Xem
                                        </button>
                                        <button className="flex items-center gap-1 hover:text-green-600">
                                            Chỉnh sửa
                                        </button>
                                        <button className="flex items-center gap-1 hover:text-indigo-600">
                                            Tải xuống
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Button */}
                {activeTab === "profile" && (
                    <div className="mt-6 flex justify-end">
                        <button
                            type="button"
                            className="flex items-center gap-2 border px-4 py-2 rounded-md text-sm hover:bg-gray-50"
                        >
                            <span>Chỉnh Sửa Hồ Sơ</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
