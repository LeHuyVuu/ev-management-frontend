import { useState } from 'react';

export default function RecentFeedback() {
    // Mock data matching the image
    const feedbackList = [
        {
            id: 1,
            name: 'Trần Thị B',
            car: 'Honda Civic',
            date: 'July 10th, 2024',
            status: 'Đã ghi nhận',
            statusColor: 'text-gray-600'
        },
        {
            id: 2,
            name: 'Lê Văn C',
            car: 'Toyota Corolla',
            date: 'July 15th, 2024',
            status: 'Đang chờ xử lý',
            statusColor: 'text-orange-600'
        },
        {
            id: 3,
            name: 'Phạm Thu D',
            car: 'Mazda 3',
            date: 'July 15th, 2024',
            status: 'Đã ghi nhận',
            statusColor: 'text-gray-600'
        },
        {
            id: 4,
            name: 'Võ Hoài E',
            car: 'Hyundai Elantra',
            date: 'July 20th, 2024',
            status: 'Đang chờ xử lý',
            statusColor: 'text-orange-600'
        }
    ];

    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Phản hồi gần đây</h2>

            <div className="space-y-4">
                {feedbackList.map((feedback, index) => (
                    <div key={feedback.id} className={`pb-4 ${index !== feedbackList.length - 1 ? 'border-b border-gray-200' : ''}`}>
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h3 className="font-medium text-gray-900 text-base mb-1">
                                    {feedback.name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {feedback.car} - {feedback.date}
                                </p>
                            </div>
                            <div className="ml-4">
                                <span className={`text-sm font-medium ${feedback.statusColor}`}>
                                    {feedback.status}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}