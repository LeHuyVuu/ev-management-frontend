export default function ManufacturerDebtReport() {
    const debts = [
        {
            manufacturer: "Toyota",
            amount: "5.5 Tỷ VNĐ",
            dueDate: "10/08/2024",
            status: "Đã xác nhận",
            statusColor: "bg-green-100 text-green-600",
        },
        {
            manufacturer: "Honda",
            amount: "3.2 Tỷ VNĐ",
            dueDate: "20/08/2024",
            status: "Chờ thanh toán",
            statusColor: "bg-yellow-100 text-yellow-700",
        },
        {
            manufacturer: "Mazda",
            amount: "2.8 Tỷ VNĐ",
            dueDate: "01/09/2024",
            status: "Chờ xác nhận",
            statusColor: "bg-blue-100 text-blue-600",
        },
        {
            manufacturer: "Kia",
            amount: "1.9 Tỷ VNĐ",
            dueDate: "15/08/2024",
            status: "Đã xác nhận",
            statusColor: "bg-green-100 text-green-600",
        },
        {
            manufacturer: "Hyundai",
            amount: "2.1 Tỷ VNĐ",
            dueDate: "28/08/2024",
            status: "Chờ thanh toán",
            statusColor: "bg-yellow-100 text-yellow-700",
        },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="text-base font-semibold mb-4">Báo cáo nợ nhà sản xuất</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead>
                        <tr className="text-gray-600 bg-gray-50">
                            <th className="px-4 py-2 font-medium">Nhà sản xuất</th>
                            <th className="px-4 py-2 font-medium">Số tiền nợ</th>
                            <th className="px-4 py-2 font-medium">Ngày đáo hạn</th>
                            <th className="px-4 py-2 font-medium">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {debts.map((item, idx) => (
                            <tr key={idx} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-800">
                                    {item.manufacturer}
                                </td>
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
