import React, { useState, useEffect } from "react";
import AddCustomerModal from "./AddCustomerModal";
import api from "../../../../../context/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const statusStyles = {
  active: "bg-blue-500 text-white",
  lead: "bg-gray-700 text-white",
  inactive: "bg-gray-300 text-gray-800",
};

export default function CustomerList({ onSelectCustomer }) {
  const [customers, setCustomers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${api.customer}/api/customers`);
      const json = await res.json();
      if (json.status === 200) {
        setCustomers(json.data);
        if (json.data.length > 0) {
          setSelectedId(json.data[0].customerId);
          onSelectCustomer(json.data[0]);
        }
      }
    } catch (err) {
      console.error("Error loading customers:", err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddCustomer = async (newCustomer) => {
    try {
      const res = await fetch(`${api.customer}/api/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
        body: JSON.stringify(newCustomer),
      });
      if (res.ok) {
        const created = await res.json();
        setCustomers((prev) => [created, ...prev]);
        setSelectedId(created.customerId);
        onSelectCustomer(created);
        toast.success("Đã thêm khách hàng mới");
        setIsModalOpen(false);
      } else {
        toast.error("Thêm khách hàng thất bại");
      }
    } catch (err) {
      console.error("Add customer error:", err);
      toast.error("Có lỗi khi thêm khách hàng");
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white w-full max-w-sm">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Khách Hàng</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-blue-700"
        >
          + Thêm Mới
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Tìm kiếm khách hàng..."
        className="w-full border rounded-lg px-3 py-2 mb-3 text-sm"
      />

      {/* Header row */}
      <div className="grid grid-cols-3 text-sm text-gray-500 mb-2 px-2">
        <div>Tên</div>
        <div>Điện thoại</div>
        <div>Trạng thái</div>
      </div>

      {/* Customer rows */}
      <div className="divide-y border-t">
        {customers.map((c) => (
          <div
            key={c.customerId}
            onClick={() => {
              setSelectedId(c.customerId);
              onSelectCustomer(c);
            }}
            className={`grid grid-cols-3 items-center px-2 py-5 cursor-pointer ${
              selectedId === c.customerId ? "bg-blue-50" : "hover:bg-gray-50"
            }`}
          >
            <div className="text-sm font-medium text-gray-800">{c.name}</div>
            <div className="text-sm text-gray-700">{c.phone}</div>
            <div className="flex justify-start">
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${statusStyles[c.status?.toLowerCase()]}`}
              >
                {c.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal thêm khách hàng */}
      <AddCustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddCustomer}
      />
    </div>
  );
}
