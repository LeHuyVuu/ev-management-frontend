import React from "react";
import { X } from "lucide-react";

const PromotionConfirm = ({ open, title, desc, onCancel, onConfirm }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
        <div className="flex justify-between items-start mb-3">
          <h3 id="confirm-title" className="font-semibold text-lg">{title}</h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:bg-gray-100 p-1 rounded"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>
        <p id="confirm-desc" className="text-sm text-gray-600 mb-6">{desc}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromotionConfirm;
