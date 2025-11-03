// DeliveryTracking.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Pagination, ConfigProvider } from "antd";
import NewDeliveryCard from "./components/NewDeliveryCard";
import DeliveryDetailCard from "./components/DeliveryDetailCard";

// --- Ant Design ---
import { Table, Input, Button, Tag, Space, Alert } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Search } = Input;

const API_URL = "https://prn232.freeddns.org/customer-service/api/orders";

function getTokenFromLocalStorage() {
  const keys = ["access_token", "token", "authToken", "jwt"];
  for (const k of keys) {
    const v = window.localStorage.getItem(k);
    if (v) return v;
  }
  return null;
}

// Map status API -> UI (label + màu + progress) (GIỮ NGUYÊN)
const statusMap = {
  preparing: { label: "Đang chuẩn bị", color: "bg-yellow-500", progress: "w-1/6" },
  shipped_from_warehouse: { label: "Đã xuất kho", color: "bg-orange-500", progress: "w-2/6" },
  in_transit: { label: "Đang vận chuyển", color: "bg-blue-500", progress: "w-3/6" },
  arrived_hub: { label: "Đã đến", color: "bg-purple-500", progress: "w-4/6" },
  out_for_delivery: { label: "Đang giao hàng", color: "bg-indigo-500", progress: "w-5/6" },
  delivered: { label: "Đã hoàn thành", color: "bg-green-500", progress: "w-full" },
  failed: { label: "Giao hàng thất bại", color: "bg-red-500", progress: "w-full" },
  pending: { label: "Đang chờ", color: "bg-gray-500", progress: "w-0" },
};

// Tạo reverse map: VN label -> enum API (GIỮ NGUYÊN)
const vnToApi = Object.entries(statusMap).reduce((acc, [apiKey, v]) => {
  acc[v.label] = apiKey;
  return acc;
}, {});

// (GIỮ NGUYÊN)
function mapStatus(status) {
  if (!status) return { label: "Đang chờ", color: "bg-gray-500", progress: "w-0" };

  const asKey = String(status).toLowerCase();
  if (statusMap[asKey]) return statusMap[asKey];

  const apiFromVN = vnToApi[status];
  if (apiFromVN && statusMap[apiFromVN]) return statusMap[apiFromVN];

  return { label: status || "Đang chờ", color: "bg-gray-500", progress: "w-1/4" };
}

// (GIỮ NGUYÊN)
function toApiStatus(status) {
  if (!status) return "pending";
  const asKey = String(status).toLowerCase();
  if (statusMap[asKey]) return asKey;
  return vnToApi[status] || "pending";
}

// (GIỮ NGUYÊN)
function formatCar(brand, modelName, color) {
  const parts = [brand, modelName].filter(Boolean).join(" ");
  return [parts, color ? `(${color})` : ""].filter(Boolean).join(" ");
}

// (GIỮ NGUYÊN)
function formatDate(d) {
  if (!d) return "";
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${day} 00:00`;
  } catch {
    return d;
  }
}

// Helper: hiển thị dot màu theo tailwind class sẵn có (tận dụng tailwind đang dùng)
function StatusTag({ text, colorClass }) {
  return (
    <Tag>
      <span className={`inline-block w-2 h-2 rounded-full mr-2 align-middle ${colorClass}`} />
      <span className="align-middle">{text}</span>
    </Tag>
  );
}

export default function DeliveryTracking() {
  const [deliveriesList, setDeliveriesList] = useState([]);
  const [showNewDeliveryCard, setShowNewDeliveryCard] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showDeliveryDetail, setShowDeliveryDetail] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Phân trang
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    showSizeChanger: true,
    pageSizeOptions: ["8", "12", "16", "24", "32", "48"],
  });

  // Load danh sách orders (GIỮ NGUYÊN LOGIC)
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setErr("");
      try {
        const token = getTokenFromLocalStorage();
        if (!token) {
          setErr("Không tìm thấy token trong localStorage.");
          setLoading(false);
          return;
        }
        const res = await fetch(API_URL, {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`API lỗi (${res.status}): ${text || res.statusText}`);
        }
        const json = await res.json();
        const arr = Array.isArray(json?.data) ? json.data : [];

        const mapped = arr.map((o) => {
          const st = mapStatus(o.status);
          return {
            id: o.orderId,
            customer: o.name,
            car: formatCar(o.brand, o.modelName, o.color),
            address: o.deliveryAddress || "",
            time: formatDate(o.deliveryDate),
            status: st.label,
            _raw: o,
            _style: st,
            key: o.orderId, // cho Ant Table
          };
        });

        if (mounted) setDeliveriesList(mapped);
      } catch (e) {
        if (mounted) setErr(e.message || "Đã xảy ra lỗi khi tải đơn giao hàng.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleAddNewDelivery = (newDelivery) => {
    // newDelivery nên có các field giống mapped ở trên (giữ nguyên hành vi cũ)
    setDeliveriesList((prev) => [{ ...newDelivery, key: newDelivery.id }, ...prev]);
  };

  const handleViewDetail = (delivery) => {
    setSelectedDelivery(delivery);
    setShowDeliveryDetail(true);
  };

  // Nhận từ modal: newStatus có thể là enum API *hoặc* nhãn VN (GIỮ NGUYÊN LOGIC)
  const handleUpdateStatus = (deliveryId, newStatus) => {
    const apiKey = toApiStatus(newStatus);
    const mapped = mapStatus(apiKey);

    setDeliveriesList((prev) =>
      prev.map((delivery) =>
        delivery.id === deliveryId
          ? { ...delivery, status: mapped.label, _style: mapped }
          : delivery
      )
    );

    if (selectedDelivery && selectedDelivery.id === deliveryId) {
      setSelectedDelivery((prev) => ({
        ...prev,
        status: mapped.label,
        _style: mapped,
      }));
    }
  };

  // Filter (GIỮ NGUYÊN LOGIC) + search
  const filteredDeliveries = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return deliveriesList;
    return deliveriesList.filter(
      (delivery) =>
        (delivery.id || "").toLowerCase().includes(q) ||
        (delivery.customer || "").toLowerCase().includes(q) ||
        (delivery.car || "").toLowerCase().includes(q)
    );
  }, [searchTerm, deliveriesList]);

  // Tạo danh sách filters cho cột Trạng thái
  const statusFilters = Object.values(statusMap).map((s) => ({
    text: s.label,
    value: s.label,
  }));

  // Columns cho Ant Table (bỏ Progress %; thêm filter theo trạng thái)
  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      width: 180,
      ellipsis: true,
    },
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
      ellipsis: true,
    },
    {
      title: "Xe",
      dataIndex: "car",
      key: "car",
      ellipsis: true,
      responsive: ["md"],
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      ellipsis: true,
      responsive: ["lg"],
    },
    {
      title: "Thời gian",
      dataIndex: "time",
      key: "time",
      width: 160,
      ellipsis: true,
      responsive: ["md"],
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 220,
      filters: statusFilters,
      onFilter: (value, record) => record.status === value,
      render: (_, record) => {
        const color = record._style?.color || "bg-gray-500";
        return (
          <Space direction="horizontal" size={4} className="w-full">
            <StatusTag text={record.status} colorClass={color} />
          </Space>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Button type="link" onClick={() => handleViewDetail(record)}>
          Chi tiết
        </Button>
      ),
    },
  ];

  // Pagination handlers
  const onTableChange = (pag /*, filters, sorter*/) => {
    setPagination((prev) => ({
      ...prev,
      current: pag.current,
      pageSize: pag.pageSize,
    }));
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h1 className="text-xl font-semibold">Theo dõi Giao hàng</h1>
        <div className="flex gap-3">
          <Search
            allowClear
            placeholder="Tìm theo mã đơn hàng, khách hàng, xe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onSearch={(v) => setSearchTerm(v)}
            style={{ width: 320 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowNewDeliveryCard(true)}
          >
            Thêm Giao hàng Mới
          </Button>
        </div>
      </div>

      {err ? (
        <Alert type="error" message="Lỗi" description={err} className="mb-4" showIcon />
      ) : null}

      <Table
        columns={columns}
        dataSource={filteredDeliveries}
        loading={loading}
        pagination={{
          ...pagination,
          total: filteredDeliveries.length,
          showTotal: (total, range) => `${range[0]}–${range[1]} / ${total}`,
        }}
        scroll={{ x: 1000 }}
        onChange={onTableChange}
        rowKey="id"
      />

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 shadow-sm bg-white animate-pulse">
              <div className="h-4 w-1/2 bg-gray-200 rounded mb-2" />
              <div className="h-5 w-2/3 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-1/2 bg-gray-200 rounded mb-2" />
              <div className="h-2 w-full bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      )}

      {!loading && err && <p className="text-red-600 text-sm mb-4">⚠️ {err}</p>}

      {!loading && !err && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginatedDeliveries.map((d) => {
              const color = d._style?.color || "bg-gray-500";
              const progress = d._style?.progress || "w-1/4";
              return (
                <div
                  key={d.id}
                  className="border rounded-lg p-4 shadow-sm bg-white flex flex-col justify-between"
                >
                  <div>
                    <p className="text-sm text-gray-500">Mã đơn hàng: {d.id}</p>
                    <h2 className="text-lg font-semibold">{d.customer}</h2>
                    <p className="text-sm text-gray-700 mt-2">{d.car}</p>
                    <p className="text-sm text-gray-700 mt-1">{d.address}</p>
                    <p className="text-sm text-gray-700 mt-1">{d.time}</p>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-white text-xs px-2 py-1 rounded ${color}`}>
                        {d.status}
                      </span>
                      <button
                        onClick={() => handleViewDetail(d)}
                        className="text-blue-600 hover:underline"
                      >
                        Chi tiết
                      </button>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`${color} h-2 rounded-full ${progress}`}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-8">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredDeliveries.length}
              onChange={handlePageChange}
              showSizeChanger
              pageSizeOptions={[6, 12, 18, 24]}
              showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} đơn hàng`}
            />
          </div>
        </>
      )}

      {/* New Delivery Card Modal */}
      <NewDeliveryCard
        isOpen={showNewDeliveryCard}
        onClose={() => setShowNewDeliveryCard(false)}
        onSubmit={handleAddNewDelivery}
      />

      {/* Delivery Detail Modal (GIỮ NGUYÊN) */}
      <DeliveryDetailCard
        delivery={selectedDelivery}
        isOpen={showDeliveryDetail}
        onClose={() => {
          setShowDeliveryDetail(false);
          setSelectedDelivery(null);
        }}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
