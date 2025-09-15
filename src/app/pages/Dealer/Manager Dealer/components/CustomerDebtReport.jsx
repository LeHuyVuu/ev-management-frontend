export default function CustomerDebtReport() {
    const debts = [
        {
            name: "Nguyễn Thị H",
            car: "Honda City",
            amount: "120 Triệu VNĐ",
            dueDate: "30/06/2024",
            status: "Quá hạn",
            statusColor: "bg-red-100 text-red-600",
        },
        {
            name: "Trần Văn K",
            car: "Mazda CX-5",
            amount: "80 Triệu VNĐ",
            dueDate: "15/07/2024",
            status: "Sắp đến hạn",
            statusColor: "bg-yellow-100 text-yellow-700",
        },
        {
            name: "Lê Thị M",
            car: "Toyota Vios",
            amount: "50 Triệu VNĐ",
            dueDate: "20/07/2024",
            status: "Chưa đến hạn",
            statusColor: "bg-green-100 text-green-600",
        },
        {
            name: "Phạm Văn N",
            car: "Kia Cerato",
            amount: "95 Triệu VNĐ",
            dueDate: "05/07/2024",
            status: "Quá hạn",
            statusColor: "bg-red-100 text-red-600",
        },
        {
            name: "Đặng Thị P",
            car: "Hyundai Elantra",
            amount: "70 Triệu VNĐ",
            dueDate: "25/07/2024",
            status: "Sắp đến hạn",
            statusColor: "bg-yellow-100 text-yellow-700",
        },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="text-base font-semibold mb-4">Báo cáo nợ khách hàng</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead>
                        <tr className="text-gray-600 bg-gray-50">
                            <th className="px-4 py-2 font-medium">Khách hàng</th>
                            <th className="px-4 py-2 font-medium">Mẫu xe</th>
                            <th className="px-4 py-2 font-medium">Số tiền nợ</th>
                            <th className="px-4 py-2 font-medium">Ngày đáo hạn</th>
                            <th className="px-4 py-2 font-medium">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {debts.map((item, idx) => (
                            <tr key={idx} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                                <td className="px-4 py-3 text-gray-700">{item.car}</td>
                                <td className="px-4 py-3 text-gray-700">{item.amount}</td>
                                <td className="px-4 py-3 text-gray-700">{item.dueDate}</td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${item.statusColor}`}
                                    >
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
