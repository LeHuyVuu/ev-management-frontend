import React, { useState } from "react";

export default function AllocationRequest() {
    const [form, setForm] = useState({
        model: "",
        version: "",
        color: "",
        quantity: 1,
        desiredDate: "",
        destination: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleReset = () => {
        setForm({
            model: "",
            version: "",
            color: "",
            quantity: 1,
            desiredDate: "",
            destination: "",
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Yêu cầu phân bổ:", form);
        alert("Tạo yêu cầu thành công!");
    };

    return (
        <div>
            <div className="border rounded-lg p-6 bg-white shadow-sm">
                <h2 className="text-lg font-semibold mb-2">Tạo yêu cầu mới</h2>
                <p className="text-sm text-gray-500 mb-6">
                    Điền thông tin chi tiết cho yêu cầu phân bổ xe.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Mẫu xe */}
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Mẫu xe</label>
                            <select
                                name="model"
                                value={form.model}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            >
                                <option value="">Chọn mẫu xe</option>
                                <option value="Sedan">Sedan</option>
                                <option value="SUV">SUV</option>
                                <option value="Truck">Truck</option>
                            </select>
                        </div>

                        {/* Phiên bản */}
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Phiên bản</label>
                            <select
                                name="version"
                                value={form.version}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            >
                                <option value="">Chọn phiên bản</option>
                                <option value="Standard">Standard</option>
                                <option value="Premium">Premium</option>
                                <option value="Luxury">Luxury</option>
                            </select>
                        </div>

                        {/* Màu sắc */}
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Màu sắc</label>
                            <select
                                name="color"
                                value={form.color}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            >
                                <option value="">Chọn màu sắc</option>
                                <option value="Đỏ">Đỏ</option>
                                <option value="Trắng">Trắng</option>
                                <option value="Đen">Đen</option>
                                <option value="Xanh">Xanh</option>
                            </select>
                        </div>

                        {/* Số lượng */}
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Số lượng</label>
                            <input
                                type="number"
                                name="quantity"
                                value={form.quantity}
                                onChange={handleChange}
                                min="1"
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                        </div>

                        {/* Ngày mong muốn */}
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Ngày mong muốn</label>
                            <input
                                type="date"
                                name="desiredDate"
                                value={form.desiredDate}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                        </div>

                        {/* Địa điểm đến */}
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Địa điểm đến</label>
                            <select
                                name="destination"
                                value={form.destination}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            >
                                <option value="">Chọn địa điểm đến</option>
                                <option value="Hà Nội">Hà Nội</option>
                                <option value="TP.HCM">TP.HCM</option>
                                <option value="Đà Nẵng">Đà Nẵng</option>
                            </select>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100"
                        >
                            Đặt lại
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Tạo yêu cầu
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
