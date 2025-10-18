import { useState, useEffect } from 'react';
import Select from 'react-select';

export default function BookingForm({ selectedDate }) {
  const token = localStorage.getItem('token');

const [formData, setFormData] = useState({
    customerId: '',
    selectedCar: '',
    selectedStaff: '',
    testDate: '',
    testTime: '',
    smsConfirm: true,
    emailConfirm: true,
});

const [customers, setCustomers] = useState([]);
const [vehicles, setVehicles] = useState([]);
const [staff, setStaff] = useState([]);

const timeSlots = [
    '09:00', '10:00', '11:00',
    '14:00', '15:00', '16:00'
];

// Fetch customers
useEffect(() => {
    fetch('https://prn232.freeddns.org/customer-service/api/customers', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
        .then((res) => res.json())
        .then((data) => {
        if (data.status === 200) {
          const options = data.data.map((c) => ({
            value: c.customerId,
            label: c.name,
          }));
          setCustomers(options);
        }
      })
      .catch((err) => console.error('Lỗi khi fetch customer:', err));
  }, []);

  // Fetch vehicles
  useEffect(() => {
    fetch('https://prn232.freeddns.org/brand-service/api/vehicle-versions/dealer?pageNumber=1&pageSize=100', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 200) {
          const options = data.data.items.map((v) => ({
            value: v.vehicleVersionId,
            label: `${v.brand} ${v.modelName} ${v.versionName}`,
          }));
          setVehicles(options);
        }
      })
      .catch((err) => console.error('Lỗi khi fetch vehicle:', err));
  }, []);

  // Fetch staff
  useEffect(() => {
    fetch('https://prn232.freeddns.org/dealer-service/users/dealer-staffs', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 200) {
          const mapped = data.data.map((s) => ({
            id: s.userId,
            name: s.name,
          }));
          setStaff(mapped);
        }
      })
      .catch((err) => console.error('Lỗi khi fetch staff:', err));
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.customerId || !formData.selectedCar || !formData.testDate || !formData.testTime) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    console.log("Booking data:", formData);
    alert("Đặt lịch thành công!");
    // TODO: Gửi API đặt lịch thực tế
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">
        Đặt lịch lái thử mới
      </h2>

      <div className="space-y-4">
        {/* Customer dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Khách hàng</label>
          <Select
            options={customers}
            onChange={(option) => handleInputChange('customerId', option.value)}
            placeholder="Tìm tên khách hàng..."
            isSearchable
            noOptionsMessage={() => 'Không tìm thấy khách hàng'}
          />
        </div>

        {/* Vehicle dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Chọn xe</label>
          <select
            value={formData.selectedCar}
            onChange={(e) => handleInputChange('selectedCar', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Chọn mẫu xe</option>
            {vehicles.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        {/* Staff dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nhân viên phụ trách</label>
          <select
            value={formData.selectedStaff}
            onChange={(e) => handleInputChange('selectedStaff', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Chọn nhân viên</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ngày lái thử</label>
          <input
            type="date"
            value={selectedDate ? selectedDate.format('YYYY-MM-DD') : formData.testDate}
            onChange={(e) => handleInputChange('testDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Time input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian lái thử</label>
          <select
            value={formData.testTime}
            onChange={(e) => handleInputChange('testTime', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Chọn thời gian</option>
            {timeSlots.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        {/* Confirmation checkboxes */}
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.smsConfirm}
              onChange={(e) => handleInputChange('smsConfirm', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Gửi xác nhận SMS</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.emailConfirm}
              onChange={(e) => handleInputChange('emailConfirm', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Gửi xác nhận Email</span>
          </label>
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
        >
          Đặt lịch ngay
        </button>
      </div>
    </div>
  );
}
