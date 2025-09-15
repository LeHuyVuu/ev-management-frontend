// DeliveryTracking.jsx
import React from "react";

const deliveries = [
  {
    id: "DH001",
    customer: "Nguyễn Văn A",
    car: "Toyota Camry 2.5Q (51G-123.45)",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    time: "2024-08-15 10:00",
    status: "Đã đến",
  },
  {
    id: "DH002",
    customer: "Trần Thị B",
    car: "Honda CRV L (30F-987.65)",
    address: "456 Phố XYZ, Quận Hoàn Kiếm, Hà Nội",
    time: "2024-08-16 14:30",
    status: "Đang chờ",
  },
  {
    id: "DH003",
    customer: "Lê Văn C",
    car: "Mazda CX-5 Premium (77C-001.12)",
    address: "789 Đại lộ QWE, Quận Hải Châu, Đà Nẵng",
    time: "2024-08-17 09:00",
    status: "Đang chuẩn bị",
  },
  {
    id: "DH004",
    customer: "Phạm Thị D",
    car: "VinFast Lux A2.0 (29A-555.55)",
    address: "101 Đường FGH, Quận 7, TP.HCM",
    time: "2024-08-18 11:00",
    status: "Đã hoàn thành",
  },
  {
    id: "DH005",
    customer: "Vũ Minh E",
    car: "Kia Seltos Premium (60A-789.01)",
    address: "202 Đường IJK, Biên Hòa, Đồng Nai",
    time: "2024-08-19 13:00",
    status: "Đang chờ",
  },
  {
    id: "DH006",
    customer: "Hoàng Gia F",
    car: "Hyundai Santa Fe (37A-456.78)",
    address: "303 Phố LMN, Vinh, Nghệ An",
    time: "2024-08-20 16:00",
    status: "Đang chờ",
  },
];

const statusStyles = {
  "Đã đến": { color: "bg-blue-500", progress: "w-3/4" },
  "Đang chờ": { color: "bg-gray-500", progress: "w-1/4" },
  "Đang chuẩn bị": { color: "bg-black", progress: "w-2/4" },
  "Đã hoàn thành": { color: "bg-green-500", progress: "w-full" },
};

export default function DeliveryTracking() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Theo dõi Giao hàng</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Thêm Giao hàng Mới
        </button>
      </div>

      <input
        type="text"
        placeholder="Tìm kiếm theo mã đơn hàng, khách hàng..."
        className="w-full border rounded-lg px-4 py-2 mb-6"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {deliveries.map((d) => {
          const { color, progress } = statusStyles[d.status] || {};
          return (
            <div
              key={d.id}
              className="border rounded-lg p-4 shadow-sm bg-white flex flex-col justify-between"
            >
              <div>
                <p className="text-sm text-gray-500">Mã đơn hàng: {d.id}</p>
                <h2 className="text-lg font-semibold">{d.customer}</h2>
                <p className="text-sm text-gray-700 mt-2">{d.car}</p>
                <p className="text-sm text-gray-700 mt-1">{d.address}</p>
                <p className="text-sm text-gray-700 mt-1">{d.time}</p>
              </div>

              <div className="mt-3">
                <div className="flex justify-between items-center mb-2">
                  <span
                    className={`text-white text-xs px-2 py-1 rounded ${color}`}
                  >
                    {d.status}
                  </span>
                  <button className="text-blue-600 hover:underline">
                    Chi tiết
                  </button>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${color} h-2 rounded-full ${progress}`}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
