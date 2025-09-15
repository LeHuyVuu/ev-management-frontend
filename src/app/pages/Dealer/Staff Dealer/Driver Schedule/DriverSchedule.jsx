import React from 'react';
import TestDriveCalendar from './components/TestDriveCalendar';
import BookingForm from './components/BookingForm';
import RecentFeedback from './components/RecentFeedback';

function DriverSchedule() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">Lịch lái thử</h1>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar bên trái chiếm nhiều diện tích hơn */}
        <div className="w-full lg:w-2/3">
          <TestDriveCalendar />
        </div>
        {/* Cột phải: BookingForm trên, RecentFeedback dưới, cùng chiều rộng */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          <div className="w-full">
            <BookingForm />
          </div>
          <div className="w-full">
            <RecentFeedback />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DriverSchedule;
