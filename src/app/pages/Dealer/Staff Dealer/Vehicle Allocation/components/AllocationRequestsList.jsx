// AllocationRequestsList.jsx
import React from "react";

/**
 * Component: AllocationRequestsList
 * - Self-contained mock data matching the screenshot
 * - TailwindCSS for styles
 * - Usage: import AllocationRequestsList from './AllocationRequestsList' then <AllocationRequestsList />
 */

const mockRequests = [
    {
        id: "REQ001",
        car: "VinFast Lux SA2.0 (Cao cấp)",
        destination: "Đại lý Quận 1",
        quantity: 2,
        date: "2024-06-01",
        status: "Đang vận chuyển",
    },
    {
        id: "REQ002",
        car: "VinFast Fadil (Tiêu chuẩn)",
        destination: "Đại lý Quận 7",
        quantity: 5,
        date: "2024-06-03",
        status: "Đã nhận yêu cầu",
    },
    {
        id: "REQ003",
        car: "Toyota Camry (2.5Q)",
        destination: "Đại lý Thủ Đức",
        quantity: 1,
        date: "2024-06-05",
        status: "Tại đại lý",
    },
    {
        id: "REQ004",
        car: "Honda Civic (RS)",
        destination: "Trung tâm điều phối",
        quantity: 3,
        date: "2024-06-07",
        status: "Đang vận chuyển",
    },
    {
        id: "REQ005",
        car: "VinFast Lux SA2.0 (Tiêu chuẩn)",
        destination: "Đại lý Quận 1",
        quantity: 1,
        date: "2024-06-08",
        status: "Đã nhận yêu cầu",
    },
];

function StatusCell({ status }) {
    // Use pill only for "Đã nhận yêu cầu" in image; others shown as plain text
    if (status === "Đã nhận yêu cầu") {
        return (
            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                {status}
            </span>
        );
    }
    // For "Đang vận chuyển" or "Tại đại lý" keep simple text (as in screenshot)
    return <span className="text-gray-800">{status}</span>;
}

export default function AllocationRequestsList({
    requests = mockRequests,
    onView = (req) => alert(`Xem ${req.id}`),
    onDelete = (req) => {
        if (confirm(`Xóa ${req.id}?`)) alert(`${req.id} đã được xóa (mock)`);
    },
}) {
    return (
        <div className="border rounded-lg p-6 bg-white shadow-sm">
            {/* Header */}
            <h2 className="text-lg font-semibold mb-2">Các yêu cầu phân bổ hiện có</h2>
            <p className="text-sm text-gray-500 mb-4">
                Theo dõi trạng thái của các yêu cầu xe.
            </p>

            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                    <thead>
                        <tr className="text-xs text-gray-500">
                            <th className="px-4 py-3">ID Yêu cầu</th>
                            <th className="px-4 py-3">Xe</th>
                            <th className="px-4 py-3">Địa điểm đến</th>
                            <th className="px-4 py-3 text-center">Số lượng</th>
                            <th className="px-4 py-3">Ngày yêu cầu</th>
                            <th className="px-4 py-3">Trạng thái</th>
                            <th className="px-4 py-3">Hành động</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y">
                        {requests.map((r) => (
                            <tr key={r.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 align-top w-28 text-gray-700">{r.id}</td>

                                <td className="px-4 py-4 align-top text-gray-800">{r.car}</td>

                                <td className="px-4 py-4 align-top text-gray-700">{r.destination}</td>

                                <td className="px-4 py-4 align-top text-center text-gray-700 w-16">
                                    {r.quantity}
                                </td>

                                <td className="px-4 py-4 align-top text-gray-700">{r.date}</td>

                                <td className="px-4 py-4 align-top">
                                    <StatusCell status={r.status} />
                                </td>

                                <td className="px-4 py-4 align-top">
                                    <div className="flex items-center gap-4">
                                        {/* View button (eye) */}
                                        <button
                                            onClick={() => onView(r)}
                                            aria-label={`Xem ${r.id}`}
                                            className="text-gray-600 hover:text-gray-800"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="1.5"
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="1.5"
                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                />
                                            </svg>
                                        </button>

                                        {/* Delete button (x) */}
                                        <button
                                            onClick={() => onDelete(r)}
                                            aria-label={`Xóa ${r.id}`}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 8.586l4.95-4.95 1.414 1.414L11.414 10l4.95 4.95-1.414 1.414L10 11.414l-4.95 4.95-1.414-1.414L8.586 10 3.636 5.05l1.414-1.414L10 8.586z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {/* If no requests */}
                        {requests.length === 0 && (
                            <tr>
                                <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
                                    Không có yêu cầu phân bổ nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
