import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { toast, ToastContainer } from 'react-toastify';

Modal.setAppElement('#root');

function TestDriveList({ selectedDate }) {
  const [testDrives, setTestDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTestDrive, setSelectedTestDrive] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const token = localStorage.getItem('token'); 

  useEffect(() => {
    setLoading(true);
    const dateQuery = selectedDate ? `&date=${selectedDate.format('YYYY-MM-DD')}` : '';

    fetch(`https://prn232.freeddns.org/order-service/api/TestDrive?pageNumber=1&pageSize=100${dateQuery}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.status === 200) {
          let items = data.data.items || [];

          // ✅ Lọc chính xác lịch theo ngày được chọn (đảm bảo hiển thị đúng)
          if (selectedDate) {
            const selectedDay = selectedDate.format('YYYY-MM-DD');
            items = items.filter(
              (item) =>
                item.driveDate &&
                item.driveDate.startsWith(selectedDay)
            );
          }

          setTestDrives(items);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch test drives:', err);
        setLoading(false);
      });
  }, [selectedDate]);

  const openModal = (item) => {
    setSelectedTestDrive(item);
    setNewStatus(item.status);
  };

  const closeModal = () => {
    setSelectedTestDrive(null);
    setNewStatus('');
  };

  const handleUpdateStatus = () => {
    if (!selectedTestDrive) return;
    setUpdating(true);
    fetch(`https://prn232.freeddns.org/order-service/api/TestDrive/${selectedTestDrive.testDriveId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(newStatus),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to update status');
        toast.success('Cập nhật trạng thái thành công');
        // ✅ Cập nhật lại trạng thái trong state local
        setTestDrives((prev) =>
          prev.map((td) =>
            td.testDriveId === selectedTestDrive.testDriveId
              ? { ...td, status: newStatus }
              : td
          )
        );
        closeModal();
      })
      .catch((err) => toast.error('Lỗi khi cập nhật trạng thái'))
      .finally(() => setUpdating(false));
  };

  return (
    <div className="bg-white p-4 shadow rounded h-[500px] flex flex-col relative">
      <ToastContainer />
      <h2 className="text-lg font-semibold mb-4">Danh sách lịch lái thử</h2>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-gray-200 h-20 rounded-md" />
          ))}
        </div>
      ) : (
        <ul className="space-y-4 overflow-y-auto pr-1 flex-1">
          {testDrives.length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              Không có lịch nào cho ngày đã chọn.
            </p>
          ) : (
            testDrives.map((item) => (
              <li
                key={item.testDriveId}
                className="border border-gray-200 p-4 rounded-md shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-200 cursor-pointer"
                onClick={() => openModal(item)}
              >
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-gray-800">{item.customerName}</h3>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      item.status === 'scheduled'
                        ? 'bg-blue-100 text-blue-700'
                        : item.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : item.status === 'pending'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{item.vehicleName}</p>
                <p className="text-sm text-gray-500">{item.dealerName}</p>
                <p className="text-xs text-gray-400">
                  {item.driveDate?.split('T')[0]} |{' '}
                  {item.timeSlot === 'morning'
                    ? 'Buổi sáng'
                    : item.timeSlot === 'afternoon'
                    ? 'Buổi chiều'
                    : item.timeSlot}
                </p>
              </li>
            ))
          )}
        </ul>
      )}

      {/* Modal cập nhật trạng thái */}
      <Modal
        isOpen={!!selectedTestDrive}
        onRequestClose={closeModal}
        className="bg-white max-w-lg w-full p-6 rounded-lg shadow-lg mx-auto mt-24 outline-none border"
        overlayClassName="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-start z-50 px-4"
      >
        <h3 className="text-lg font-bold mb-4 text-gray-800">
          Cập nhật trạng thái lịch lái thử
        </h3>
        {selectedTestDrive && (
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <label className="block font-medium mb-1">Khách hàng</label>
              <div className="text-gray-900 font-semibold">{selectedTestDrive.customerName}</div>
            </div>
            <div>
              <label className="block font-medium mb-1">Xe</label>
              <div>{selectedTestDrive.vehicleName}</div>
            </div>
            <div>
              <label className="block font-medium mb-1">Trạng thái</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200"
              >
                <option value="scheduled">Đã lên lịch</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Hủy</option>
                <option value="pending">Chờ xử lý</option>
              </select>
            </div>
            <div className="flex justify-end pt-4 gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {updating ? 'Đang cập nhật...' : 'Lưu'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default TestDriveList;
