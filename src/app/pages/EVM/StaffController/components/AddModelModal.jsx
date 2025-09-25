import React, { useState } from "react";

export default function AddModelModal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    version: "",
    color: "",
    stock: "",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, stock: Number(form.stock) });
    setForm({ name: "", version: "", color: "", stock: "" });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Add New EV Model</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Model Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mt-1 text-sm"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Version</label>
            <input
              type="text"
              name="version"
              value={form.version}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mt-1 text-sm"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Color</label>
            <input
              type="text"
              name="color"
              value={form.color}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mt-1 text-sm"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Stock</label>
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mt-1 text-sm"
              required
              min="0"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
