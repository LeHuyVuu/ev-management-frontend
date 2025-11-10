import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { createPromotion, updatePromotion } from "./PromotionService";
import { X } from "lucide-react";

const PROMOTION_TYPES = [
  "discount",
  "bonus",
  "special_rate",
  "gift",
  "bulk_discount",
];

const PROMOTION_STATUS = ["pending", "active", "expired", "deleted"];

const getErrorMessage = (err, fallback = "Lưu promotion thất bại") =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  err?.message ||
  fallback;

const trim = (v) => (typeof v === "string" ? v.trim() : v);

const PromotionModal = ({ open, item, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: "",
    type: "",
    start_date: "",
    end_date: "",
    status: "pending",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Prefill form
  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || "",
        type: item.type || "",
        start_date: item.start_date || "",
        end_date: item.end_date || "",
        status: item.status || "pending",
        description: item.description || "",
      });
    } else {
      setForm({
        name: "",
        type: "",
        start_date: "",
        end_date: "",
        status: "pending",
        description: "",
      });
    }
    setErrors({});
  }, [item]);

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  if (!open) return null;

  const validate = (data) => {
    const e = {};

    const name = trim(data.name);
    if (!name) e.name = "Tên không được để trống";
    else if (name.length < 3) e.name = "Tên phải từ 3 ký tự";
    else if (name.length > 100) e.name = "Tên tối đa 100 ký tự";

    if (!data.type) e.type = "Vui lòng chọn loại";
    else if (!PROMOTION_TYPES.includes(data.type))
      e.type = "Loại không hợp lệ";

    if (!data.start_date) e.start_date = "Vui lòng chọn ngày bắt đầu";
    if (!data.end_date) e.end_date = "Vui lòng chọn ngày kết thúc";

    if (data.start_date && data.end_date) {
      const s = new Date(data.start_date);
      const eDate = new Date(data.end_date);
      if (s > eDate) e.end_date = "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu";
    }

    if (!data.status) e.status = "Vui lòng chọn trạng thái";
    else if (!PROMOTION_STATUS.includes(data.status))
      e.status = "Trạng thái không hợp lệ";

    const desc = trim(data.description || "");
    if (desc.length > 300) e.description = "Mô tả tối đa 300 ký tự";

    return e;
  };

  const handleSubmit = async () => {
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.warn("Vui lòng kiểm tra lại các trường bị lỗi");
      return;
    }

    try {
      setSaving(true);
      let result;
      if (item) {
        result = await updatePromotion(item.promotion_id, {
          ...form,
          name: trim(form.name),
          description: trim(form.description),
        });
        onSave(result?.data || { ...item, ...form });
        toast.success("Cập nhật promotion thành công");
      } else {
        result = await createPromotion({
          ...form,
          name: trim(form.name),
          description: trim(form.description),
        });
        onSave(result?.data || { ...form, promotion_id: result?.data?.promotion_id });
        toast.success("Tạo promotion thành công");
      }
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key, value) => {
    const next = { ...form, [key]: value };
    setForm(next);
    // validate nhẹ theo field
    const fieldErrors = validate(next);
    setErrors(fieldErrors);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {item ? "Edit Promotion" : "Create Promotion"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:bg-gray-100 p-1 rounded"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* FORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Name</label>
            <input
              className={`border rounded-md px-3 py-2 w-full ${errors.name ? "border-red-500" : ""}`}
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Promotion name"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Type</label>
            <select
              className={`border rounded-md px-3 py-2 w-full ${errors.type ? "border-red-500" : ""}`}
              value={form.type}
              onChange={(e) => handleChange("type", e.target.value)}
            >
              <option value="">-- Select type --</option>
              {PROMOTION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type}</p>}
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Start date</label>
            <input
              type="date"
              className={`border rounded-md px-3 py-2 w-full ${errors.start_date ? "border-red-500" : ""}`}
              value={form.start_date}
              max="9999-12-31"
              onChange={(e) => handleChange("start_date", e.target.value)}
            />
            {errors.start_date && (
              <p className="mt-1 text-xs text-red-600">{errors.start_date}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">End date</label>
            <input
              type="date"
              className={`border rounded-md px-3 py-2 w-full ${errors.end_date ? "border-red-500" : ""}`}
              value={form.end_date}
              min={form.start_date || todayISO}
              max="9999-12-31"
              onChange={(e) => handleChange("end_date", e.target.value)}
            />
            {errors.end_date && <p className="mt-1 text-xs text-red-600">{errors.end_date}</p>}
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Status</label>
            <select
              className={`border rounded-md px-3 py-2 w-full ${errors.status ? "border-red-500" : ""}`}
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
            >
              {PROMOTION_STATUS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.status && <p className="mt-1 text-xs text-red-600">{errors.status}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-gray-600 mb-1 block">
              Description
            </label>
            <textarea
              rows={3}
              className={`border rounded-md px-3 py-2 w-full ${errors.description ? "border-red-500" : ""}`}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Short description"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">{errors.description}</p>
            )}
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromotionModal;
