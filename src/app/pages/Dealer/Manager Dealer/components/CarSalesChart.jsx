import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

const data = [
    { name: "Toyota Camry", value: 36 },
    { name: "Honda CR-V", value: 26 },
    { name: "Mazda 3", value: 17 },
    { name: "Kia Seltos", value: 13 },
    { name: "Hyundai Accent", value: 9 },
];

const COLORS = ["#0088FE", "#4B5563", "#1F2937", "#FBBF24", "#F97316"];

export default function CarSalesChart() {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="text-base font-semibold mb-4">Doanh số theo mẫu xe</h2>
            <div className="flex justify-center">
                <PieChart width={300} height={300}>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} chiếc`} />
                    <Legend
                        verticalAlign="bottom"
                        align="center"
                        layout="horizontal"
                        iconType="circle"
                        formatter={(value) => (
                            <span className="text-sm text-gray-700">{value}</span>
                        )}
                    />
                </PieChart>
            </div>
        </div>
    );
}
