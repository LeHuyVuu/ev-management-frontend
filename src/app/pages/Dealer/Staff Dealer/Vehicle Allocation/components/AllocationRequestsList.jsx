import React, { useEffect, useState } from "react";

/**
 * AllocationRequestsList
 * - Sort theo ngày (desc)
 * - Hiển thị ID rút gọn
 */

const SHORT_ID_LEN = 8;

function shortId(id = "") {
  if (!id) return "";
  return id.length > SHORT_ID_LEN ? id.slice(0, SHORT_ID_LEN) + "…" : id;
}

function StatusCell({ status }) {
  const displayStatus = (() => {
    switch (status) {
      case "in_transit":
        return "Đang vận chuyển";
      case "received":
        return "Đã nhận yêu cầu";
      case "at_dealer":
        return "Tại đại lý";
      default:
        return status;
    }
  })();

  if (displayStatus === "Đã nhận yêu cầu") {
    return (
      <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
        {displayStatus}
      </span>
    );
  }
  return <span className="text-gray-800">{displayStatus}</span>;
}

export default function AllocationRequestsList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOiJhNzRlOWUwMy03YzRkLTQ0ZDAtOGY0Yy0wZjAxODRiN2U2ZjQiLCJSb2xlSWQiOiI0IiwiUm9sZU5hbWUiOiJEZWFsZXIgU3RhZmYiLCJEZWFsZXJJZCI6ImViODAyYjcxLTRhZTAtNGNiMy1iYzg1LThjNTZmNjdiZDc1NyIsIm5iZiI6MTc2MTE0NjUxMCwiZXhwIjoxNzY5MDk1MzEwLCJpYXQiOjE3NjExNDY1MTAsImlzcyI6IkVWTSIsImF1ZCI6IlVzZXIifQ.Pr-9xC1ZungY2cTIIDUeFs7lHr6Sm2L0spguOLRaCpY";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          "https://prn232.freeddns.org/order-service/api/VehicleAllocation?pageNumber=1&pageSize=10",
          {
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const json = await res.json();
        if (json.status === 200 && json.data?.items) {
          const mapped = json.data.items.map((item) => ({
            id: item.allocationId,
            idShort: shortId(item.allocationId),
            car: item.vehicleName,
            destination: item.dealerName,
            quantity: item.quantity,
            date: item.requestDate, // ISO string yyyy-mm-dd
            status: item.status,
          }));

          // Sort theo ngày: mới → cũ
          mapped.sort((a, b) => {
            const da = new Date(a.date ?? 0).getTime();
            const db = new Date(b.date ?? 0).getTime();
            return db - da; // desc
          });

          setRequests(mapped);
        } else {
          setError("Không thể tải dữ liệu.");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const onView = (req) => alert(`Xem ${req.id}`);
  const onDelete = (req) => {
    if (confirm(`Xóa ${req.id}?`)) alert(`${req.id} đã được xóa (mock)`);
  };

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-2">Các yêu cầu phân bổ hiện có</h2>
      <p className="text-sm text-gray-500 mb-4">
        Theo dõi trạng thái của các yêu cầu xe.
      </p>

      {loading && (
        <p className="text-sm text-gray-500 italic">Đang tải dữ liệu...</p>
      )}
      {error && <p className="text-sm text-red-500 italic">Lỗi: {error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="text-xs text-gray-500">
                <th className="px-4 py-3">ID Yêu cầu</th>
                <th className="px-4 py-3">Xe</th>
                <th className="px-4 py-3">Địa điểm đến</th>
                <th className="px-4 py-3 text-center">Số lượng</th>
                <th className="px-4 py-3">Ngày yêu cầu</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Hành động</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {requests.length > 0 ? (
                requests.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td
                      className="px-4 py-4 text-gray-700 w-28"
                      title={r.id} // hover vẫn xem full id
                    >
                      {r.idShort}
                    </td>
                    <td className="px-4 py-4 text-gray-800">{r.car}</td>
                    <td className="px-4 py-4 text-gray-700">{r.destination}</td>
                    <td className="px-4 py-4 text-center text-gray-700 w-16">
                      {r.quantity}
                    </td>
                    <td className="px-4 py-4 text-gray-700">{r.date}</td>
                    <td className="px-4 py-4">
                      <StatusCell status={r.status} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => onView(r)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>

                        <button
                          onClick={() => onDelete(r)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 8.586l4.95-4.95 1.414 1.414L11.414 10l4.95 4.95-1.414 1.414L10 11.414l-4.95 4.95-1.414-1.414L8.586 10 3.636 5.05l1.414-1.414L10 8.586z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
                    Không có yêu cầu phân bổ nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
