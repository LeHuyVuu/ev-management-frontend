import React, { useEffect, useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import PromotionModal from "./PromotionModal";
import ConfirmDialog from "./PromotionConfirm";
import { getPromotions, deletePromotion } from "./PromotionService";

const getErrorMessage = (err, fallback = "Đã có lỗi xảy ra") => {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    fallback
  );
};

const PromotionManagement = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("start_date");
  const [sortOrder, setSortOrder] = useState("desc");

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / pageSize)),
    [totalItems, pageSize]
  );

  const loadPromotions = async () => {
    setLoading(true);
    try {
      const res = await getPromotions({
        PageNumber: pageNumber,
        PageSize: pageSize,
        SortBy: sortBy,
        SortOrder: sortOrder,
        Keyword: keyword,
        Status: status,
      });
      if (res?.status === 200) {
        setPromotions(res.data.items || []);
        setTotalItems(res.data.totalItems ?? 0);
      } else {
        toast.error(getErrorMessage(null, "Không thể tải danh sách promotion"));
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Không thể tải danh sách promotion"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, pageSize, sortBy, sortOrder, status]);

  const handleSearch = () => {
    setPageNumber(1);
    loadPromotions();
  };

  const handleCreate = (newItem) => {
    setPromotions((prev) => [newItem, ...prev]);
    // toast.success("Thêm promotion thành công");
  };

  const handleEdit = (updated) => {
    setPromotions((prev) =>
      prev.map((p) => (p.promotion_id === updated.promotion_id ? updated : p))
    );
    // toast.success("Cập nhật thành công");
  };

  const handleDeleteConfirm = async () => {
    try {
      await deletePromotion(deleteId);
      setPromotions((prev) => prev.filter((p) => p.promotion_id !== deleteId));
      toast.success("Xóa promotion thành công");
    } catch (err) {
      toast.error(getErrorMessage(err, "Xóa promotion thất bại"));
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  const getStatusColor = (statusText) => {
    const s = String(statusText || "").toLowerCase();
    switch (s) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <ToastContainer position="top-right" autoClose={3000} pauseOnHover={false} newestOnTop />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Promotion Management</h2>
        <button
          onClick={() => {
            setEditItem(null);
            setModalOpen(true);
          }}
          className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          <Plus className="mr-2" size={18} /> Create Promotion
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          className="border rounded-md px-3 py-2 text-sm flex-1"
          placeholder="Search by name or type"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <select
          className="border rounded-md px-3 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="pending">Pending</option>
        </select>
        <button
          onClick={handleSearch}
          className="flex items-center bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md text-sm"
        >
          <Search className="mr-1" size={16} /> Search
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Start</th>
              <th className="px-4 py-2 text-left">End</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : promotions.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  No promotions found.
                </td>
              </tr>
            ) : (
              promotions.map((p) => (
                <tr key={p.promotion_id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{p.name}</td>
                  <td className="px-4 py-2">{p.type}</td>
                  <td className="px-4 py-2">{p.start_date}</td>
                  <td className="px-4 py-2">{p.end_date}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        p.status
                      )}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">{p.description}</td>

                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => {
                        setEditItem(p);
                        setModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                      aria-label="Sửa"
                      title="Sửa"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteId(p.promotion_id);
                        setConfirmOpen(true);
                      }}
                      className="text-red-600 hover:text-red-800"
                      aria-label="Xóa"
                      title="Xóa"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        <div>
          Page {pageNumber} / {totalPages}
        </div>
        <div className="flex gap-2">
          <button
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber((p) => p - 1)}
            className="p-2 border rounded-md hover:bg-gray-100 disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            disabled={pageNumber >= totalPages}
            onClick={() => setPageNumber((p) => p + 1)}
            className="p-2 border rounded-md hover:bg-gray-100 disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <PromotionModal
        open={modalOpen}
        item={editItem}
        onClose={() => setModalOpen(false)}
        onSave={editItem ? handleEdit : handleCreate}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Xác nhận xóa Promotion"
        desc="Bạn có chắc chắn muốn xóa promotion này không?"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default PromotionManagement;
