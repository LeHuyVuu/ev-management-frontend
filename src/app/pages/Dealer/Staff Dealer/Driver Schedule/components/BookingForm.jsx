import { useState } from 'react';

export default function BookingForm() {
    const [formData, setFormData] = useState({
        customerName: '',
        selectedCar: '',
        selectedStaff: '',
        testDate: '',
        testTime: '',
        smsConfirm: true,
        emailConfirm: true
    });

    // Mock data
    const cars = [
        { id: 'vinfast-vf8', name: 'VinFast VF 8' },
        { id: 'vinfast-vf9', name: 'VinFast VF 9' },
        { id: 'vinfast-vf5', name: 'VinFast VF 5' },
        { id: 'vinfast-vfe34', name: 'VinFast VF e34' }
    ];

    const staff = [
        { id: 'nguyen-van-b', name: 'Nguyễn Văn B' },
        { id: 'tran-thi-c', name: 'Trần Thị C' },
        { id: 'le-van-d', name: 'Lê Văn D' },
        { id: 'pham-thi-e', name: 'Phạm Thị E' }
    ];

    const timeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = () => {
        console.log('Booking submitted:', formData);
        alert('Đặt lịch thành công!');
    };

    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Đặt lịch lái thử mới</h2>

            <div className="space-y-4">
                {/* Customer Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên khách hàng
                    </label>
                    <input
                        type="text"
                        placeholder="Nguyễn Văn A"
                        value={formData.customerName}
                        onChange={(e) => handleInputChange('customerName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Car Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chọn xe
                    </label>
                    <select
                        value={formData.selectedCar}
                        onChange={(e) => handleInputChange('selectedCar', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    >
                        <option value="">Chọn mẫu xe</option>
                        {cars.map(car => (
                            <option key={car.id} value={car.id}>{car.name}</option>
                        ))}
                    </select>
                </div>

                {/* Staff Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chọn nhân viên
                    </label>
                    <select
                        value={formData.selectedStaff}
                        onChange={(e) => handleInputChange('selectedStaff', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    >
                        <option value="">Chọn nhân viên</option>
                        {staff.map(person => (
                            <option key={person.id} value={person.id}>{person.name}</option>
                        ))}
                    </select>
                </div>

                {/* Test Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày lái thử
                    </label>
                    <div className="relative">
                        <input
                            type="date"
                            placeholder="Chọn ngày"
                            value={formData.testDate}
                            onChange={(e) => handleInputChange('testDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Test Time */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thời gian lái thử
                    </label>
                    <select
                        value={formData.testTime}
                        onChange={(e) => handleInputChange('testTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    >
                        <option value="">Chọn thời gian</option>
                        {timeSlots.map(time => (
                            <option key={time} value={time}>{time}</option>
                        ))}
                    </select>
                </div>

                {/* Confirmation Options */}
                <div className="space-y-3">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="sms-confirm"
                            checked={formData.smsConfirm}
                            onChange={(e) => handleInputChange('smsConfirm', e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <label htmlFor="sms-confirm" className="ml-2 text-sm text-gray-700">
                            Gửi xác nhận SMS
                        </label>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="email-confirm"
                            checked={formData.emailConfirm}
                            onChange={(e) => handleInputChange('emailConfirm', e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <label htmlFor="email-confirm" className="ml-2 text-sm text-gray-700">
                            Gửi xác nhận Email
                        </label>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Đặt lịch ngay
                </button>
            </div>
        </div>
    );
}