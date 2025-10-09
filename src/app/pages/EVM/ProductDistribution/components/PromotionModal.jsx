import React, { useEffect, useState } from "react";
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
  }, [item]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!form.name || !form.type || !form.start_date || !form.end_date) {
      toast.warn("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }
    try {
      setSaving(true);
      let result;
      if (item) {
        result = await updatePromotion(item.promotion_id, form);
        onSave(result.data || { ...item, ...form });
      } else {
        result = await createPromotion(form);
        onSave(result.data || form);
      }
      toast.success(item ? "Cập nhật promotion thành công" : "Tạo promotion thành công");
      onClose();
    } catch {
      toast.error("Lưu promotion thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
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
          >
            <X size={18} />
          </button>
        </div>

        {/* FORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Name</label>
            <input
              className="border rounded-md px-3 py-2 w-full"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Promotion name"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Type</label>
            <select
              className="border rounded-md px-3 py-2 w-full"
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
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Start date</label>
            <input
              type="date"
              className="border rounded-md px-3 py-2 w-full"
              value={form.start_date}
              onChange={(e) => handleChange("start_date", e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">End date</label>
            <input
              type="date"
              className="border rounded-md px-3 py-2 w-full"
              value={form.end_date}
              onChange={(e) => handleChange("end_date", e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Status</label>
            <select
              className="border rounded-md px-3 py-2 w-full"
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
            >
              {PROMOTION_STATUS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-gray-600 mb-1 block">
              Description
            </label>
            <textarea
              rows={3}
              className="border rounded-md px-3 py-2 w-full"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Short description"
            />
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
