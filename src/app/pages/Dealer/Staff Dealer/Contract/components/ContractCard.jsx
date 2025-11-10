import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

// ===== Config =====
const API_ROOT = "https://prn232.freeddns.org/customer-service/contracts";
const TOKEN = localStorage.getItem("token"); // dev fallback (đừng commit token thật)

// ===== Helpers =====
const viPayment = {
  cash: "Tiền mặt",
  installment: "Trả góp",
};

const viStatus = {
  approved: "Đã duyệt",
  completed: "Hoàn thành",
  funded: "Đã tài trợ",
  pending: "Chờ xử lý",
};

function formatVND(amount) {
  if (amount == null || isNaN(Number(amount))) return "-";
  try {
    return new Intl.NumberFormat("vi-VN").format(Number(amount)) + " VND";
  } catch {
    return `${amount} VND`;
  }
}

function formatDateISOToVN(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function ContractCard({ contract, onClose }) {
  const [fileContent, setFileContent] = useState("");
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Tải chi tiết hợp đồng theo contract.id (UUID) khi mở modal
  useEffect(() => {
    let ignore = false;
    async function fetchDetail() {
      if (!contract?.id) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_ROOT}/${contract.id}`, {
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${TOKEN}`,
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const d = json?.data || null;
        if (!ignore) setDetail(d);
        // Nếu API có trả fileUrl và là PDF, hiển thị luôn trong iframe
        const fileUrl = d?.fileUrl;
        if (fileUrl && typeof fileUrl === "string" && fileUrl.toLowerCase().endsWith(".pdf")) {
          if (!ignore) setFileContent(fileUrl);
        }
      } catch (e) {
        if (!ignore) setError(e?.message || "Không tải được chi tiết hợp đồng");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchDetail();
    return () => {
      ignore = true;
    };
  }, [contract?.id]);

  // load hợp đồng mặc định nếu có nội dung sẵn (giữ logic cũ)
  useEffect(() => {
    if (contract?.content) {
      setFileContent(contract.content);
    }
  }, [contract]);

  if (!contract) return null;

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setFileContent(ev.target.result);
    if (file.type === "application/pdf") reader.readAsDataURL(file);
    else if (file.type.startsWith("text/")) reader.readAsText(file);
  };

  const handleDragOver = (e) => e.preventDefault();

  // Ghép dữ liệu hiển thị (giữ nguyên giao diện, chỉ đổi value)
  const ui = useMemo(() => {
    const d = detail || {};
    return {
      id: contract.id,
      customer: d.customerName || contract.customer,
      car:
        [d.brand, d.vehicleName, d.versionName]
          .filter(Boolean)
          .join(" ") || contract.car,
      date: formatDateISOToVN(d.signedDate) || contract.date,
      status: viStatus[d.status] || contract.status,
      value: formatVND(d.totalValue ?? contract.value),
      payment: viPayment[d.paymentMethod] || contract.payment || "-",
      // bổ sung để bạn dùng nếu muốn hiển thị thêm
      dealerName: d.dealerName,
      dealerPhone: d.dealerPhone,
      customerPhone: d.customerPhone,
      customerEmail: d.customerEmail,
      fileUrl: d.fileUrl,
    };
  }, [detail, contract]);

  const isPDFData = typeof fileContent === "string" &&
    (fileContent.startsWith("data:application/pdf") || fileContent.toLowerCase().endsWith(".pdf"));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white shadow-xl rounded-2xl p-6 border grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <div className="md:col-span-3 flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Chi tiết hợp đồng {ui.id}</h1>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={24} />
          </button>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Nội dung hợp đồng</h2>

          {loading && (
            <div className="mb-2 text-sm text-gray-600">Đang tải chi tiết hợp đồng…</div>
          )}
          {error && (
            <div className="mb-2 text-sm text-red-600">{error}</div>
          )}

          <div
            className="border-2 border-dashed border-gray-400 rounded-lg p-4 h-96 overflow-auto text-sm text-gray-700"
            onDrop={handleFileDrop}
            onDragOver={handleDragOver}
          >
            {fileContent ? (
              isPDFData ? (
                <iframe src={fileContent} title="PDF Preview" className="w-full h-full rounded" />
              ) : (
                <pre className="whitespace-pre-wrap">{fileContent}</pre>
              )
            ) : ui.fileUrl && ui.fileUrl !== "Contract don't have file" ? (
              // Nếu API trả link file nhưng chưa là PDF, hiển thị đường link
              <a
                href={ui.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                Mở tệp hợp đồng
              </a>
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
              <li>Mã hợp đồng: <span className="font-medium">{ui.id}</span></li>
              <li>Khách hàng: <span className="font-medium">{ui.customer}</span></li>
              <li>Mẫu xe: <span className="font-medium">{ui.car}</span></li>
              <li>Ngày ký: <span className="font-medium">{ui.date}</span></li>
              <li>Trạng thái: <span className="text-green-600 font-medium">{ui.status}</span></li>
              <li>Giá trị: <span className="font-medium text-blue-600">{ui.value}</span></li>
              <li>Thanh toán: <span className="font-medium">{ui.payment}</span></li>
            </ul>
          </div>

          {/* Actions (giữ nguyên UI, chưa nối API hành động) */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Hành động hợp đồng</h3>
            <div className="flex flex-col gap-2">
              <button className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm">Duyệt hợp đồng</button>
              <button className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm">Từ chối</button>
              <button className="bg-gray-500 text-white px-3 py-2 rounded-lg text-sm">Gửi Khách hàng</button>
            </div>
          </div>

        

          {/* Notes */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Ghi chú nội bộ</h3>
            <textarea
              placeholder="Thêm ghi chú về hợp đồng này..."
              className="w-full border rounded-lg p-2 text-sm"
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
