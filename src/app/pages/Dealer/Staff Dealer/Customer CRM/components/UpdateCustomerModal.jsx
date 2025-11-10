import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

// Simple but strict-ish email check
function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  const s = email.trim();
  if (!s.includes("@") || !s.includes(".")) return false;
  const [local, domain] = s.split("@");
  if (!local || !domain) return false;
  if (domain.split(".").some((p) => p.length === 0)) return false;
  const tld = domain.split(".").pop();
  if (!/^[A-Za-z]{2,}$/.test(tld)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export default function UpdateCustomerModal({ isOpen, onClose, onSave, customer }) {
  const [form, setForm] = useState({
    customerId: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    status: "active",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (customer) {
      setForm({
        customerId: customer.customerId,
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
        status: customer.status || "active",
      });
      setErrors({});
    }
  }, [customer]);

  if (!isOpen) return null;

  const validateField = (field, val) => {
    const v = (val || "").toString();
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

  const handleSubmit = async () => {
    const e = {};
    ["name", "phone", "email", "address", "status"].forEach((f) => {
      const err = validateField(f, form[f]);
      if (err) e[f] = err;
    });
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    // token check before saving (parent may also check)
    const token = localStorage.getItem("token");
    if (!token) {
      const msg = "Không tìm thấy token. Vui lòng đăng nhập lại.";
      setErrors((prev) => ({ ...prev, _global: msg }));
      toast.error(msg);
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = onSave && onSave({ ...form });
      if (res && typeof res.then === "function") await res;
    } catch (err) {
      console.error(err);
      toast.error("Lưu khách hàng thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md animate-fadeIn">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold">Cập nhật khách hàng</h2>
          <button onClick={onClose} aria-label="Đóng" className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {errors._global && <div className="mt-3 p-2 bg-red-50 text-red-700 rounded text-sm">{errors._global}</div>}

        <div className="mt-4 grid grid-cols-1 gap-3">
          <div>
            <label className="text-sm font-medium">Tên khách hàng</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              onBlur={() => setErrors((p) => ({ ...p, name: validateField('name', form.name) }))}
              className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Nhập tên khách hàng"
              autoComplete="name"
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              onBlur={() => setErrors((p) => ({ ...p, email: validateField('email', form.email) }))}
              className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition ${errors.email ? 'border-red-500' : ''}`}
              placeholder="Email"
              autoComplete="email"
            />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Số điện thoại</label>
            <input
              name="phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={form.phone}
              onChange={handleChange}
              onBlur={() => setErrors((p) => ({ ...p, phone: validateField('phone', form.phone) }))}
              className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition ${errors.phone ? 'border-red-500' : ''}`}
              placeholder="Số điện thoại"
              autoComplete="tel"
            />
            {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Địa chỉ</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              onBlur={() => setErrors((p) => ({ ...p, address: validateField('address', form.address) }))}
              className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition ${errors.address ? 'border-red-500' : ''}`}
              placeholder="Địa chỉ"
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
              className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition ${errors.status ? 'border-red-500' : ''}`}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {errors.status && <p className="text-sm text-red-600 mt-1">{errors.status}</p>}
          </div>
        </div>

        <div className="mt-5 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded bg-gray-100 hover:bg-gray-200"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Đang lưu...' : 'Cập nhật'}
          </button>
        </div>
      </div>
    </div>
  );
}
