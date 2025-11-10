// Updated DealerAccounts.jsx
import React, { useEffect, useState } from "react";
import UpdateDealerModal from "./UpdateDealerModal";
import CreateDealerModal from "./CreateDealerModal";
import { Lock, Pencil, Trash, Settings, Loader2 } from "lucide-react";
import api from "../../../../context/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Helper: chuẩn hoá message lỗi từ API (kể cả khi response không OK)
const extractApiError = async (res) => {
  try {
    // cố gắng parse JSON trước
    const data = await res.clone().json().catch(() => null);

    const msg =
      data?.Message ||
      data?.message ||
      data?.Data?.message ||
      data?.Errors ||
      (typeof data === "string" ? data : null);

    if (msg) return msg;

    // nếu không có message trong JSON, thử đọc text
    const text = await res.text().catch(() => "");
    if (text) return text;

    return `Request failed with status ${res.status}`;
  } catch {
    return `Request failed with status ${res.status}`;
  }
};

const DealerAccounts = () => {
  const [dealers, setDealers] = useState([]);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const normalizeDealer = (dealer) => ({
    ...dealer,
    status: dealer.status ? String(dealer.status).toLowerCase() : "inactive",
  });

  const getStatusColor = (status) => {
    const normalized = typeof status === "string" ? status.toLowerCase() : "";
    switch (normalized) {
      case "active":
        return "bg-green-100 text-green-800";
      case "terminated":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const fetchDealers = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${api.dealer}/api/Dealers?pageNumber=${page}&pageSize=${pageSize}`
      );

      if (res.ok) {
        const json = await res.json();
        if (json?.status === 200 && json?.data?.items) {
          setDealers(json.data.items.map(normalizeDealer));
          setTotalPages(json.data.totalPages);
        } else {
          toast.error(json?.Message || json?.message || "Failed to fetch dealers");
        }
      } else {
        const errMsg = await extractApiError(res);
        toast.error(errMsg);
      }
    } catch (error) {
      toast.error("Failed to fetch dealers");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleEdit = (dealer) => {
    setSelectedDealer({ ...dealer });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const res = await fetch(
        `${api.dealer}/api/Dealers/${selectedDealer.dealerId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...selectedDealer,
            status: selectedDealer.status?.toLowerCase(),
          }),
        }
      );

      if (res.ok) {
        const updated = await res.json();
        const dealer = updated.data;

        if (!dealer?.dealerId) {
          toast.error("❌ API không trả về dealerId, không thể cập nhật.");
          return;
        }

        setDealers((prev) =>
          prev.map((d) =>
            d.dealerId === dealer.dealerId ? normalizeDealer(dealer) : d
          )
        );

        toast.success("Dealer updated successfully");
        setShowModal(false);
      } else {
        const errMsg = await extractApiError(res);
        toast.error(errMsg);
      }
    } catch (error) {
      toast.error("Error updating dealer");
      console.error(error);
    }
  };

  const handleCreate = async (newDealer) => {
    try {
      const res = await fetch(`${api.dealer}/api/Dealers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newDealer,
          status: newDealer.status?.toLowerCase(),
        }),
      });

      if (res.ok) {
        const created = await res.json();
        const dealer = created.data; // object dealer từ API

        if (!dealer?.dealerId) {
          toast.error("❌ API không trả về dealerId, không thể thêm vào danh sách.");
          return;
        }

        setDealers((prev) => [normalizeDealer(dealer), ...prev]);
        toast.success("Dealer created successfully");
        setShowCreateModal(false);
      } else {
        const errMsg = await extractApiError(res);
        toast.error(errMsg); // ví dụ: Dealer code has already existed.
      }
    } catch (error) {
      toast.error("Error creating dealer");
      console.error(error);
    }
  };

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 w-16 bg-gray-200 rounded"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="h-4 w-40 bg-gray-200 rounded"></div>
          <div className="h-4 w-28 bg-gray-200 rounded"></div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
      </td>
      <td className="px-6 py-4">
        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
      </td>
    </tr>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dealer Accounts</h2>
        <div className="flex space-x-3">
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            onClick={() => setShowCreateModal(true)}
          >
            + Create Dealer
          </button>
          {/* <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
            <Settings className="w-4 h-4" /> <span>Assign Roles</span>
          </button> */}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Dealer Code
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Dealer Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Region
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading &&
              Array.from({ length: pageSize }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            {!loading &&
              dealers.map((dealer, index) => (
                <tr key={dealer.dealerId || index}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {dealer.dealerCode}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {dealer.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {dealer.region}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {dealer.contactEmail}
                    <br />
                    {dealer.contactPhone}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        dealer.status
                      )}`}
                    >
                      {dealer.status || "n/a"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-3 flex items-center">
                    <button
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => handleEdit(dealer)}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            {!loading && dealers.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-4 text-center text-gray-500"
                >
                  No dealer data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </button>
      </div>

      {showModal && (
        <UpdateDealerModal
          dealer={selectedDealer}
          setDealer={setSelectedDealer}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
      {showCreateModal && (
        <CreateDealerModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
};

export default DealerAccounts;
