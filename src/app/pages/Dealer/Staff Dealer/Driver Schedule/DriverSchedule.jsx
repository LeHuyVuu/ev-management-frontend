import React, { useState } from 'react';
import TestDriveCalendar from './components/TestDriveCalendar';
import BookingForm from './components/BookingForm';
import TestDriveList from './components/TestDriveList';

function DriverSchedule() {
  const [activeTab, setActiveTab] = useState('booking');
  const [selectedDate, setSelectedDate] = useState(null); // thêm state lưu ngày chọn

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">Lịch lái thử</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar bên trái */}
        <div className="w-full lg:w-2/3">
          <TestDriveCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />
        </div>

        {/* Tabs bên phải */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          <div className="flex border-b">
            <button
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeTab === 'booking'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
              onClick={() => setActiveTab('booking')}
            >
              Đặt lịch
            </button>
            <button
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeTab === 'list'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
              onClick={() => setActiveTab('list')}
            >
              Danh sách lịch
            </button>
          </div>

          <div className="w-full">
            {activeTab === 'booking' && <BookingForm selectedDate={selectedDate} />}
            {activeTab === 'list' && <TestDriveList selectedDate={selectedDate} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DriverSchedule;
