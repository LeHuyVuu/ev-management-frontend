import React, { useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

export default function TestDriveCalendar({ selectedDate, onDateSelect }) {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const today = dayjs();

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
          <button onClick={goToPrevMonth} className="px-2 py-1 border rounded hover:bg-gray-50">&lt;</button>
          <button onClick={goToToday} className="px-3 py-1 border rounded hover:bg-gray-50 text-sm">Hôm nay</button>
          <button onClick={goToNextMonth} className="px-2 py-1 border rounded hover:bg-gray-50">&gt;</button>
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

            return (
              <button
                key={wi + "-" + di}
                type="button"
                disabled={!day}
                onClick={() => onDateSelect(day)}
                className={`h-20 w-full border rounded flex items-start justify-start p-1 text-sm transition-colors
                  ${isSelected ? "bg-blue-600 text-white border-blue-700 shadow-lg font-bold" :
                  isToday ? "bg-blue-100 border-blue-400 text-blue-700 font-semibold" :
                  day ? "hover:bg-blue-50 hover:border-blue-300 cursor-pointer" :
                  "bg-transparent border-transparent cursor-default"}`}
              >
                {day ? day.date() : ""}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
