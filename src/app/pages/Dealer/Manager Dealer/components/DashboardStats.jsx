import { DollarSign, Car, Target, CreditCard } from "lucide-react";

export default function DashboardStats() {
    const stats = [
        {
            title: "Tổng doanh số tháng",
            value: "1.2 Tỷ VNĐ",
            change: "+5.2% tháng trước",
            positive: true,
            icon: <DollarSign className="w-5 h-5 text-sky-500" />,
            iconBg: "bg-sky-100",
        },
        {
            title: "Xe đã bán tháng này",
            value: "150 chiếc",
            change: "+12.8% tháng trước",
            positive: true,
            icon: <Car className="w-5 h-5 text-gray-600" />,
            iconBg: "bg-gray-100",
        },
        {
            title: "Mục tiêu đạt được",
            value: "85%",
            change: "Gần đạt",
            positive: true,
            icon: <Target className="w-5 h-5 text-orange-500" />,
            iconBg: "bg-orange-100",
        },
        {
            title: "Nợ khách hàng",
            value: "250 Triệu VNĐ",
            change: "-3.1% tháng trước",
            positive: false,
            icon: <CreditCard className="w-5 h-5 text-red-500" />,
            iconBg: "bg-red-100",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((item, index) => (
                <div
                    key={index}
                    className="bg-white shadow-sm rounded-2xl p-4 flex flex-col space-y-2 border"
                >
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">{item.title}</p>
                        <div className={`p-2 rounded-full ${item.iconBg}`}>{item.icon}</div>
                    </div>
                    <h3 className="text-xl font-bold">{item.value}</h3>
                    <p
                        className={`text-sm ${item.positive ? "text-green-600" : "text-red-600"
                            }`}
                    >
                        {item.change}
                    </p>
                </div>
            ))}
        </div>
    );
}
