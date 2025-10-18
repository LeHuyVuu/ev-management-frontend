import { useEffect, useMemo, useState } from "react";
import { Eye, Edit } from "lucide-react";
import ContractContent from "./ContractCard";

// ===== Config =====
const API_URL = "https://prn232.freeddns.org/customer-service/contracts/dealers";
// Prefer environment variables. Fallback lets you paste a token locally during dev.
const TOKEN = localStorage.getItem("token"); 

// ===== Helpers =====
const statusMap = {
  approved: "Đã duyệt",
  completed: "Hoàn thành",
  funded: "Đã tài trợ",
  pending: "Chờ xử lý",
};

const statusColors = {
  "Đã duyệt": "bg-blue-100 text-blue-600",
  "Hoàn thành": "bg-green-100 text-green-600",
  "Đã tài trợ": "bg-purple-100 text-purple-600",
  "Chờ xử lý": "bg-yellow-100 text-yellow-600",
};

function formatVND(amount) {
  if (amount == null || isNaN(Number(amount))) return "-";
  try {
    return new Intl.NumberFormat("vi-VN").format(Number(amount)) + " VND";
  } catch {
    return `${amount} VND`;
  }
}

function formatDateISOToVN(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function toViewModel(apiItem) {
  // Keep the original UI shape, just map fields
  return {
    id: apiItem.contractId, // show full UUID to keep it unique; adjust if you want a short code
    customer: apiItem.customerName,
    car: [apiItem.brand, apiItem.vehicleName, apiItem.versionName].filter(Boolean).join(" "),
    value: formatVND(apiItem.totalValue),
    payment: "-", // API không trả về, giữ nguyên giao diện bằng dấu gạch ngang
    status: statusMap[apiItem.status] || apiItem.status || "-",
    date: formatDateISOToVN(apiItem.signedDate),
    __raw: apiItem, // keep original payload for modal/details if needed
  };
}

export default function ContractTable() {
  const [search, setSearch] = useState("");
  const [viewContract, setViewContract] = useState(null);

  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 10; // giữ nguyên giao diện phân trang, mỗi trang 10 dòng

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(API_URL, {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${TOKEN}`,
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const list = Array.isArray(json?.data) ? json.data.map(toViewModel) : [];
        if (isMounted) setContracts(list);
      } catch (e) {
        if (isMounted) setError(e?.message || "Lỗi không xác định");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Search
  const filteredContracts = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return contracts;
    return contracts.filter(
      (c) => c.id?.toLowerCase().includes(s) || c.customer?.toLowerCase().includes(s)
    );
  }, [contracts, search]);

  // Pagination (client-side, giữ nguyên UI)
  const totalPages = Math.max(1, Math.ceil(filteredContracts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const paginated = filteredContracts.slice(start, end);

  return (
    <div>
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Danh sách Hợp đồng</h2>

        {/* Search */}
        <input
          type="text"
          placeholder="Tìm kiếm hợp đồng..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // reset to first page on search
          }}
          className="w-full border rounded-lg px-3 py-2 mb-4"
        />

        {/* Loading / Error */}
        {loading && (
          <div className="mb-3 text-sm text-gray-600">Đang tải dữ liệu...</div>
        )}
        {error && (
          <div className="mb-3 text-sm text-red-600">Lỗi tải dữ liệu: {error}</div>
        )}

        {/* Table */}
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">ID Hợp đồng</th>
              <th className="p-3">Khách hàng</th>
              <th className="p-3">Mẫu xe</th>
              <th className="p-3">Giá trị</th>
              <th className="p-3">Thanh toán</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Ngày ký</th>
              <th className="p-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((contract) => (
              <tr key={contract.id} className="border-b hover:bg-gray-50">
                <td className="p-3 break-all">{contract.id}</td>
                <td className="p-3">{contract.customer}</td>
                <td className="p-3">{contract.car}</td>
                <td className="p-3">{contract.value}</td>
                <td className="p-3">{contract.payment}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      statusColors[contract.status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {contract.status}
                  </span>
                </td>
                <td className="p-3">{contract.date}</td>
                <td className="p-3 flex gap-2">
                  <button
                    className="p-1 hover:bg-gray-100 rounded-lg"
                    onClick={() => setViewContract(contract)}
                  >
                    <Eye size={16} />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded-lg">
                    <Edit size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {!loading && !error && paginated.length === 0 && (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-500">
                  Không có dữ liệu.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 mt-4 text-sm">
          <button
            className="text-gray-600 hover:underline disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const i = idx + 1;
              const active = i === currentPage;
              return (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`px-3 py-1 rounded-lg ${
                    active ? "bg-gray-200" : "hover:bg-gray-100"
                  }`}
                >
                  {i}
                </button>
              );
            })}
          </div>
          <button
            className="text-gray-600 hover:underline disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal popup for contract content - only show when viewContract is not null */}
      {viewContract && (
        <ContractContent contract={viewContract} onClose={() => setViewContract(null)} />
      )}
    </div>
  );
}
