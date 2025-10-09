import React, { useState, useEffect } from "react";

export default function UpdateCustomerModal({ isOpen, onClose, onSave, customer }) {
  const [form, setForm] = useState({
    customerId: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    status: "active",
  });

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
    }
  }, [customer]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.phone) {
      alert("Vui lòng nhập tên và số điện thoại");
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md animate-fadeIn">
        <h2 className="text-lg font-semibold mb-4">Cập nhật khách hàng</h2>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Tên khách hàng</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Nhập tên khách hàng"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Email"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Số điện thoại</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Số điện thoại"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Địa chỉ</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Địa chỉ"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Trạng thái</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="active">active</option>
              <option value="lead">lead</option>
              <option value="inactive">inactive</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Cập nhật
          </button>
        </div>
      </div>
    </div>
  );
}
