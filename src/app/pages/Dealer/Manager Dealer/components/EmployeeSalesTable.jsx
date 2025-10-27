import { useEffect, useState } from "react";
import api from "../../../../context/api";

function formatVnd(v) {
    try {
        return new Intl.NumberFormat("vi-VN").format(Number(v)) + " VND";
    } catch (e) {
        return String(v);
    }
}

function badgeClass(status) {
    switch ((status || "").toLowerCase()) {
        case "xuất sắc":
        case "xuat sac":
            return "px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700";
        case "tốt":
        case "tot":
            return "px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700";
        case "đang tiến triển":
        case "dang tien trien":
            return "px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700";
        case "cần cải thiện":
        case "can cai thien":
            return "px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700";
        default:
            return "px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700";
    }
}

export default function EmployeeSalesTable() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;
        async function load() {
            setLoading(true);
            setError("");

            const base = api?.financial;
            if (!base) {
                setError("VITE_API_FINANCIAL is not configured. Please set it in .env and restart the dev server.");
                setLoading(false);
                return;
            }

            const token = (typeof window !== "undefined" && localStorage.getItem("token")) || "";

            try {
                const url = `${base.replace(/\/+$/, "")}/api/Order/employee-sales`;
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

                const data = await res.json();
                if (mounted) setRows(Array.isArray(data) ? data : []);
            } catch (err) {
                if (mounted) setError(err.message || String(err));
            } finally {
                if (mounted) setLoading(false);
            }
        }

        load();
        return () => (mounted = false);
    }, []);

    return (
        <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="text-base font-semibold mb-4">Doanh số theo nhân viên</h2>
            {error ? (
                <div className="text-red-600 mb-2">Lỗi: {error}</div>
            ) : null}
            <div className="overflow-x-auto">
                {/* Constrain table height and allow internal vertical scrolling so the whole page
                    doesn't need to be scrolled when the table is long. Adjust `max-h-80` as needed. */}
                <div className="max-h-80 overflow-y-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-2">Nhân viên</th>
                            <th className="px-4 py-2">Tổng doanh số</th>
                            <th className="px-4 py-2">Mục tiêu</th>
                            <th className="px-4 py-2">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                                    Đang tải...
                                </td>
                            </tr>
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                                    Không có dữ liệu
                                </td>
                            </tr>
                        ) : (
                            rows.map((r, idx) => (
                                <tr key={idx} className={`border-b ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                                    <td className="px-4 py-3 font-medium">{r.employeeName || "-"}</td>
                                    <td className="px-4 py-3">{formatVnd(r.totalSalesVnd ?? 0)}</td>
                                    <td className="px-4 py-3">
                                        {typeof r.targetAchievedPct === "number" && r.targetAchievedPct <= 100
                                            ? `${r.targetAchievedPct}%`
                                            : formatVnd(r.targetAchievedPct)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={badgeClass(r.performanceStatus)}>{r.performanceStatus || "-"}</span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
