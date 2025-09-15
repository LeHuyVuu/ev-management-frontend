export default function QuarterlyTargetProgress() {
    const target = 1000000000; // 1 tỷ
    const current = 850000000; // 850 triệu
    const progress = (current / target) * 100;

    return (
        <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="text-base font-semibold mb-6">
                Tiến độ Mục tiêu Doanh số Quý
            </h2>

            {/* Giá trị hiện tại / mục tiêu */}
            <div className="flex justify-between items-center text-sm mb-2">
                <span className="font-semibold text-gray-800">
                    {current.toLocaleString("vi-VN")} VNĐ
                </span>
                <span className="text-gray-500">
                    / {target.toLocaleString("vi-VN")} VNĐ
                </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-blue-100 rounded-full h-2.5 mb-2">
                <div
                    className="bg-blue-500 h-2.5 rounded-full"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            {/* Tỷ lệ đạt */}
            <p className="text-sm text-gray-500">
                Đã đạt <span className="font-semibold">{progress.toFixed(1)}%</span> mục tiêu
            </p>
        </div>
    );
}
