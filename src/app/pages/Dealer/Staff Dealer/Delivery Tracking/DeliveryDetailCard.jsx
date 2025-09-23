import React, { useState } from "react";
import { X, MapPin, Clock, User, Car, Phone, Edit, CheckCircle, XCircle, Truck } from "lucide-react";

export default function DeliveryDetailCard({ delivery, isOpen, onClose, onUpdateStatus }) {
  const [editMode, setEditMode] = useState(false);
  const [newStatus, setNewStatus] = useState(delivery?.status || "");

  if (!isOpen || !delivery) return null;

  const statusOptions = [
    "Đang chuẩn bị",
    "Đã xuất kho", 
    "Đang vận chuyển",
    "Đã đến",
    "Đang giao hàng",
    "Đã hoàn thành",
    "Giao hàng thất bại",
    "Đang chờ"
  ];

  const statusColors = {
    "Đang chuẩn bị": "bg-yellow-500",
    "Đã xuất kho": "bg-orange-500",
    "Đang vận chuyển": "bg-blue-500",
    "Đã đến": "bg-purple-500",
    "Đang giao hàng": "bg-indigo-500",
    "Đã hoàn thành": "bg-green-500",
    "Giao hàng thất bại": "bg-red-500",
    "Đang chờ": "bg-gray-500"
  };

  // Mock tracking history data
  const trackingHistory = [
    {
      status: "Đơn hàng được tạo",
      time: "2024-08-14 09:00",
      description: "Đơn giao hàng được khởi tạo trong hệ thống"
    },
    {
      status: "Đang chuẩn bị",
      time: "2024-08-14 10:30",
      description: "Xe đang được chuẩn bị và kiểm tra trước giao"
    },
    {
      status: "Đã xuất kho",
      time: "2024-08-15 08:00",
      description: "Xe đã được xuất khỏi kho và sẵn sàng vận chuyển"
    },
    {
      status: "Đang vận chuyển",
      time: "2024-08-15 09:30",
      description: "Xe đang trên đường vận chuyển đến địa chỉ khách hàng"
    }
  ];

  const handleStatusUpdate = () => {
    if (onUpdateStatus) {
      onUpdateStatus(delivery.id, newStatus);
    }
    setEditMode(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Chi tiết đơn giao hàng</h2>
            <p className="text-gray-600">Mã đơn hàng: {delivery.id}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer & Vehicle Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-3">
                    <User size={20} />
                    Thông tin khách hàng
                  </h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Tên:</span> {delivery.customer}</p>
                    <p><span className="font-medium">Điện thoại:</span> +84 123 456 789</p>
                    <p><span className="font-medium">Email:</span> customer@email.com</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-3">
                    <Car size={20} />
                    Thông tin xe
                  </h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Xe:</span> {delivery.car}</p>
                    <p><span className="font-medium">Màu:</span> Trắng ngọc trai</p>
                    <p><span className="font-medium">VIN:</span> JTDKARFP8J0123456</p>
                  </div>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-3">
                  <MapPin size={20} />
                  Chi tiết giao hàng
                </h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Địa chỉ:</span> {delivery.address}</p>
                  <p><span className="font-medium">Thời gian:</span> {delivery.time}</p>
                  <p><span className="font-medium">Ghi chú:</span> Giao hàng trong giờ hành chính</p>
                </div>
              </div>

              {/* Tracking History */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-4">
                  <Truck size={20} />
                  Lịch sử theo dõi
                </h3>
                <div className="space-y-3">
                  {trackingHistory.map((track, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5"></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-gray-900">{track.status}</h4>
                          <span className="text-sm text-gray-500">{track.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{track.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar - Status & Actions */}
            <div className="space-y-6">
              {/* Current Status */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Trạng thái hiện tại</h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-white text-sm ${statusColors[delivery.status]}`}>
                    {delivery.status}
                  </span>
                </div>
                
                {editMode ? (
                  <div className="space-y-3">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={handleStatusUpdate}
                        className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle size={16} className="inline mr-1" />
                        Lưu
                      </button>
                      <button
                        onClick={() => setEditMode(false)}
                        className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <XCircle size={16} className="inline mr-1" />
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditMode(true);
                      setNewStatus(delivery.status);
                    }}
                    className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit size={16} className="inline mr-2" />
                    Cập nhật trạng thái
                  </button>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Hành động</h3>
                <div className="space-y-2">
                  <button className="w-full bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                    <Phone size={16} className="inline mr-2" />
                    Gọi khách hàng
                  </button>
                  <button className="w-full bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm">
                    <MapPin size={16} className="inline mr-2" />
                    Xem bản đồ
                  </button>
                  <button className="w-full bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm">
                    <Truck size={16} className="inline mr-2" />
                    Theo dõi GPS
                  </button>
                  <button className="w-full border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    <Edit size={16} className="inline mr-2" />
                    Chỉnh sửa thông tin
                  </button>
                </div>
              </div>

              {/* Driver Info */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Tài xế phụ trách</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Tên:</span> Nguyễn Văn Tài</p>
                  <p><span className="font-medium">SĐT:</span> +84 987 654 321</p>
                  <p><span className="font-medium">Xe tải:</span> 51B-12345</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Đóng
          </button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            In báo cáo
          </button>
        </div>
      </div>
    </div>
  );
}