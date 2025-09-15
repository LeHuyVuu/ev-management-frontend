import { useState } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function MonthlyRevenueChart() {
    const dataByYear = {
        2023: [
            { month: "Tháng 1", revenue: 0.7 },
            { month: "Tháng 2", revenue: 0.9 },
            { month: "Tháng 3", revenue: 1.0 },
            { month: "Tháng 4", revenue: 1.2 },
            { month: "Tháng 5", revenue: 1.1 },
            { month: "Tháng 6", revenue: 1.4 },
        ],
        2024: [
            { month: "Tháng 1", revenue: 0.9 },
            { month: "Tháng 2", revenue: 1.2 },
            { month: "Tháng 3", revenue: 1.0 },
            { month: "Tháng 4", revenue: 1.4 },
            { month: "Tháng 5", revenue: 1.3 },
            { month: "Tháng 6", revenue: 1.8 },
        ],
    };
    const years = Object.keys(dataByYear); // ví dụ {2023: [...], 2024: [...]}
    const [selectedYear, setSelectedYear] = useState(years[0]);

    return (
        <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold">Doanh số hàng tháng</h2>
                <select
                    className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                >
                    {years.map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>
            </div>

            <div className="w-full h-64">
                <ResponsiveContainer>
                    <AreaChart
                        data={dataByYear[selectedYear]}
                        margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value} Tỷ VNĐ`} />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#3b82f6"
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
