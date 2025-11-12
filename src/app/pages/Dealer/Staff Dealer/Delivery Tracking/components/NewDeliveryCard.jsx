import React, { useState, useEffect } from "react";
import { X, Calendar, MapPin, User, Car } from "lucide-react";
import api from "../../../../../context/api";

const API_CUSTOMERS = `${api.customer}/api/customers`;
const API_CONTRACTS = `${api.customer}/customers`;
const API_ORDERS = `${api.customer}/api/customers/orders`;

function getTokenFromLocalStorage() {
  const keys = ["access_token", "token", "authToken", "jwt"];
  for (const k of keys) {
    const v = window.localStorage.getItem(k);
    if (v) return v;
  }
  return null;
}

export default function NewDeliveryCard({ isOpen, onClose, onSubmit }) {
  const [customers, setCustomers] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [errorCustomers, setErrorCustomers] = useState("");
  const [errorContracts, setErrorContracts] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    customerId: "",
    contractId: "",
    address: "",
    deliveryDate: "",
    signedDate: ""
  });

  // Load danh sách khách hàng khi modal mở
  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
    }
  }, [isOpen]);

  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      setErrorCustomers("");
      const token = getTokenFromLocalStorage();
      
      const res = await fetch(API_CUSTOMERS, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.status === 200 && json.data) {
        setCustomers(json.data);
      } else {
        setErrorCustomers("Không thể tải danh sách khách hàng");
      }
    } catch (err) {
      console.error("Error loading customers:", err);
      setErrorCustomers(err.message || "Lỗi khi tải khách hàng");
    } finally {
      setLoadingCustomers(false);
    }
  };

  const fetchContracts = async (customerId) => {
    if (!customerId) {
      setContracts([]);
      return;
    }
    
    try {
      setLoadingContracts(true);
      setErrorContracts("");
      const token = getTokenFromLocalStorage();
      
      const res = await fetch(`${API_CONTRACTS}/${customerId}/contracts`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.status === 200 && json.data) {
        setContracts(json.data);
      } else {
        setErrorContracts("Không có hợp đồng nào");
        setContracts([]);
      }
    } catch (err) {
      console.error("Error loading contracts:", err);
      setErrorContracts(err.message || "Lỗi khi tải hợp đồng");
      setContracts([]);
    } finally {
      setLoadingContracts(false);
    }
  };

  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    const selected = customers.find(c => c.customerId === customerId);
    
    if (selected) {
      setFormData(prev => ({
        ...prev,
        customerId: selected.customerId,
        address: selected.address || "",
        contractId: "",
      }));
      // Fetch contracts cho khách hàng này
      fetchContracts(customerId);
    } else {
      setFormData(prev => ({
        ...prev,
        customerId: "",
        address: "",
        contractId: "",
      }));
      setContracts([]);
    }
  };

  const handleContractChange = (e) => {
    const contractId = e.target.value;
    const selected = contracts.find(c => c.contractId === contractId);
    
    if (selected) {
      setFormData(prev => ({
        ...prev,
        contractId: selected.contractId,
        signedDate: selected.signedDate || "",
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        contractId: "",
        signedDate: "",
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.customerId || !formData.customerId.trim()) {
      setSuccessMessage("❌ Lỗi: Vui lòng chọn khách hàng");
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }

    if (!formData.contractId || !formData.contractId.trim()) {
      setSuccessMessage("❌ Lỗi: Vui lòng chọn hợp đồng");
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }

    if (!formData.address || !formData.address.trim()) {
      setSuccessMessage("❌ Lỗi: Vui lòng nhập địa chỉ giao hàng");
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }

    if (!formData.deliveryDate || !formData.deliveryDate.trim()) {
      setSuccessMessage("❌ Lỗi: Vui lòng chọn ngày giao hàng");
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }
    
    try {
      const token = getTokenFromLocalStorage();
      
      const payload = {
        customerId: formData.customerId.trim(),
        contractId: formData.contractId.trim(),
        deliveryAddress: formData.address.trim(),
        deliveryDate: formData.deliveryDate.trim()
      };

      console.log("📤 Sending order payload:", JSON.stringify(payload, null, 2));
      console.log("📍 API URL:", API_ORDERS);
      console.log("🔑 Token exists:", !!token);

      const res = await fetch(API_ORDERS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      console.log("📥 Server response status:", res.status);
      console.log("📥 Server response:", JSON.stringify(json, null, 2));

      if (!res.ok) {
        const errorMsg = json.message || json.errors?.join(", ") || `HTTP ${res.status}`;
        throw new Error(errorMsg);
      }

      // Show success message
      setSuccessMessage("✅ Tạo đơn giao hàng thành công!");
      setTimeout(() => setSuccessMessage(""), 3000);

      // Reset form
      setFormData({
        customerId: "",
        contractId: "",
        address: "",
        deliveryDate: "",
        signedDate: ""
      });

      if (onSubmit) {
        onSubmit(json.data || payload);
      }
      
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      console.error("❌ Error creating order:", err.message);
      setSuccessMessage(`❌ Lỗi: ${err.message || "Không thể tạo đơn giao hàng"}`);
      setTimeout(() => setSuccessMessage(""), 4000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Tạo Đơn Giao Hàng Mới</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Success/Error Message */}
        {successMessage && (
          <div className={`px-6 py-3 ${successMessage.includes("✅") ? "bg-green-50 text-green-800 border-b border-green-200" : "bg-red-50 text-red-800 border-b border-red-200"}`}>
            {successMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <User size={20} />
                Thông tin khách hàng
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên khách hàng *
                </label>
                {errorCustomers && (
                  <div className="text-red-600 text-sm mb-2">⚠️ {errorCustomers}</div>
                )}
                <select
                  value={formData.customerId}
                  onChange={handleCustomerChange}
                  disabled={loadingCustomers}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  style={{ maxHeight: "300px", overflowY: "auto" }}
                  required
                >
                  <option value="">
                    {loadingCustomers ? "Đang tải..." : "Chọn khách hàng"}
                  </option>
                  {customers.map((c) => (
                    <option key={c.customerId} value={c.customerId}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ giao hàng *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập địa chỉ đầy đủ"
                  required
                />
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <Car size={20} />
                Thông tin hợp đồng
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn hợp đồng *
                </label>
                {errorContracts && (
                  <div className="text-red-600 text-sm mb-2">⚠️ {errorContracts}</div>
                )}
                <select
                  value={formData.contractId}
                  onChange={handleContractChange}
                  disabled={loadingContracts || !formData.customerId}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  required
                >
                  <option value="">
                    {!formData.customerId ? "Chọn khách hàng trước" : loadingContracts ? "Đang tải..." : "Chọn hợp đồng"}
                  </option>
                  {contracts
                    .filter(c => c.status === "approved")
                    .map((c) => (
                    <option key={c.contractId} value={c.contractId}>
                      {c.brand} {c.vehicleName} {c.versionName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày ký hợp đồng
                </label>
                <input
                  type="text"
                  value={formData.signedDate}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-600"
                  placeholder="Sẽ tự động điền khi chọn hợp đồng"
                />
              </div>
            </div>
          </div>

          {/* Delivery Schedule */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-4">
              <Calendar size={20} />
              Ngày giao hàng
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày giao hàng *
              </label>
              <input
                type="date"
                name="deliveryDate"
                value={formData.deliveryDate}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tạo Đơn Giao Hàng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}