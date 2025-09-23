import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function ContractCard({ contract, onClose }) {
  const [fileContent, setFileContent] = useState("");

  // load hợp đồng mặc định khi mở modal
  useEffect(() => {
    if (contract?.content) {
      setFileContent(contract.content);
    }
  }, [contract]);

  if (!contract) return null;

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFileContent(ev.target.result);
      };
      reader.readAsDataURL(file);
    } else if (file && file.type.startsWith("text/")) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFileContent(ev.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white shadow-xl rounded-2xl p-6 border grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <div className="md:col-span-3 flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Chi tiết hợp đồng {contract.id}</h1>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Nội dung hợp đồng</h2>

          <div
            className="border-2 border-dashed border-gray-400 rounded-lg p-4 h-96 overflow-auto text-sm text-gray-700"
            onDrop={handleFileDrop}
            onDragOver={handleDragOver}
          >
            {fileContent ? (
              fileContent.startsWith("data:application/pdf") ? (
                <iframe
                  src={fileContent}
                  title="PDF Preview"
                  className="w-full h-full rounded"
                ></iframe>
              ) : (
                <pre className="whitespace-pre-wrap">{fileContent}</pre>
              )
            ) : (
              <p className="text-gray-500 text-center">
                Kéo thả file hợp đồng (PDF hoặc Text) vào đây để xem nội dung.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contract Info */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Thông tin hợp đồng</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Mã hợp đồng: <span className="font-medium">{contract.id}</span></li>
              <li>Khách hàng: <span className="font-medium">{contract.customer}</span></li>
              <li>Mẫu xe: <span className="font-medium">{contract.car}</span></li>
              <li>Ngày ký: <span className="font-medium">{contract.date}</span></li>
              <li>Trạng thái: <span className="text-green-600 font-medium">{contract.status}</span></li>
              <li>Giá trị: <span className="font-medium text-blue-600">{contract.value}</span></li>
              <li>Thanh toán: <span className="font-medium">{contract.payment}</span></li>
            </ul>
          </div>

          {/* Actions */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Hành động hợp đồng</h3>
            <div className="flex flex-col gap-2">
              <button className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm">Duyệt hợp đồng</button>
              <button className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm">Từ chối</button>
              <button className="bg-gray-500 text-white px-3 py-2 rounded-lg text-sm">Gửi Khách hàng</button>
            </div>
          </div>

          {/* Version History */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Lịch sử phiên bản</h3>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              <li>Phiên bản 1.0 (Đã ký - 01/07/2024)</li>
              <li>Phiên bản nháp (28/06/2024)</li>
              <li>Phiên bản ban đầu (20/06/2024)</li>
            </ul>
          </div>

          {/* Attachments */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Tệp đính kèm</h3>
            <ul className="text-sm text-blue-600 list-disc list-inside">
              <li>Giấy tờ xe_HD001.pdf</li>
              <li>CMND_KhachHang_HD001.jpg</li>
            </ul>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Ghi chú nội bộ</h3>
            <textarea
              placeholder="Thêm ghi chú về hợp đồng này..."
              className="w-full border rounded-lg p-2 text-sm"
              rows="3"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
