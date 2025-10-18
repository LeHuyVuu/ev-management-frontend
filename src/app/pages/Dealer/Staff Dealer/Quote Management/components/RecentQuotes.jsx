// RecentQuotes.jsx
import React, { useEffect, useState } from "react";
import { Eye, Pencil, Trash2, Folder } from "lucide-react";
import QuoteDetailModal from "./QuoteDetailModal"; // ⬅️ import thêm

const API_URL = "https://prn232.freeddns.org/customer-service/api/quotes/dealers";

function getTokenFromLocalStorage() {
    const keys = ["access_token", "token", "authToken", "jwt"];
    for (const k of keys) {
        const v = window.localStorage.getItem(k);
        if (v) return v;
    }
    return null;
}

function formatVND(n) {
    if (typeof n !== "number") return n || "";
    return new Intl.NumberFormat("vi-VN").format(n) + " VND";
}

export default function RecentQuotes() {
    const [recentQuotes, setRecentQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    // ⬇️ Thêm state cho modal
    const [openDetail, setOpenDetail] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => {
        async function load() {
            try {
                const token = getTokenFromLocalStorage();
                if (!token) {
                    setErr("Không tìm thấy token trong localStorage.");
                    setLoading(false);
                    return;
                }

                const res = await fetch(API_URL, {
                    method: "GET",
                    headers: {
                        accept: "*/*",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`API lỗi (${res.status}): ${text || res.statusText}`);
                }

                const json = await res.json();
                const mapped = Array.isArray(json?.data)
                    ? json.data.map((q) => ({
                        id: q.quoteId,
                        customer: q.customerName,
                        car: [q.brand, q.vehicleName, q.versionName].filter(Boolean).join(" "),
                        total: formatVND(Number(q.totalPrice)),
                    }))
                    : [];

                setRecentQuotes(mapped);
            } catch (e) {
                setErr(e.message || "Đã xảy ra lỗi khi tải dữ liệu.");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const handleDelete = (id) => {
        if (window.confirm(`Bạn có chắc muốn xoá báo giá #${id}?`)) {
            setRecentQuotes((prev) => prev.filter((q) => q.id !== id));
            // TODO: Gọi API xoá nếu có
        }
    };

    // ⬇️ Mở modal xem chi tiết
    const openDetailModal = (id) => {
        setSelectedId(id);
        setOpenDetail(true);
    };

    return (
        <div className="w-full  px-4 mt-4">
            <h2 className="text-2xl font-semibold mb-6">Báo giá Gần đây</h2>

            {loading && (
                <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
            )}

            {!loading && err && <p className="text-red-600 text-sm">⚠️ {err}</p>}

            {!loading && !err && recentQuotes.length === 0 && (
                <p className="text-gray-600">Không có báo giá nào.</p>
            )}

            {!loading && !err && recentQuotes.length > 0 && (
                <div className="grid gap-4">
                    {recentQuotes.map((quote) => (
                        <div
                            key={quote.id}
                            className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-start justify-between hover:shadow-md transition"
                        >
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center text-gray-800 font-semibold mb-1">
                                    <Folder className="mr-2 text-indigo-600" size={18} />
                                    Báo giá <span className="ml-1 text-gray-600">#{quote.id}</span>
                                </div>
                                <p className="text-sm text-gray-700">
                                    <strong>Khách hàng:</strong> {quote.customer}
                                </p>
                                <p className="text-sm text-gray-700">
                                    <strong>Xe:</strong> {quote.car}
                                </p>
                                <p className="text-sm text-gray-700">
                                    <strong>Tổng cộng:</strong>{" "}
                                    <span className="font-semibold text-indigo-600">{quote.total}</span>
                                </p>
                            </div>
                            <div className="flex items-center space-x-3 ml-4">
                                <button
                                    title="Xem"
                                    onClick={() => openDetailModal(quote.id)} // ⬅️ đổi thành mở modal
                                    className="text-gray-600 hover:text-indigo-600 transition"
                                >
                                    <Eye size={18} />
                                </button>
                                <button
                                    title="Sửa"
                                    onClick={() => alert(`Sửa báo giá #${quote.id}`)}
                                    className="text-gray-600 hover:text-yellow-500 transition"
                                >
                                    <Pencil size={18} />
                                </button>
                                <button
                                    title="Xoá"
                                    onClick={() => handleDelete(quote.id)}
                                    className="text-red-500 hover:text-red-700 transition"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <QuoteDetailModal
                open={openDetail}
                quoteId={selectedId}
                onClose={() => setOpenDetail(false)}
                onUpdated={(id) => {
                    // tuỳ chọn: cập nhật UI list nếu cần
                    // ví dụ: có thể refetch list hoặc cập nhật item được chọn
                    // hiện tại có thể bỏ trống cũng OK
                }}
            />

        </div>
    );
}
