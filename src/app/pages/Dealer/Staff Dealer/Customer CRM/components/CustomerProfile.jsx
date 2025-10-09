import React, { useEffect, useState } from "react";
import api from "../../../../../context/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CustomerProfile({ customer }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [contracts, setContracts] = useState([]);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (customer?.customerId) {
      setForm(customer);
      fetch(`${api.customer}/customers/${customer.customerId}/contracts`)
        .then((res) => res.json())
        .then((res) => {
          if (res.status === 200) {
            setContracts(res.data || []);
          } else {
            setContracts([]);
          }
        })
        .catch((err) => {
          console.error("Error loading contracts:", err);
          setContracts([]);
        });
    } else {
      setForm({});
      setContracts([]);
    }
  }, [customer]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    if (!form.customerId) return;
    try {
      setSaving(true);
      const res = await fetch(`${api.customer}/api/customers`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
        body: JSON.stringify({
          customerId: form.customerId,
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          status: form.status,
        }),
      });
      if (res.ok) {
        toast.success("Cập nhật khách hàng thành công");
      } else {
        toast.error("Cập nhật thất bại");
      }
    } catch (err) {
      console.error("Update failed", err);
      toast.error("Có lỗi xảy ra khi cập nhật");
    } finally {
      setSaving(false);
    }
  };

  if (!customer) return <div>Chọn khách hàng để xem thông tin</div>;

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white w-full max-w-6xl">
      <ToastContainer position="top-right" autoClose={3000} />

      <h1 className="text-xl font-semibold mb-4">
        {customer?.name || "Không rõ tên"}
      </h1>

      {/* Tabs */}
      <div className="bg-gray-100 rounded-lg p-2 mb-6">
        <div className="inline-flex rounded-md overflow-hidden">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === "profile"
                ? "bg-white shadow-sm text-gray-800"
                : "text-gray-500"
            }`}
          >
            Hồ sơ
          </button>
          <button
            onClick={() => setActiveTab("contracts")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === "contracts"
                ? "bg-white shadow-sm text-gray-800"
                : "text-gray-500"
            }`}
          >
            Hợp đồng khách hàng
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-600">Tên Khách hàng</label>
            <input
              type="text"
              value={form?.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              className="mt-2 block w-full border border-gray-200 rounded-md px-3 py-2 bg-white"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Điện thoại</label>
            <input
              type="text"
              value={form?.phone || ""}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="mt-2 block w-full border border-gray-200 rounded-md px-3 py-2 bg-white"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="text"
              value={form?.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              className="mt-2 block w-full border border-gray-200 rounded-md px-3 py-2 bg-white"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Địa chỉ</label>
            <input
              type="text"
              value={form?.address || ""}
              onChange={(e) => handleChange("address", e.target.value)}
              className="mt-2 block w-full border border-gray-200 rounded-md px-3 py-2 bg-white"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Trạng thái</label>
            <input
              type="text"
              value={form?.status || ""}
              onChange={(e) => handleChange("status", e.target.value)}
              className="mt-2 block w-full border border-gray-200 rounded-md px-3 py-2 bg-white text-gray-700"
            />
          </div>
          <div className="md:col-span-2 flex justify-end mt-4">
            {/* <button
              onClick={handleUpdate}
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : "Lưu thông tin"}
            </button> */}
          </div>
        </div>
      )}

      {activeTab === "contracts" && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Hợp đồng khách hàng</h2>
          {contracts.length === 0 ? (
            <p className="text-sm text-gray-500">Không có hợp đồng nào</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contracts.map((c) => (
                <div
                  key={c.contractId}
                  className="border rounded-lg p-4 shadow-sm hover:shadow-md transition bg-white"
                >
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Mã hợp đồng: {c.contractId || ""}
                  </h3>
                  <p className="text-sm">Trạng thái: {c.status || ""}</p>
                  <p className="text-sm">
                    Tạo: {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""}
                  </p>
                  <p className="text-sm">
                    Cập nhật: {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}