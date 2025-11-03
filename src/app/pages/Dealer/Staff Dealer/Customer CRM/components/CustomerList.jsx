import React, { useState, useEffect } from "react";
import AddCustomerModal from "./AddCustomerModal";
import UpdateCustomerModal from "./UpdateCustomerModal";
import api from "../../../../../context/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// 🎨 Màu badge trạng thái
const statusStyles = {
  active:
    "bg-blue-500/90 text-white shadow-sm ring-1 ring-inset ring-blue-400/40",
  lead:
    "bg-gray-700/90 text-white shadow-sm ring-1 ring-inset ring-gray-600/50",
  inactive:
    "bg-gray-200 text-gray-800 ring-1 ring-inset ring-gray-300 shadow-sm",
};

export default function CustomerList({ onSelectCustomer }) {
  const [customers, setCustomers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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
        const updated =
          json.data && Object.keys(json.data).length > 0
            ? json.data
            : updatedCustomer;

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

  // ✅ Helper để lấy class badge an toàn
  const getStatusClass = (status) => {
    const key = (status || "").toLowerCase();
    return statusStyles[key] || "bg-gray-200 text-gray-800 ring-1 ring-gray-300";
  };

  // 🔍 Filter khách hàng theo tên, điện thoại, hoặc địa chỉ
  const filteredCustomers = customers.filter((c) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      (c.name || "").toLowerCase().includes(q) ||
      (c.phone || "").toLowerCase().includes(q) ||
      (c.address || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full max-w-sm">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Khách Hàng</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 active:scale-[0.99] transition"
          >
            + Thêm Mới
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-3">
          <input
            type="text"
            placeholder="Tìm kiếm khách hàng, số điện thoại, địa chỉ,..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 ring-0 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        {/* Header row (sticky) */}
        <div className="mt-3 px-4">
          <div className="grid grid-cols-3 text-xs font-medium text-gray-500 px-2 py-2 bg-gray-50 rounded-lg border border-gray-200 sticky top-0">
            <div>Tên</div>
            <div>Điện thoại</div>
            <div>Trạng thái</div>
          </div>
        </div>

        {/* List */}
        <div className="mt-2 max-h-96 overflow-y-auto px-3 pb-3">
          <div className="divide-y divide-gray-100 border-t border-gray-100">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((c) => {
                const isSelected = selectedId === c.customerId;
                return (
                  <div
                    key={c.customerId}
                    onClick={() => {
                      setSelectedId(c.customerId);
                      onSelectCustomer(c);
                    }}
                    className={[
                      "cursor-pointer rounded-xl px-3 py-3 transition",
                      isSelected
                        ? "bg-blue-50 ring-1 ring-blue-200"
                        : "hover:bg-gray-50",
                    ].join(" ")}
                  >
                    {/* Hàng đầu */}
                    <div className="grid grid-cols-3 items-center gap-2">
                      <div className="truncate text-sm font-semibold text-gray-900">
                        {c.name}
                      </div>
                      <div className="truncate text-sm text-gray-700">
                        {c.phone}
                      </div>
                      <div className="flex justify-start">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${getStatusClass(
                            c.status
                          )}`}
                        >
                          {c.status || "unknown"}
                        </span>
                      </div>
                    </div>

                    {/* Thông tin chi tiết */}
                    <div className="mt-2 text-xs text-gray-600 space-y-0.5">
                      <div className="truncate">🏠 {c.address || "Chưa có địa chỉ"}</div>
                      <div className="truncate">
                        👤 NV phụ trách: {c.staffContact || "Không có"}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-sm text-gray-500">
                ⚠️ Không tìm thấy khách hàng
              </div>
            )}
          </div>
        </div>
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
