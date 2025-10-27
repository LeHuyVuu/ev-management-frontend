import React, { useEffect, useState } from "react";
import { DollarSign, Car, Target, CreditCard } from "lucide-react";
import api from "../../../../context/api";

function formatVnd(value) {
    if (value == null) return "-";
    try {
        return new Intl.NumberFormat("vi-VN").format(Number(value)) + " VND";
    } catch (e) {
        return String(value);
    }
}

function formatPercent(pct) {
    if (pct == null || Number.isNaN(Number(pct))) return "-";
    const n = Number(pct);
    const sign = n > 0 ? "+" : "";
    return `${sign}${n}% so với tháng trước`;
}

function valuePositive(pct) {
    if (pct == null || Number.isNaN(Number(pct))) return true;
    return Number(pct) >= 0;
}

export default function DashboardStats() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;

        async function fetchSummary() {
            setLoading(true);
            setError("");

            // Quick check: token must be present (read at runtime)
            const token = (typeof window !== "undefined" && localStorage.getItem("token")) || "";
            if (!token) {
                if (mounted) {
                    setError('Token not found in localStorage (key "token"). Vui lòng đăng nhập.');
                    setLoading(false);
                }
                return;
            }

            try {
                // Use the configured financial base URL from env. If it's missing, surface a clear error.
                const base = api?.financial;
                if (!base) {
                    if (mounted) setError('VITE_API_FINANCIAL is not set. Please add it to your .env and restart the dev server.');
                    return;
                }
                const url = `${base.replace(/\/+$/, "")}/api/Order/dashboard-summary`;

                const res = await fetch(url, {
                    headers: {
                        accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    // try to extract server error message
                    let errMsg = `HTTP ${res.status}`;
                    if (res.status === 401 || res.status === 403) {
                        errMsg = `${errMsg} - Unauthorized. Please login again.`;
                    }
                    try {
                        const errJson = await res.json();
                        if (errJson?.message) errMsg += ` - ${errJson.message}`;
                        else if (errJson?.error) errMsg += ` - ${errJson.error}`;
                        else errMsg += ` - ${JSON.stringify(errJson)}`;
                    } catch (e) {
                        try {
                            const txt = await res.text();
                            if (txt) errMsg += ` - ${txt}`;
                        } catch (e2) {}
                    }
                    throw new Error(errMsg);
                }

                const j = await res.json();
                if (mounted) setSummary(j);
            } catch (err) {
                if (mounted) setError(err.message || "Lỗi khi tải số liệu");
            } finally {
                if (mounted) setLoading(false);
            }
        }

        fetchSummary();

        return () => {
            mounted = false;
        };
    }, []);

    const stats = [
        {
            title: "Tổng doanh số tháng",
            value: loading ? "Đang tải..." : summary ? formatVnd(summary.totalMonthlyRevenueVnd) : "-",
            change: loading ? "" : summary ? formatPercent(summary.revenueMoMChangePct) : "",
            positive: loading ? true : summary ? valuePositive(summary.revenueMoMChangePct) : true,
            icon: <DollarSign className="w-5 h-5 text-sky-500" />,
            iconBg: "bg-sky-100",
        },
        {
            title: "Xe đã bán tháng này",
            value: loading ? "Đang tải..." : summary ? `${summary.carsSoldThisMonth} chiếc` : "-",
            change: loading ? "" : summary ? formatPercent(summary.carsSoldMoMChangePct) : "",
            positive: loading ? true : summary ? valuePositive(summary.carsSoldMoMChangePct) : true,
            icon: <Car className="w-5 h-5 text-gray-600" />,
            iconBg: "bg-gray-100",
        },
        {
            title: "Mục tiêu đạt được",
            // targetAchievedPct sometimes contains a large number; show badge when available
            value: loading ? "Đang tải..." : summary ? (typeof summary.targetAchievedPct === "number" && summary.targetAchievedPct <= 100 ? `${summary.targetAchievedPct}%` : formatVnd(summary.targetAchievedPct)) : "-",
            change: loading ? "" : summary ? (summary.targetBadge || "") : "",
            positive: true,
            icon: <Target className="w-5 h-5 text-orange-500" />,
            iconBg: "bg-orange-100",
        },
        {
            title: "Nợ khách hàng",
            value: loading ? "Đang tải..." : summary ? formatVnd(summary.customerDebtVnd) : "-",
            change: loading ? "" : summary ? formatPercent(summary.customerDebtMoMChangePct) : "",
            positive: loading ? true : summary ? valuePositive(summary.customerDebtMoMChangePct) : true,
            icon: <CreditCard className="w-5 h-5 text-red-500" />,
            iconBg: "bg-red-100",
        },
    ];

    if (error) {
        return (
            <div className="bg-white rounded-2xl p-4 border text-red-600">Có lỗi khi tải dữ liệu: {error}</div>
        );
    }

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
                        className={`text-sm ${item.positive ? "text-green-600" : "text-red-600"}`}
                    >
                        {item.change}
                    </p>
                </div>
            ))}
        </div>
    );
}
