import React, { useState } from "react";
import { X, Calendar, MapPin, User, Car } from "lucide-react";

export default function NewDeliveryCard({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    customer: "",
    car: "",
    licensePlate: "",
    address: "",
    deliveryTime: "",
    deliveryDate: "",
    notes: "",
    priority: "Bình thường"
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Generate new delivery ID
    const newDelivery = {
      id: `DH${String(Date.now()).slice(-3)}`,
      customer: formData.customer,
      car: `${formData.car} (${formData.licensePlate})`,
      address: formData.address,
      time: `${formData.deliveryDate} ${formData.deliveryTime}`,
      status: "Đang chuẩn bị",
      priority: formData.priority,
      notes: formData.notes
    };

    onSubmit(newDelivery);
    
    // Reset form
    setFormData({
      customer: "",
      car: "",
      licensePlate: "",
      address: "",
      deliveryTime: "",
      deliveryDate: "",
      notes: "",
      priority: "Bình thường"
    });
    
    onClose();
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
                <input
                  type="text"
                  name="customer"
                  value={formData.customer}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên khách hàng"
                  required
                />
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
                Thông tin xe
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mẫu xe *
                </label>
                <select
                  name="car"
                  value={formData.car}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Chọn mẫu xe</option>
                  <option value="Toyota Camry 2.5Q">Toyota Camry 2.5Q</option>
                  <option value="Honda CRV L">Honda CRV L</option>
                  <option value="Mazda CX-5 Premium">Mazda CX-5 Premium</option>
                  <option value="VinFast Lux A2.0">VinFast Lux A2.0</option>
                  <option value="Kia Seltos Premium">Kia Seltos Premium</option>
                  <option value="Hyundai Santa Fe">Hyundai Santa Fe</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Biển số xe *
                </label>
                <input
                  type="text"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: 51G-123.45"
                  required
                />
              </div>
            </div>
          </div>

          {/* Delivery Schedule */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-4">
              <Calendar size={20} />
              Lịch giao hàng
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giờ giao hàng *
                </label>
                <input
                  type="time"
                  name="deliveryTime"
                  value={formData.deliveryTime}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Priority and Notes */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mức độ ưu tiên
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Cao">Cao</option>
                <option value="Bình thường">Bình thường</option>
                <option value="Thấp">Thấp</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="2"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ghi chú thêm (tùy chọn)"
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