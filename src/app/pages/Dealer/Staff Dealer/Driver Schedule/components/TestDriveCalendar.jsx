import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

export default function TestDriveCalendar({ selectedDate, onDateSelect }) {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [countByDate, setCountByDate] = useState({});
  const token = localStorage.getItem("token");
  const today = dayjs();

  // ✅ Fetch toàn bộ lịch trong tháng để đếm số lượng mỗi ngày
  useEffect(() => {
    const startDate = currentMonth.startOf("month").format("YYYY-MM-DD");
    const endDate = currentMonth.endOf("month").format("YYYY-MM-DD");

    fetch(
      `https://prn232.freeddns.org/order-service/api/TestDrive?pageNumber=1&pageSize=500&startDate=${startDate}&endDate=${endDate}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data?.status === 200 && data.data?.items) {
          const grouped = {};
          data.data.items.forEach((item) => {
            const dateKey = dayjs(item.driveDate).format("YYYY-MM-DD");
            grouped[dateKey] = (grouped[dateKey] || 0) + 1;
          });
          setCountByDate(grouped);
        }
      })
      .catch((err) => console.error("Lỗi khi fetch TestDrive counts:", err));
  }, [currentMonth]);

  // Calendar rendering logic
  const startOfMonth = currentMonth.startOf("month");
  const endOfMonth = currentMonth.endOf("month");
  const daysInMonth = [];
  const startDay = startOfMonth.day();
  const totalDays = endOfMonth.date();

  for (let i = 0; i < startDay; i++) daysInMonth.push(null);
  for (let d = 1; d <= totalDays; d++) daysInMonth.push(dayjs(currentMonth).date(d));

  const weeks = [];
  for (let i = 0; i < daysInMonth.length; i += 7)
    weeks.push(daysInMonth.slice(i, i + 7));

  const goToPrevMonth = () => setCurrentMonth(currentMonth.subtract(1, "month"));
  const goToNextMonth = () => setCurrentMonth(currentMonth.add(1, "month"));
  const goToToday = () => setCurrentMonth(dayjs());

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold">Lịch lái thử</h2>
        <div className="flex items-center gap-2">
          <button onClick={goToPrevMonth} className="px-2 py-1 border rounded hover:bg-gray-50">
            &lt;
          </button>
          <button onClick={goToToday} className="px-3 py-1 border rounded hover:bg-gray-50 text-sm">
            Hôm nay
          </button>
          <button onClick={goToNextMonth} className="px-2 py-1 border rounded hover:bg-gray-50">
            &gt;
          </button>
          <span className="ml-4 font-medium">{currentMonth.format("MMMM YYYY")}</span>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-500 mb-2">
        <div>CN</div><div>T2</div><div>T3</div><div>T4</div><div>T5</div><div>T6</div><div>T7</div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weeks.map((week, wi) =>
          week.map((day, di) => {
            const isToday = day && day.isSame(today, "day");
            const isSelected = day && selectedDate && day.isSame(selectedDate, "day");
            const dateKey = day ? day.format("YYYY-MM-DD") : null;
            const count = dateKey ? countByDate[dateKey] || 0 : 0;

            return (
              <button
                key={wi + "-" + di}
                type="button"
                disabled={!day}
                onClick={() => onDateSelect(day)}
                className={`h-20 w-full relative border rounded flex items-start justify-start p-1 text-sm transition-colors
                  ${isSelected
                    ? "bg-blue-600 text-white border-blue-700 shadow-lg font-bold"
                    : isToday
                    ? "bg-blue-100 border-blue-400 text-blue-700 font-semibold"
                    : day
                    ? "hover:bg-blue-50 hover:border-blue-300 cursor-pointer"
                    : "bg-transparent border-transparent cursor-default"
                  }`}
              >
                {day ? day.date() : ""}
                {/* ✅ Hiển thị số lượng lịch */}
                {count > 0 && (
                  <span
                    className={`absolute bottom-1 right-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-white text-blue-700"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
