import React, { useState } from "react";
import { toast } from "react-toastify";

function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  const s = email.trim();
  if (!s.includes("@") || !s.includes(".")) return false;
  const parts = s.split("@");
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || !domain) return false;
  if (domain.split(".").some((p) => p.length === 0)) return false;
  const tld = domain.split(".").pop();
  if (!/^[A-Za-z]{2,}$/.test(tld)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export default function AddCustomerModal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    status: "active",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validateField = (field, value) => {
    const v = (value || "").toString();
    switch (field) {
      case "name":
        return v.trim() ? undefined : "Vui lòng nhập tên khách hàng.";
      case "phone": {
        const digits = v.replace(/\D/g, "");
        if (!digits) return "Vui lòng nhập số điện thoại.";
        if (digits.length !== 10) return "Số điện thoại phải đúng 10 chữ số.";
        return undefined;
      }
      case "email": {
        const t = v.trim();
        if (!t) return "Vui lòng nhập email.";
        return isValidEmail(t) ? undefined : "Địa chỉ email không hợp lệ.";
      }
      case "address":
        return v.trim() ? undefined : "Vui lòng nhập địa chỉ.";
      case "status":
        return ["active", "inactive"].includes(v) ? undefined : "Trạng thái không hợp lệ.";
      default:
        return undefined;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === "phone" ? (value || "").toString().replace(/\D/g, "").slice(0, 10) : value;
    setForm((p) => ({ ...p, [name]: newValue }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, newValue) }));
  };

  const isFormValid = () => {
    return ["name", "phone", "email", "address", "status"].every((f) => !validateField(f, form[f]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eObj = {};
    ["name", "phone", "email", "address", "status"].forEach((f) => {
      const err = validateField(f, form[f]);
      if (err) eObj[f] = err;
    });
    if (Object.keys(eObj).length > 0) {
      setErrors(eObj);
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // optional: parent handles token; we just validate here
      const res = onSave && onSave({ ...form });
      if (res && typeof res.then === "function") await res;
      // reset on successful save
      setForm({ name: "", phone: "", email: "", address: "", status: "active" });
      onClose();
    } catch (err) {
      console.error("Add customer failed", err);
      toast.error("Thêm khách hàng thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4">Thêm Khách Hàng</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm font-medium">Tên</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              onBlur={() => setErrors((p) => ({ ...p, name: validateField('name', form.name) }))}
              className={`w-full border rounded px-3 py-2 mt-1 text-sm ${errors.name ? 'border-red-500' : ''}`}
              autoComplete="name"
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Điện thoại</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              inputMode="numeric"
              pattern="[0-9]*"
              onChange={handleChange}
              onBlur={() => setErrors((p) => ({ ...p, phone: validateField('phone', form.phone) }))}
              className={`w-full border rounded px-3 py-2 mt-1 text-sm ${errors.phone ? 'border-red-500' : ''}`}
              autoComplete="tel"
              maxLength={10}
            />
            {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              onBlur={() => setErrors((p) => ({ ...p, email: validateField('email', form.email) }))}
              className={`w-full border rounded px-3 py-2 mt-1 text-sm ${errors.email ? 'border-red-500' : ''}`}
              autoComplete="email"
            />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Địa chỉ</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              onBlur={() => setErrors((p) => ({ ...p, address: validateField('address', form.address) }))}
              className={`w-full border rounded px-3 py-2 mt-1 text-sm ${errors.address ? 'border-red-500' : ''}`}
              autoComplete="street-address"
            />
            {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Trạng thái</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              onBlur={() => setErrors((p) => ({ ...p, status: validateField('status', form.status) }))}
              className={`w-full border rounded px-3 py-2 mt-1 text-sm ${errors.status ? 'border-red-500' : ''}`}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {errors.status && <p className="text-sm text-red-600 mt-1">{errors.status}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded hover:bg-gray-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className={`px-4 py-2 text-sm bg-blue-600 text-white rounded ${(!isFormValid() || isSubmitting) ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
