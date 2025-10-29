import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";

const SalesReport = () => {
  const [salesData, setSalesData] = useState([]);
  const [dealerData, setDealerData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [salesRes, dealerRes] = await Promise.all([
          axios.get("https://prn232.freeddns.org/brand-service/api/reports/sales"),
          axios.get("https://prn232.freeddns.org/brand-service/api/reports/top-dealers"),
        ]);

        const salesSummary = salesRes.data?.data?.salesSummary || [];
        const topDealers = dealerRes.data?.data?.topDealers || [];

        setSalesData(salesSummary);
        setDealerData(topDealers);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const colors = ["#6366F1", "#10B981", "#F59E0B", "#EC4899", "#3B82F6"];

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading sales report...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Sales Report</h2>

      {/* Chart Section */}
      <div className="w-full mb-10">
        <div className="p-4 border border-gray-200 rounded-lg bg-gradient-to-b from-indigo-50 to-white shadow-inner">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sales & Revenue by Model
          </h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={salesData}
                margin={{ top: 30, right: 30, left: 0, bottom: 30 }}
                barGap={10}
              >
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.2} />
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="model"
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis />
                <Tooltip
                  cursor={{ fill: "rgba(99,102,241,0.05)" }}
                  contentStyle={{
                    background: "white",
                    borderRadius: "10px",
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                  }}
                  formatter={(value) =>
                    typeof value === "number"
                      ? value.toLocaleString("vi-VN")
                      : value
                  }
                />
                <Legend />
                <Bar
                  dataKey="totalSales"
                  fill="url(#colorSales)"
                  name="Total Sales"
                  radius={[12, 12, 0, 0]}
                  animationDuration={1200}
                >
                  {salesData.map((entry, index) => (
                    <Cell key={`cell-sales-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
                <Bar
                  dataKey="totalRevenue"
                  fill="url(#colorRevenue)"
                  name="Total Revenue (₫)"
                  radius={[12, 12, 0, 0]}
                  animationDuration={1800}
                >
                  {salesData.map((entry, index) => (
                    <Cell
                      key={`cell-revenue-${index}`}
                      fillOpacity={0.8}
                      strokeWidth={1}
                      stroke="rgba(0,0,0,0.05)"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Dealers Table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top Dealers by Sales Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-md overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Dealer
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Region
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Total Sales (₫)
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Growth (%)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dealerData.map((dealer, index) => (
                <tr
                  key={index}
                  className="hover:bg-indigo-50 transition duration-200"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {dealer.dealerName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {dealer.region}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {dealer.totalSales.toLocaleString("vi-VN")}
                  </td>
                  <td
                    className={`px-6 py-4 text-sm font-semibold ${
                      dealer.growthPercent.startsWith("+")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {dealer.growthPercent}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;
