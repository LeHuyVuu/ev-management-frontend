import React, { useEffect, useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Pencil, Trash2, Zap } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

const DiscountPolicyManagement = () => {
  const [discounts, setDiscounts] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ===== Edit modal state =====
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    discount_rate: "",
    valid_from: "",
    valid_to: "",
  });
  const [editErrors, setEditErrors] = useState({
    discount_rate: "",
    valid_from: "",
    valid_to: "",
  });

  // ===== Add form state =====
  const [form, setForm] = useState({
    dealer_id: "",
    discount_rate: "",
    valid_from: "",
    valid_to: "",
  });
  const [formErrors, setFormErrors] = useState({
    dealer_id: "",
    discount_rate: "",
    valid_from: "",
    valid_to: "",
  });

  // ===== Helpers =====
  const isPositive = (v) => !Number.isNaN(Number(v)) && Number(v) > 0;

  const toLocalDate = (str) => {
    if (!str) return NaN;
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const validateDateRange = (fromStr, toStr) => {
    const from = toLocalDate(fromStr);
    const to = toLocalDate(toStr);
    if (!fromStr) return { field: "valid_from", msg: "Vui lòng chọn Valid From." };
    if (!toStr) return { field: "valid_to", msg: "Vui lòng chọn Valid To." };
    if (isNaN(from)) return { field: "valid_from", msg: "Ngày không hợp lệ." };
    if (isNaN(to)) return { field: "valid_to", msg: "Ngày không hợp lệ." };
    if (to < from) return { field: "valid_to", msg: "Valid To phải sau hoặc bằng Valid From." };
    return null;
  };

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

  // ===== Fetch discounts =====
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

        // only active dealers + unique by dealer_id
        const uniqueDealers = [
          ...new Map(
            items
              .filter((i) => i.dealer && String(i.dealer.status || "").toLowerCase() === "active")
              .map((i) => [i.dealer?.dealer_id, i.dealer])
          ).values(),
        ];
        setDealers(uniqueDealers);
      } else {
        setDiscounts([]);
        setDealers([]);
      }
    } catch (err) {
      console.error("Error loading discounts:", err);
      setDiscounts([]);
      setDealers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  // ===== Field-level validators (Add) =====
  const validateAddField = (name, value, whole = form) => {
    switch (name) {
      case "dealer_id":
        return value ? "" : "Vui lòng chọn Dealer.";
      case "discount_rate":
        return isPositive(value) ? "" : "Discount rate phải lớn hơn 0.";
      case "valid_from":
      case "valid_to": {
        const err = validateDateRange(whole.valid_from, whole.valid_to);
        if (!err) return "";
        // show error only on the relevant field
        return err.field === name ? err.msg : "";
      }
      default:
        return "";
    }
  };

  // ===== Field-level validators (Edit) =====
  const validateEditField = (name, value, whole = editForm) => {
    switch (name) {
      case "discount_rate":
        return isPositive(value) ? "" : "Discount rate phải lớn hơn 0.";
      case "valid_from":
      case "valid_to": {
        const err = validateDateRange(whole.valid_from, whole.valid_to);
        if (!err) return "";
        return err.field === name ? err.msg : "";
      }
      default:
        return "";
    }
  };

  // ===== Derived validity for disabling buttons =====
  const addFormValid =
    form.dealer_id &&
    isPositive(form.discount_rate) &&
    !validateDateRange(form.valid_from, form.valid_to);

  const editFormValid =
    isPositive(editForm.discount_rate) &&
    !validateDateRange(editForm.valid_from, editForm.valid_to);

  // ===== Handlers: Add form change/blur =====
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    const next = { ...form, [name]: value };
    setForm(next);
    setFormErrors((prev) => ({
      ...prev,
      [name]: validateAddField(name, value, next),
      // when either date changes, update the other date's error too (sync pair)
      ...(name === "valid_from" || name === "valid_to"
        ? {
            valid_from: validateAddField("valid_from", next.valid_from, next),
            valid_to: validateAddField("valid_to", next.valid_to, next),
          }
        : {}),
    }));
  };

  const handleAddBlur = (e) => {
    const { name } = e.target;
    setFormErrors((prev) => ({
      ...prev,
      [name]: validateAddField(name, form[name], form),
      ...(name === "valid_from" || name === "valid_to"
        ? {
            valid_from: validateAddField("valid_from", form.valid_from, form),
            valid_to: validateAddField("valid_to", form.valid_to, form),
          }
        : {}),
    }));
  };

  // ===== Handlers: Edit form change/blur =====
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    const next = { ...editForm, [name]: value };
    setEditForm(next);
    setEditErrors((prev) => ({
      ...prev,
      [name]: validateEditField(name, value, next),
      ...(name === "valid_from" || name === "valid_to"
        ? {
            valid_from: validateEditField("valid_from", next.valid_from, next),
            valid_to: validateEditField("valid_to", next.valid_to, next),
          }
        : {}),
    }));
  };

  const handleEditBlur = (e) => {
    const { name } = e.target;
    setEditErrors((prev) => ({
      ...prev,
      [name]: validateEditField(name, editForm[name], editForm),
      ...(name === "valid_from" || name === "valid_to"
        ? {
            valid_from: validateEditField("valid_from", editForm.valid_from, editForm),
            valid_to: validateEditField("valid_to", editForm.valid_to, editForm),
          }
        : {}),
    }));
  };

  // ===== Add submit =====
  const handleAddPolicy = async () => {
    // Final validate all fields & show errors inline
    const newErrors = {
      dealer_id: validateAddField("dealer_id", form.dealer_id, form),
      discount_rate: validateAddField("discount_rate", form.discount_rate, form),
      valid_from: validateAddField("valid_from", form.valid_from, form),
      valid_to: validateAddField("valid_to", form.valid_to, form),
    };
    setFormErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      toast.error("Vui lòng sửa các lỗi trước khi thêm.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(
        "https://prn232.freeddns.org/financial-service/api/DealerDiscount",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "*/*" },
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
          discount_rate: parseFloat(form.discount_rate),
          valid_from: form.valid_from,
          valid_to: form.valid_to,
          status: "pending",
        };
        setDiscounts((prev) => [newItem, ...prev]);
        setForm({ dealer_id: "", discount_rate: "", valid_from: "", valid_to: "" });
        setFormErrors({ dealer_id: "", discount_rate: "", valid_from: "", valid_to: "" });
      } else {
        toast.error(json.message || "Thêm chính sách thất bại!");
      }
    } catch (err) {
      toast.error("Có lỗi khi thêm Discount Policy!");
    } finally {
      setSaving(false);
    }
  };

  // ===== Edit open/save =====
  const openEditModal = (item) => {
    setEditingItem(item);
    setEditForm({
      discount_rate: item.discount_rate,
      valid_from: item.valid_from,
      valid_to: item.valid_to,
    });
    setEditErrors({ discount_rate: "", valid_from: "", valid_to: "" });
  };

  const handleEditSave = async () => {
    const newErrors = {
      discount_rate: validateEditField("discount_rate", editForm.discount_rate, editForm),
      valid_from: validateEditField("valid_from", editForm.valid_from, editForm),
      valid_to: validateEditField("valid_to", editForm.valid_to, editForm),
    };
    setEditErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      toast.error("Vui lòng sửa các lỗi trước khi lưu.");
      return;
    }

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
              ? { ...d, ...editForm, discount_rate: parseFloat(editForm.discount_rate) }
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

  // ===== Activate/Delete =====
  const handleActivate = async (id) => {
    try {
      const res = await fetch(
        `https://prn232.freeddns.org/financial-service/api/DealerDiscount/${id}/activate`,
        { method: "PUT", headers: { Accept: "*/*" } }
      );
      if (res.ok) {
        toast.success("Kích hoạt thành công!");
        setDiscounts((prev) =>
          prev.map((d) => (d.dealer_discount_id === id ? { ...d, status: "active" } : d))
        );
      } else {
        toast.error("Kích hoạt thất bại!");
      }
    } catch (err) {
      toast.error("Lỗi khi kích hoạt!");
    }
  };

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

      <h2 className="text-2xl font-bold text-gray-900 mb-2">Discount Policy Management</h2>
      <p className="text-gray-600 mb-6">Configure and manage discount rates for individual dealers.</p>

      {/* === LIST TABLE === */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dealer Discount Policies</h3>
        {loading ? (
          <p className="text-gray-500 text-sm">Loading data...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Dealer Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Discount Rate (%)</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Validity Period</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {discounts.map((item) => (
                  <tr key={item.dealer_discount_id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.dealer?.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.discount_rate}%</td>
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

      {/* === ADD FORM === */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Discount Policy</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dealer Name</label>
            <select
              name="dealer_id"
              value={form.dealer_id}
              onChange={handleAddChange}
              onBlur={handleAddBlur}
              className={`w-full px-3 py-2 border rounded-md bg-white focus:ring-2 ${
                formErrors.dealer_id ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-indigo-500"
              }`}
            >
              <option value="">-- Select Dealer --</option>
              {dealers.map((d) => (
                <option key={d.dealer_id} value={d.dealer_id}>
                  {d.name} {d.region ? `(${d.region})` : ""}
                </option>
              ))}
            </select>
            {formErrors.dealer_id && (
              <p className="mt-1 text-xs text-red-600">{formErrors.dealer_id}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Rate (%)</label>
            <input
              name="discount_rate"
              type="number"
              min="0.01"
              step="0.01"
              value={form.discount_rate}
              onChange={handleAddChange}
              onBlur={handleAddBlur}
              className={`w-full px-3 py-2 border rounded-md ${
                formErrors.discount_rate ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-indigo-500"
              }`}
            />
            {formErrors.discount_rate && (
              <p className="mt-1 text-xs text-red-600">{formErrors.discount_rate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
            <input
              name="valid_from"
              type="date"
              value={form.valid_from}
              onChange={handleAddChange}
              onBlur={handleAddBlur}
              className={`w-full px-3 py-2 border rounded-md ${
                formErrors.valid_from ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-indigo-500"
              }`}
            />
            {formErrors.valid_from && (
              <p className="mt-1 text-xs text-red-600">{formErrors.valid_from}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valid To</label>
            <input
              name="valid_to"
              type="date"
              min={form.valid_from || ""}
              value={form.valid_to}
              onChange={handleAddChange}
              onBlur={handleAddBlur}
              className={`w-full px-3 py-2 border rounded-md ${
                formErrors.valid_to ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-indigo-500"
              }`}
            />
            {formErrors.valid_to && (
              <p className="mt-1 text-xs text-red-600">{formErrors.valid_to}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleAddPolicy}
            disabled={!addFormValid || saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Add Discount Policy"}
          </button>
        </div>
      </div>

      {/* === EDIT MODAL === */}
      {editingItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Discount Policy</h3>

            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Rate (%)</label>
            <input
              name="discount_rate"
              type="number"
              min="0.01"
              step="0.01"
              value={editForm.discount_rate}
              onChange={handleEditChange}
              onBlur={handleEditBlur}
              className={`w-full border rounded-md px-3 py-2 mb-1 ${
                editErrors.discount_rate ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-indigo-500"
              }`}
            />
            {editErrors.discount_rate && (
              <p className="mb-2 text-xs text-red-600">{editErrors.discount_rate}</p>
            )}

            <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
            <input
              name="valid_from"
              type="date"
              value={editForm.valid_from}
              onChange={handleEditChange}
              onBlur={handleEditBlur}
              className={`w-full border rounded-md px-3 py-2 mb-1 ${
                editErrors.valid_from ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-indigo-500"
              }`}
            />
            {editErrors.valid_from && (
              <p className="mb-2 text-xs text-red-600">{editErrors.valid_from}</p>
            )}

            <label className="block text-sm font-medium text-gray-700 mb-1">Valid To</label>
            <input
              name="valid_to"
              type="date"
              min={editForm.valid_from || ""}
              value={editForm.valid_to}
              onChange={handleEditChange}
              onBlur={handleEditBlur}
              className={`w-full border rounded-md px-3 py-2 mb-1 ${
                editErrors.valid_to ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-indigo-500"
              }`}
            />
            {editErrors.valid_to && (
              <p className="mb-2 text-xs text-red-600">{editErrors.valid_to}</p>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={handleEditSave}
                disabled={!editFormValid || saving}
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
