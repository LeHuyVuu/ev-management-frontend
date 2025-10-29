import React, { useEffect, useState } from "react";

const EVModelManagement = () => {
  const [models, setModels] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchModels = async (page) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://prn232.freeddns.org/brand-service/api/vehicle-versions?pageNumber=${page}&pageSize=${pageSize}`
      );
      const json = await res.json();

      if (json.status === 200 && json.data) {
        setModels(json.data.items);
        setTotalPages(json.data.totalPages);
      } else {
        throw new Error(json.message || "Failed to fetch data");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels(pageNumber);
  }, [pageNumber]);

  const handlePrev = () => {
    if (pageNumber > 1) setPageNumber(pageNumber - 1);
  };

  const handleNext = () => {
    if (pageNumber < totalPages) setPageNumber(pageNumber + 1);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">EV Model Management</h2>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center space-x-2"
        >
          <span>＋</span>
          <span>Add New Model</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-gray-500 text-center py-10">Loading models...</div>
        ) : error ? (
          <div className="text-red-600 text-center py-10">⚠️ {error}</div>
        ) : models.length === 0 ? (
          <div className="text-gray-500 text-center py-10">No models found</div>
        ) : (
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Version
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Color
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  EV Type
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  EVM Stock
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Price
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {models.map((m) => (
                <tr key={m.vehicleVersionId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <img
                      src={m.imageUrl}
                      alt={m.modelName}
                      className="w-16 h-10 object-cover rounded-md border border-gray-200"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    <div>{m.brand}</div>
                    <div className="text-gray-500 text-xs">{m.modelName}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {m.versionName}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                      {m.color}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{m.evType}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    {m.stockQuantity}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {m.basePrice.toLocaleString("vi-VN")} ₫
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && models.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-500">
            Page {pageNumber} of {totalPages}
          </p>
          <div className="flex space-x-2">
            <button
              onClick={handlePrev}
              disabled={pageNumber === 1}
              className={`px-3 py-1 border rounded-md text-sm ${
                pageNumber === 1
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-indigo-600 border-gray-300 hover:bg-indigo-50"
              }`}
            >
              ← Prev
            </button>
            <button
              onClick={handleNext}
              disabled={pageNumber === totalPages}
              className={`px-3 py-1 border rounded-md text-sm ${
                pageNumber === totalPages
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-indigo-600 border-gray-300 hover:bg-indigo-50"
              }`}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EVModelManagement;
