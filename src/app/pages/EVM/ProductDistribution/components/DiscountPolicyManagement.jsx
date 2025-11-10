import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Pencil, Trash2, Zap } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

const DiscountPolicyManagement = () => {
  const [discounts, setDiscounts] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ✅ State cho modal edit
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    discount_rate: "",
    valid_from: "",
    valid_to: "",
  });

  // ✅ State cho form thêm mới
  const [form, setForm] = useState({
    dealer_id: "",
    discount_rate: "",
    valid_from: "",
    valid_to: "",
  });

  // ✅ Định màu trạng thái
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
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

  // ✅ Fetch danh sách discount
  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "https://prn232.freeddns.org/financial-service/api/DealerDiscount",
        { headers: { Accept: "*/*" } }
      );
      const json = await res.json();
      if (json.status === 200) {
        const items = json.data?.items || [];
        setDiscounts(items);

        // Lấy danh sách dealer (unique)
        const uniqueDealers = [
          ...new Map(items.map((i) => [i.dealer?.dealer_id, i.dealer])).values(),
        ];
        setDealers(uniqueDealers);
      } else {
        setDiscounts([]);
        setDealers([]);
      }
    } catch (err) {
      console.error("Error loading discounts:", err);
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  // ✅ Thêm Discount Policy
  const handleAddPolicy = async () => {
    if (!form.dealer_id || !form.discount_rate || !form.valid_from || !form.valid_to) {
      toast.warning("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(
        "https://prn232.freeddns.org/financial-service/api/DealerDiscount",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
          },
          body: JSON.stringify({
            dealer_id: form.dealer_id,
            discount_rate: parseFloat(form.discount_rate),
            valid_from: form.valid_from,
            valid_to: form.valid_to,
          }),
        }
      );

      const json = await res.json();
      if (res.ok && json.status === 200) {
        toast.success("Thêm Discount Policy thành công!");
        const dealer = dealers.find((d) => d.dealer_id === form.dealer_id);
        const newItem = {
          dealer_discount_id: Math.random().toString(),
          dealer: dealer || { dealer_id: form.dealer_id, name: "New Dealer" },
          discount_rate: form.discount_rate,
          valid_from: form.valid_from,
          valid_to: form.valid_to,
          status: "pending",
        };
        setDiscounts((prev) => [newItem, ...prev]);
        setForm({ dealer_id: "", discount_rate: "", valid_from: "", valid_to: "" });
      } else {
        toast.error(json.message || "Thêm chính sách thất bại!");
      }
    } catch (err) {
      toast.error("Có lỗi khi thêm Discount Policy!");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Edit
  const openEditModal = (item) => {
    setEditingItem(item);
    setEditForm({
      discount_rate: item.discount_rate,
      valid_from: item.valid_from,
      valid_to: item.valid_to,
    });
  };

  const handleEditSave = async () => {
    if (!editingItem) return;
    try {
      setSaving(true);
      const res = await fetch(
        `https://prn232.freeddns.org/financial-service/api/DealerDiscount/${editingItem.dealer_discount_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", Accept: "*/*" },
          body: JSON.stringify({
            discount_rate: parseFloat(editForm.discount_rate),
            valid_from: editForm.valid_from,
            valid_to: editForm.valid_to,
          }),
        }
      );
      if (res.ok) {
        toast.success("Cập nhật thành công!");
        setDiscounts((prev) =>
          prev.map((d) =>
            d.dealer_discount_id === editingItem.dealer_discount_id
              ? { ...d, ...editForm }
              : d
          )
        );
        setEditingItem(null);
      } else {
        toast.error("Cập nhật thất bại!");
      }
    } catch (err) {
      toast.error("Lỗi khi cập nhật!");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Activate
  const handleActivate = async (id) => {
    try {
      const res = await fetch(
        `https://prn232.freeddns.org/financial-service/api/DealerDiscount/${id}/activate`,
        { method: "PUT", headers: { Accept: "*/*" } }
      );
      if (res.ok) {
        toast.success("Kích hoạt thành công!");
        setDiscounts((prev) =>
          prev.map((d) =>
            d.dealer_discount_id === id ? { ...d, status: "active" } : d
          )
        );
      } else {
        toast.error("Kích hoạt thất bại!");
      }
    } catch (err) {
      toast.error("Lỗi khi kích hoạt!");
    }
  };

  // ✅ Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa chính sách này không?")) return;
    try {
      const res = await fetch(
        `https://prn232.freeddns.org/financial-service/api/DealerDiscount/${id}`,
        { method: "DELETE", headers: { Accept: "*/*" } }
      );
      if (res.ok) {
        toast.success("Xóa thành công!");
        setDiscounts((prev) => prev.filter((d) => d.dealer_discount_id !== id));
      } else {
        toast.error("Xóa thất bại!");
      }
    } catch (err) {
      toast.error("Lỗi khi xóa!");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Discount Policy Management
      </h2>
      <p className="text-gray-600 mb-6">
        Configure and manage discount rates for individual dealers.
      </p>

      {/* === BẢNG DANH SÁCH === */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Dealer Discount Policies
        </h3>
        {loading ? (
          <p className="text-gray-500 text-sm">Loading data...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Dealer Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Discount Rate (%)
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Validity Period
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {discounts.map((item) => (
                  <tr key={item.dealer_discount_id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {item.dealer?.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.discount_rate}%
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.valid_from} → {item.valid_to}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex space-x-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                        title="Edit"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleActivate(item.dealer_discount_id)}
                        className="p-2 text-pink-600 hover:bg-pink-50 rounded-md"
                        title="Activate"
                      >
                        <Zap size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.dealer_discount_id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* === FORM ADD POLICY === */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Add New Discount Policy
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dealer Name
            </label>
            <select
              value={form.dealer_id}
              onChange={(e) => setForm({ ...form, dealer_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Select Dealer --</option>
              {dealers.map((d) => (
                <option key={d.dealer_id} value={d.dealer_id}>
                  {d.name} ({d.region})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Rate (%)
            </label>
            <input
              type="number"
              value={form.discount_rate}
              onChange={(e) => setForm({ ...form, discount_rate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valid From
            </label>
            <input
              type="date"
              value={form.valid_from}
              onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valid To
            </label>
            <input
              type="date"
              value={form.valid_to}
              onChange={(e) => setForm({ ...form, valid_to: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleAddPolicy}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Add Discount Policy"}
          </button>
        </div>
      </div>

      {/* === MODAL EDIT === */}
      {editingItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Discount Policy</h3>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Rate (%)
            </label>
            <input
              type="number"
              value={editForm.discount_rate}
              onChange={(e) =>
                setEditForm({ ...editForm, discount_rate: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3"
            />

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valid From
            </label>
            <input
              type="date"
              value={editForm.valid_from}
              onChange={(e) =>
                setEditForm({ ...editForm, valid_from: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3"
            />

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valid To
            </label>
            <input
              type="date"
              value={editForm.valid_to}
              onChange={(e) =>
                setEditForm({ ...editForm, valid_to: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3"
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={handleEditSave}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountPolicyManagement;
