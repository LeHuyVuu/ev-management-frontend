// CustomerList.jsx
import React, { useState } from "react";
import AddCustomerModal from "./AddCustomerModal";

const initialCustomers = [
  { id: 1, name: "Nguyễn Văn A", phone: "0901234567", status: "Active" },
  { id: 2, name: "Trần Thị B", phone: "0912345678", status: "Lead" },
  { id: 3, name: "Phạm Văn C", phone: "0923456789", status: "Active" },
  { id: 4, name: "Lê Thị D", phone: "0934567890", status: "Inactive" },
  { id: 5, name: "Vũ Văn E", phone: "0945678901", status: "Active" },
  { id: 6, name: "Hoàng Thị G", phone: "0956789012", status: "Lead" },
];

const statusStyles = {
  Active: "bg-blue-500 text-white",
  Lead: "bg-gray-700 text-white",
  Inactive: "bg-gray-300 text-gray-800",
};

export default function CustomerList() {
  const [customers, setCustomers] = useState(initialCustomers);
  const [selectedId, setSelectedId] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddCustomer = (newCustomer) => {
    const nextId = customers.length ? Math.max(...customers.map((c) => c.id)) + 1 : 1;
    setCustomers([...customers, { id: nextId, ...newCustomer }]);
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white w-full max-w-sm">
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
            key={c.id}
            onClick={() => setSelectedId(c.id)}
            className={`grid grid-cols-3 items-center px-2 py-5 cursor-pointer ${
              selectedId === c.id ? "bg-blue-50" : "hover:bg-gray-50"
            }`}
          >
            <div className="text-sm font-medium text-gray-800">{c.name}</div>
            <div className="text-sm text-gray-700">{c.phone}</div>
            <div className="flex justify-start">
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${statusStyles[c.status]}`}
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
