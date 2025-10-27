import { useState, useEffect } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import api from "../../../../context/api";

function monthLabel(m) {
    return `Tháng ${m}`;
}

function formatVndToBillion(vnd) {
    if (vnd == null) return 0;
    return Number(vnd) / 1_000_000_000; // convert to billions
}

export default function MonthlyRevenueChart() {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;
        async function load() {
            setLoading(true);
            setError("");

            // ensure we have the financial base URL
            const base = api?.financial;
            if (!base) {
                setError("VITE_API_FINANCIAL is not configured. Please set it in .env and restart the dev server.");
                setLoading(false);
                return;
            }

            const token = (typeof window !== "undefined" && localStorage.getItem("token")) || "";

            try {
                const url = `${base.replace(/\/+$/, "")}/api/Order/monthly-revenue?year=${selectedYear}`;
                const res = await fetch(url, {
                    headers: {
                        Accept: "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });

                if (!res.ok) {
                    let msg = `HTTP ${res.status}`;
                    try {
                        const js = await res.json();
                        msg += js?.message ? ` - ${js.message}` : ` - ${JSON.stringify(js)}`;
                    } catch (_) {
                        const txt = await res.text();
                        if (txt) msg += ` - ${txt}`;
                    }
                    throw new Error(msg);
                }

                const arr = await res.json();
                // normalize to 12 months
                const normalized = Array.from({ length: 12 }, (_, i) => {
                    const monthObj = arr?.find((r) => Number(r.month) === i + 1) || null;
                    return {
                        month: monthLabel(i + 1),
                        revenue: monthObj ? formatVndToBillion(monthObj.revenueVnd) : 0,
                        unitsSold: monthObj ? monthObj.unitsSold : 0,
                    };
                });

                if (mounted) setData(normalized);
            } catch (err) {
                if (mounted) setError(err.message || String(err));
            } finally {
                if (mounted) setLoading(false);
            }
        }

        load();
        return () => (mounted = false);
    }, [selectedYear]);

    const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

    return (
        <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold">Doanh số hàng tháng</h2>
                <div className="flex items-center space-x-2">
                    <select
                        className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                    >
                        {yearOptions.map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {error ? (
                <div className="text-red-600">Lỗi: {error}</div>
            ) : (
                <div className="w-full h-64">
                    <ResponsiveContainer>
                        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="month" />
                            <YAxis tickFormatter={(v) => `${v} Tỷ`} />
                            <Tooltip formatter={(value, name, props) => [`${Number(value).toLocaleString()} Tỷ`, "Doanh thu"]} />
                            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
