import React from "react";

const cars = [
    {
        id: 1,
        name: "Toyota Vios E CVT (2023)",
        price: 520000000,
        image: "https://live.staticflickr.com/65535/49932658111_30214a4229_b.jpg", // thay ảnh thật
        engine: "1.5L Xăng",
        fuel: "5.8L/100km",
        seats: "5 chỗ",
        hp: 107,
        tags: ["Ghế da", "Màn hình giải trí", "+1 phụ kiện"],
        badge: "Giảm thuế trước bạ",
    },
    {
        id: 2,
        name: "Hyundai Accent 1.4 AT Đặc biệt (2023)",
        price: 540000000,
        image: "https://th.bing.com/th/id/R.94d5393a29e122936349a70b4c8dbf68?rik=jo4%2fl0l7lBPKzw&pid=ImgRaw&r=0",
        engine: "1.4L Xăng",
        fuel: "6.2L/100km",
        seats: "5 chỗ",
        hp: 98,
        tags: ["Phim cách nhiệt", "Thảm sàn", "+1 phụ kiện"],
        badge: "Giảm giá 20 triệu",
    },
    {
        id: 3,
        name: "Kia K3 1.6 Luxury (2023)",
        price: 620000000,
        image: "https://img.freepik.com/premium-photo/black-car-with-headlights-headlights_1240491-775.jpg",
        engine: "1.6L Xăng",
        fuel: "6.8L/100km",
        seats: "5 chỗ",
        hp: 126,
        tags: ["Bọc ghế da", "Màn hình Android", "+1 phụ kiện"],
        badge: "Tặng gói phụ kiện",
    },
    // ... thêm các xe khác
];

function formatPrice(price) {
    return price.toLocaleString("vi-VN") + " ₫";
}

export default function CarList() {
    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">
                    Kết quả Tìm kiếm ({cars.length} xe)
                </h2>
                <select className="border rounded-md px-2 py-1 text-sm">
                    <option>Giá (Thấp đến Cao)</option>
                    <option>Giá (Cao đến Thấp)</option>
                    <option>Năm sản xuất</option>
                </select>
            </div>

            {/* Grid hiển thị xe */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cars.map((car) => (
                    <div
                        key={car.id}
                        className="border rounded-xl shadow-sm bg-white overflow-hidden flex flex-col"
                    >
                        {/* Badge ưu đãi */}
                        {car.badge && (
                            <div className="absolute bg-red-500 text-white text-xs px-2 py-1 rounded-br-lg">
                                {car.badge}
                            </div>
                        )}

                        {/* Hình ảnh */}
                        <img
                            src={car.image}
                            alt={car.name}
                            className="w-full h-40 object-cover"
                        />

                        {/* Nội dung */}
                        <div className="p-3 flex-1 flex flex-col">
                            <h3 className="font-medium text-sm mb-1">{car.name}</h3>
                            <p className="text-blue-600 font-bold text-lg mb-2">
                                {formatPrice(car.price)}
                            </p>

                            {/* Thông số */}
                            <div className="text-xs text-gray-600 mb-2 space-y-1">
                                <p>
                                    {car.engine} • {car.fuel}
                                </p>
                                <p>
                                    {car.seats} • HP: {car.hp}
                                </p>
                            </div>

                            {/* Tag phụ kiện */}
                            <div className="flex flex-wrap gap-1 mb-3">
                                {car.tags.map((tag, i) => (
                                    <span
                                        key={i}
                                        className="text-xs bg-gray-100 border rounded px-2 py-0.5"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Nút */}
                            <div className="flex justify-between mt-auto">
                                <label className="flex items-center space-x-1 text-sm">
                                    <input type="checkbox" className="rounded" />
                                    <span>So sánh</span>
                                </label>
                                <button className="text-sm text-blue-600 font-medium hover:underline">
                                    Xem chi tiết
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
