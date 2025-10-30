import React, { useState, useEffect } from "react";
import AddCustomerModal from "./AddCustomerModal";
import UpdateCustomerModal from "./UpdateCustomerModal";
import api from "../../../../../context/api";
import { getMockCustomers } from "../../../../../context/mock/customers.mock";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pencil } from "lucide-react"; // ✏️ icon Lucide

const statusStyles = {
  active: "bg-blue-500 text-white",
  lead: "bg-gray-700 text-white",
  inactive: "bg-gray-300 text-gray-800",
};

export default function CustomerList({ onSelectCustomer }) {
  const [customers, setCustomers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${api.customer}/api/customers`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const json = await res.json();
      if (json.status === 200 && json.data && json.data.length > 0) {
        setCustomers(json.data);
        if (json.data.length > 0) {
          setSelectedId(json.data[0].customerId);
          onSelectCustomer(json.data[0]);
        }
      } else {
        throw new Error("Không có dữ liệu từ API");
      }
    } catch (err) {
      console.warn("API failed, using mock data:", err.message);
      // Fallback to mock data
      try {
        const mockCustomers = getMockCustomers();
        const mappedCustomers = mockCustomers.map(c => ({
          customerId: c.id,
          name: c.name,
          phone: c.phone,
          address: c.address,
          email: c.email,
          status: "active",
          staffContact: "Staff",
        }));
        setCustomers(mappedCustomers);
        if (mappedCustomers.length > 0) {
          setSelectedId(mappedCustomers[0].customerId);
          onSelectCustomer(mappedCustomers[0]);
        }
      } catch (mockErr) {
        console.error("Error loading mock customers:", mockErr);
      }
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddCustomer = async (newCustomer) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${api.customer}/api/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(newCustomer),
      });

      const json = await res.json();

      if (res.ok && json.status === 200) {
        const created = json.data || json;
        setCustomers((prev) => [created, ...prev]);
        setSelectedId(created.customerId);
        onSelectCustomer(created);
        toast.success("Đã thêm khách hàng mới");
        setIsModalOpen(false);
      } else {
        toast.error(json.message || "Thêm khách hàng thất bại");
      }
    } catch (err) {
      console.error("Add customer error:", err);
      toast.error("Có lỗi khi thêm khách hàng");
    }
  };

  const handleUpdateCustomer = async (updatedCustomer) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${api.customer}/api/customers`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(updatedCustomer),
      });

      const json = await res.json();

      if (res.ok && json.status === 200) {
        // ✅ Nếu API không trả về data, dùng chính object đã cập nhật
        const updated =
          json.data && Object.keys(json.data).length > 0
            ? json.data
            : updatedCustomer;

        // ✅ Cập nhật danh sách ngay lập tức
        setCustomers((prev) =>
          prev.map((c) =>
            c.customerId === updated.customerId ? { ...c, ...updated } : c
          )
        );

        if (selectedId === updated.customerId) {
          onSelectCustomer(updated);
        }

        toast.success("Cập nhật khách hàng thành công");
        setIsUpdateModalOpen(false);
      } else {
        toast.error(json.message || "Cập nhật khách hàng thất bại");
      }
    } catch (err) {
      console.error("Update customer error:", err);
      toast.error("Có lỗi khi cập nhật khách hàng");
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
            className={`px-2 py-4 cursor-pointer transition ${
              selectedId === c.customerId ? "bg-blue-50" : "hover:bg-gray-50"
            }`}
          >
            {/* Hàng đầu */}
            <div className="grid grid-cols-3 items-center">
              <div className="text-sm font-medium text-gray-800">{c.name}</div>
              <div className="text-sm text-gray-700">{c.phone}</div>
              <div className="flex justify-start">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    statusStyles[c.status?.toLowerCase()]
                  }`}
                >
                  {c.status}
                </span>
              </div>
            </div>

            {/* Thông tin chi tiết */}
            <div className="mt-1 text-xs text-gray-600">
              <div>🏠 {c.address || "Chưa có địa chỉ"}</div>
              <div>👤 NV phụ trách: {c.staffContact || "Không có"}</div>
            </div>

            {/* Nút cập nhật */}
            <div className="mt-2 flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCustomerToEdit(c);
                  setIsUpdateModalOpen(true);
                }}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition"
              >
                <Pencil size={14} />
                <span>Cập nhật</span>
              </button>
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

      {/* Modal cập nhật khách hàng */}
      <UpdateCustomerModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onSave={handleUpdateCustomer}
        customer={customerToEdit}
      />
    </div>
  );
}
