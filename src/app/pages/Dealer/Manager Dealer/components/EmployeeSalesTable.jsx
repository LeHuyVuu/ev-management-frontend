export default function EmployeeSalesTable() {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="text-base font-semibold mb-4">Doanh số theo nhân viên</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                        <tr>
                            <th className="px-4 py-2">Nhân viên</th>
                            <th className="px-4 py-2">Tổng doanh số</th>
                            <th className="px-4 py-2">Mục tiêu</th>
                            <th className="px-4 py-2">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b bg-white">
                            <td className="px-4 py-3 font-medium">Nguyễn Văn A</td>
                            <td className="px-4 py-3">450 Triệu VNĐ</td>
                            <td className="px-4 py-3">120%</td>
                            <td className="px-4 py-3">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                    Xuất sắc
                                </span>
                            </td>
                        </tr>
                        <tr className="border-b bg-gray-50">
                            <td className="px-4 py-3 font-medium">Trần Thị B</td>
                            <td className="px-4 py-3">380 Triệu VNĐ</td>
                            <td className="px-4 py-3">105%</td>
                            <td className="px-4 py-3">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                    Tốt
                                </span>
                            </td>
                        </tr>
                        <tr className="border-b bg-white">
                            <td className="px-4 py-3 font-medium">Lê Văn C</td>
                            <td className="px-4 py-3">320 Triệu VNĐ</td>
                            <td className="px-4 py-3">90%</td>
                            <td className="px-4 py-3">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                    Đang tiến triển
                                </span>
                            </td>
                        </tr>
                        <tr className="border-b bg-gray-50">
                            <td className="px-4 py-3 font-medium">Phạm Thị D</td>
                            <td className="px-4 py-3">280 Triệu VNĐ</td>
                            <td className="px-4 py-3">80%</td>
                            <td className="px-4 py-3">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                    Cần cải thiện
                                </span>
                            </td>
                        </tr>
                        <tr className="bg-white">
                            <td className="px-4 py-3 font-medium">Hoàng Văn E</td>
                            <td className="px-4 py-3">250 Triệu VNĐ</td>
                            <td className="px-4 py-3">75%</td>
                            <td className="px-4 py-3">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                    Cần cải thiện
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
