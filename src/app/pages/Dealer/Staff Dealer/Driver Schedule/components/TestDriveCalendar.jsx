import React, { useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/vi"; // để hiển thị tiếng Việt

dayjs.locale("vi");


export default function TestDriveCalendar() {
    const [currentMonth, setCurrentMonth] = useState(dayjs());
    const [selectedDay, setSelectedDay] = useState(undefined);

    const today = dayjs();

    // Tính toán số ngày trong tháng
    const startOfMonth = currentMonth.startOf("month");
    const endOfMonth = currentMonth.endOf("month");

    const daysInMonth = [];
    const startDay = startOfMonth.day(); // CN = 0, T2 = 1, ...
    const totalDays = endOfMonth.date();

    // Thêm ngày trống đầu tháng
    for (let i = 0; i < startDay; i++) {
        daysInMonth.push(null);
    }

    // Thêm ngày thực tế trong tháng
    for (let d = 1; d <= totalDays; d++) {
        daysInMonth.push(dayjs(currentMonth).date(d));
    }

    // Chia thành 7 cột (CN -> T7)
    const weeks = [];
    for (let i = 0; i < daysInMonth.length; i += 7) {
        weeks.push(daysInMonth.slice(i, i + 7));
    }

    const goToPrevMonth = () => setCurrentMonth(currentMonth.subtract(1, "month"));
    const goToNextMonth = () => setCurrentMonth(currentMonth.add(1, "month"));
    const goToToday = () => setCurrentMonth(dayjs());

    return (
        <div className="border rounded-lg p-4 bg-white shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold">Lịch lái thử</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={goToPrevMonth}
                        className="px-2 py-1 border rounded hover:bg-gray-50"
                    >
                        &lt;
                    </button>
                    <button
                        onClick={goToToday}
                        className="px-3 py-1 border rounded hover:bg-gray-50 text-sm"
                    >
                        Hôm nay
                    </button>
                    <button
                        onClick={goToNextMonth}
                        className="px-2 py-1 border rounded hover:bg-gray-50"
                    >
                        &gt;
                    </button>
                    <span className="ml-4 font-medium">
                        {currentMonth.format("MMMM YYYY")}
                    </span>
                    <select className="ml-2 border rounded px-2 py-1 text-sm">
                        <option>Tháng</option>
                        <option>Tuần</option>
                    </select>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-500 mb-2">
                <div>CN</div>
                <div>T2</div>
                <div>T3</div>
                <div>T4</div>
                <div>T5</div>
                <div>T6</div>
                <div>T7</div>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {weeks.map((week, wi) =>
                    week.map((day, di) => {
                        const isToday = day && day.isSame(today, "day");
                        const isSelected = day && selectedDay && day.isSame(selectedDay, "day");
                        return (
                            <button
                                key={wi + "-" + di}
                                type="button"
                                disabled={!day}
                                onClick={() => day && setSelectedDay(day)}
                                className={`h-20 w-full border rounded flex items-start justify-start p-1 text-sm transition-colors
                                    ${isSelected ? "bg-blue-600 text-white border-blue-700 shadow-lg font-bold" :
                                        isToday ? "bg-blue-100 border-blue-400 text-blue-700 font-semibold" :
                                            day ? "hover:bg-blue-50 hover:border-blue-300 cursor-pointer" : "bg-transparent border-transparent cursor-default"}
                                `}
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
