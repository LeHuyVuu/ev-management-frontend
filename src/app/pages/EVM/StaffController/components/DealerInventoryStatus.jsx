import React, { useEffect, useState } from "react";
import { Input, Select, Spin } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Option } = Select;
const PAGE_SIZE = 5;

const DealerInventoryStatus = () => {
  const [dealers, setDealers] = useState([]);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [inventories, setInventories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 🟢 Lấy danh sách dealer active
  const fetchDealers = async () => {
    try {
      const res = await fetch(
        "https://prn232.freeddns.org/dealer-service/api/Dealers/active-dealers"
      );
      const json = await res.json();
      if (json.status === 200) {
        setDealers(json.data || []);
      }
    } catch (err) {
      console.error("Fetch dealers failed:", err);
    }
  };

  // 🟢 Lấy tồn kho của tất cả dealer hoặc dealer cụ thể
  const fetchInventories = async (dealerId = null) => {
    setLoading(true);
    try {
      const dealerList = dealerId
        ? dealers.filter((d) => d.dealerId === dealerId)
        : dealers;

      const allData = [];
      for (const d of dealerList) {
        const res = await fetch(
          `https://prn232.freeddns.org/brand-service/api/inventories/dealer/${d.dealerId}?pageNumber=1&pageSize=50`
        );
        const json = await res.json();
        if (json.status === 200 && json.data?.items) {
          json.data.items.forEach((inv) =>
            allData.push({ ...inv, dealerName: d.name })
          );
        }
      }

      setInventories(allData);
      setFiltered(allData);
      setPageNumber(1);
      setTotalPages(Math.ceil(allData.length / PAGE_SIZE));
    } catch (err) {
      console.error("Fetch inventories failed:", err);
      setInventories([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  useEffect(() => {
    if (dealers.length > 0) {
      fetchInventories(selectedDealer);
    }
  }, [dealers, selectedDealer]);

  // 🔍 Lọc local theo nhiều trường
  useEffect(() => {
    const search = searchValue.toLowerCase();
    const results = inventories.filter((item) => {
      const v = item.vehicleVersion;
      return (
        !search ||
        item.dealerName.toLowerCase().includes(search) ||
        v.brand.toLowerCase().includes(search) ||
        v.modelName.toLowerCase().includes(search) ||
        v.versionName.toLowerCase().includes(search) ||
        v.evType?.toLowerCase().includes(search)
      );
    });

    setFiltered(results);
    setPageNumber(1);
    setTotalPages(Math.ceil(results.length / PAGE_SIZE));
  }, [searchValue, inventories]);

  const paginated = filtered.slice(
    (pageNumber - 1) * PAGE_SIZE,
    pageNumber * PAGE_SIZE
  );

  const handlePrev = () =>
    setPageNumber((p) => Math.max(1, p - 1));

  const handleNext = () =>
    setPageNumber((p) => Math.min(totalPages, p + 1));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-xl font-bold text-gray-900 whitespace-nowrap">
          Dealer Inventory Status
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          {/* Select dealer */}
          <Select
            placeholder="Chọn Dealer..."
            className="w-60 !h-[38px]"
            value={selectedDealer || undefined}
            onChange={(value) => setSelectedDealer(value)}
            allowClear
          >
            {dealers.map((d) => (
              <Option key={d.dealerId} value={d.dealerId}>
                {d.name}
              </Option>
            ))}
          </Select>

          {/* Search */}
          <Input
            placeholder="Tìm theo dealer, model, phiên bản..."
            prefix={<SearchOutlined />}
            allowClear
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-80 !h-[38px] !rounded-md !border-gray-300 !text-sm !font-medium !text-gray-800"
            style={{ fontFamily: "inherit" }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-100">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Spin size="large" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            Không có dữ liệu tồn kho.
          </div>
        ) : (
          <table className="min-w-full border-collapse">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-blue-700 uppercase">
                  Dealer
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-blue-700 uppercase">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-blue-700 uppercase">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-blue-700 uppercase">
                  Version
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-blue-700 uppercase">
                  EV Type
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-blue-700 uppercase">
                  Available Stock
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginated.map((item) => {
                const v = item.vehicleVersion;
                return (
                  <tr key={item.inventoryId} className="hover:bg-blue-50">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {item.dealerName}
                    </td>
                    <td className="px-6 py-4">
                      <img
                        src={v.imageUrl}
                        alt={v.modelName}
                        className="w-16 h-10 object-cover rounded-md border border-gray-200"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg";
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {v.brand} {v.modelName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {v.versionName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {v.evType}
                    </td>
                    <td className="px-6 py-4 text-sm text-center font-semibold text-gray-900">
                      {item.stockQuantity}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-500">
            Page {pageNumber} of {totalPages} ({filtered.length} items)
          </p>
          <div className="flex space-x-2">
            <button
              onClick={handlePrev}
              disabled={pageNumber === 1}
              className={`px-3 py-1 border rounded-md text-sm ${
                pageNumber === 1
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-blue-600 border-gray-300 hover:bg-blue-50"
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
                  : "text-blue-600 border-gray-300 hover:bg-blue-50"
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

export default DealerInventoryStatus;
