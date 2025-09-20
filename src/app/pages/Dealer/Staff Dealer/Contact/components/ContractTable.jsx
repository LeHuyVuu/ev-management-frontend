import { useState } from "react";

import ContractContent from "./ContractContent";

const mockContracts = [
    {
        id: "HD-2024-001",
        customer: "Nguyễn Văn A",
        car: "Toyota Camry 2.5Q",
        value: "1.200.000.000 VND",
        payment: "Trả góp",
        status: "Đã duyệt",
        date: "10/07/2024",
    },
    {
        id: "HD-2024-002",
        customer: "Trần Thị B",
        car: "Mazda 3 Luxury",
        value: "750.000.000 VND",
        payment: "Tiền mặt",
        status: "Hoàn thành",
        date: "05/07/2024",
    },
    {
        id: "HD-2024-003",
        customer: "Lê Văn C",
        car: "Hyundai Santa Fe Cao cấp",
        value: "1.150.000.000 VND",
        payment: "Trả góp",
        status: "Đã tài trợ",
        date: "01/07/2024",
    },
    {
        id: "HD-2024-004",
        customer: "Phạm Thị D",
        car: "Honda City L",
        value: "600.000.000 VND",
        payment: "Tiền mặt",
        status: "Chờ xử lý",
        date: "28/06/2024",
    },
    {
        id: "HD-2024-005",
        customer: "Hoàng Văn E",
        car: "Kia Seltos Premium",
        value: "720.000.000 VND",
        payment: "Trả góp",
        status: "Đã duyệt",
        date: "20/06/2024",
    },
];

const statusColors = {
    "Đã duyệt": "bg-blue-100 text-blue-600",
    "Hoàn thành": "bg-green-100 text-green-600",
    "Đã tài trợ": "bg-purple-100 text-purple-600",
    "Chờ xử lý": "bg-yellow-100 text-yellow-600",
};


export default function ContractTable() {
    const [search, setSearch] = useState("");
    const [viewContract, setViewContract] = useState(null);

    const filteredContracts = mockContracts.filter(
        (c) =>
            c.id.toLowerCase().includes(search.toLowerCase()) ||
            c.customer.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="bg-white rounded-xl shadow p-4">
                <h2 className="text-lg font-semibold mb-4">Danh sách Hợp đồng</h2>

                {/* Search */}
                <input
                    type="text"
                    placeholder="Tìm kiếm hợp đồng..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 mb-4"
                />

                {/* Table */}
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-gray-100 text-left">
                            <th className="p-3">ID Hợp đồng</th>
                            <th className="p-3">Khách hàng</th>
                            <th className="p-3">Mẫu xe</th>
                            <th className="p-3">Giá trị</th>
                            <th className="p-3">Thanh toán</th>
                            <th className="p-3">Trạng thái</th>
                            <th className="p-3">Ngày ký</th>
                            <th className="p-3">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredContracts.map((contract) => (
                            <tr key={contract.id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{contract.id}</td>
                                <td className="p-3">{contract.customer}</td>
                                <td className="p-3">{contract.car}</td>
                                <td className="p-3">{contract.value}</td>
                                <td className="p-3">{contract.payment}</td>
                                <td className="p-3">
                                    <span
                                        className={`px-2 py-1 rounded-lg text-xs font-medium ${statusColors[contract.status]}`}
                                    >
                                        {contract.status}
                                    </span>
                                </td>
                                <td className="p-3">{contract.date}</td>
                                <td className="p-3 flex gap-2">
                                    <button className="p-1 hover:bg-gray-100 rounded-lg" onClick={() => setViewContract(contract)}>
                                        <Eye size={16} />
                                    </button>
                                    <button className="p-1 hover:bg-gray-100 rounded-lg">
                                        <Edit size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="flex justify-center items-center gap-4 mt-4 text-sm">
                    <button className="text-gray-600 hover:underline">Previous</button>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 rounded-lg bg-gray-200">1</button>
                        <button className="px-3 py-1 rounded-lg hover:bg-gray-100">2</button>
                        <button className="px-3 py-1 rounded-lg hover:bg-gray-100">3</button>
                    </div>
                    <button className="text-gray-600 hover:underline">Next</button>
                </div>
            </div>
            {/* Modal popup for contract content */}
            <ContractContent contract={viewContract} onClose={() => setViewContract(null)} />
        </div>
    );
}
