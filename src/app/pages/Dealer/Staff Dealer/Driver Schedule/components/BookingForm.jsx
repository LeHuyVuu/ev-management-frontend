import { useState, useEffect } from 'react';
import Select from 'react-select';
import dayjs from 'dayjs';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function BookingForm({ selectedDate, onDateSelect }) {
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
    { value: 'morning', label: 'Buổi sáng (9:00 - 12:00)' },
    { value: 'afternoon', label: 'Buổi chiều (14:00 - 17:00)' },
  ];

  // ✅ Đồng bộ selectedDate từ calendar sang formData.testDate
  useEffect(() => {
    if (selectedDate) {
      setFormData((prev) => ({
        ...prev,
        testDate: selectedDate.format('YYYY-MM-DD'),
      }));
    }
  }, [selectedDate]);

  // Fetch customers
  useEffect(() => {
    fetch('https://prn232.freeddns.org/customer-service/api/customers', {
      headers: { Authorization: `Bearer ${token}` },
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
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 200) {
          const options = data.data.items.map((v) => ({
            value: v.vehicleVersionId,
            label: `${v.brand} ${v.versionName}`,
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
        Accept: 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
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

  // ✅ Cho phép chỉnh ngày trong input và đồng bộ lại với calendar
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    handleInputChange('testDate', newDate);
    if (onDateSelect) onDateSelect(dayjs(newDate));
  };

  // ✅ Nâng cấp xử lý toast khi submit
  const handleSubmit = async () => {
    if (!formData.customerId || !formData.selectedCar || !formData.testDate || !formData.testTime) {
      toast.warning('⚠️ Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }

    const requestBody = {
      customerId: formData.customerId,
      vehicleVersionId: formData.selectedCar,
      driveDate: new Date(formData.testDate).toISOString(),
      timeSlot: formData.testTime,
      confirmSms: formData.smsConfirm,
      confirmEmail: formData.emailConfirm,
      status: 'pending',
    };

    try {
      const res = await fetch('https://prn232.freeddns.org/order-service/api/TestDrive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      // ✅ Thành công
      if (res.ok && (data.status === 200 || data.success)) {
        toast.success('🎉 Đặt lịch lái thử thành công!');
        console.log('Booking success:', data);
        return;
      }

      // ✅ Lỗi trùng slot
      if (data?.errors?.includes('Slot has exsit')) {
        toast.error('⚠️ Buổi lái thử này đã được đặt. Vui lòng chọn buổi hoặc ngày khác.');
        return;
      }

      // ✅ Lỗi trả về có message cụ thể
      if (data?.message) {
        toast.error(`❌ ${data.message}`);
        return;
      }

      // ✅ Lỗi mặc định
      toast.error('❌ Đặt lịch thất bại. Vui lòng thử lại!');
      console.error('Error booking:', data);
    } catch (error) {
      toast.error('🚨 Lỗi kết nối server! Vui lòng thử lại sau.');
      console.error('Fetch error:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Đặt lịch lái thử mới</h2>

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
            value={formData.testDate || (selectedDate ? selectedDate.format('YYYY-MM-DD') : '')}
            onChange={handleDateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Time input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Buổi lái thử</label>
          <select
            value={formData.testTime}
            onChange={(e) => handleInputChange('testTime', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Chọn buổi</option>
            {timeSlots.map((slot) => (
              <option key={slot.value} value={slot.value}>
                {slot.label}
              </option>
            ))}
          </select>
        </div>

        {/* Confirmation checkboxes */}
        <div className="space-y-2">
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
