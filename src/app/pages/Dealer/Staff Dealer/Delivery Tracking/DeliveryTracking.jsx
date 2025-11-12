// DeliveryTracking.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Pagination,
  ConfigProvider,
  Card,
  Input,
  Select,
  DatePicker,
  Tag,
  Progress,
  Button,
  Row,
  Col,
  Space,
  Empty,
  Tooltip,
  Divider,
  Avatar,
  Typography,
  Badge,
  Steps,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  InfoCircleOutlined,
  EnvironmentOutlined,
  CarOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import NewDeliveryCard from "./components/NewDeliveryCard";
import DeliveryDetailCard from "./components/DeliveryDetailCard";

const { Text } = Typography;
const { RangePicker } = DatePicker;

const API_URL = "https://prn232.freeddns.org/customer-service/api/orders";

/* ----------------------------- TOKEN HELPER ----------------------------- */
function getTokenFromLocalStorage() {
  const keys = ["access_token", "token", "authToken", "jwt"];
  for (const k of keys) {
    const v = window.localStorage.getItem(k);
    if (v) return v;
  }
  return null;
}

/* ------------------------- STATUS + COLOR MAPPING ------------------------ */
/** Bảng màu vivid cho badge/tag/ribbon */
const statusMap = {
  preparing: {
    label: "Đang chuẩn bị",
    tagColor: "#F59E0B", // amber-500
    ribbonColor: "#FBBF24", // amber-400
    progress: "w-1/6",
  },
  shipped_from_warehouse: {
    label: "Đã xuất kho",
    tagColor: "#FB923C", // orange-400
    ribbonColor: "#F97316", // orange-500
    progress: "w-2/6",
  },
  in_transit: {
    label: "Đang vận chuyển",
    tagColor: "#3B82F6", // blue-500
    ribbonColor: "#60A5FA", // blue-400
    progress: "w-3/6",
  },
  arrived_hub: {
    label: "Đã đến điểm trung chuyển",
    tagColor: "#8B5CF6", // violet-500
    ribbonColor: "#A78BFA", // violet-400
    progress: "w-4/6",
  },
  out_for_delivery: {
    label: "Đang giao hàng",
    tagColor: "#6366F1", // indigo-500
    ribbonColor: "#818CF8", // indigo-400
    progress: "w-5/6",
  },
  delivered: {
    label: "Đã hoàn thành",
    tagColor: "#22C55E", // green-500
    ribbonColor: "#34D399", // emerald-400
    progress: "w-full",
  },
  failed: {
    label: "Giao hàng thất bại",
    tagColor: "#EF4444", // red-500
    ribbonColor: "#F87171", // red-400
    progress: "w-full",
  },
  pending: {
    label: "Đang chờ",
    tagColor: "#9CA3AF", // gray-400
    ribbonColor: "#9CA3AF",
    progress: "w-0",
  },
};

/** Chuẩn hoá text để map alias: bỏ dấu, hạ thường, bỏ phần trong ngoặc */
function normalizeStatusText(s) {
  if (!s) return "";
  let x = String(s)
    .toLowerCase()
    .replace(/\(.*?\)/g, "") // bỏ nội dung trong ()
    .trim();
  x = x.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // bỏ dấu
  return x;
}

/** Alias VN/EN → enum API (nhận cả nhãn có "(...)" ở dropdown) */
const STATUS_ALIASES = {
  "dang chuan bi": "preparing",
  preparing: "preparing",

  "da xuat kho": "shipped_from_warehouse",
  "shipped from warehouse": "shipped_from_warehouse",

  "dang van chuyen": "in_transit",
  "in transit": "in_transit",

  "da den diem trung chuyen": "arrived_hub",
  arrived: "arrived_hub",

  "dang giao hang": "out_for_delivery",
  "out for delivery": "out_for_delivery",

  "da hoan thanh": "delivered",
  completed: "delivered",
  delivered: "delivered",

  "giao hang that bai": "failed",
  "delivery failed": "failed",
  failed: "failed",

  "dang cho": "pending",
  waiting: "pending",
  pending: "pending",
};

/** VN label -> enum API map trực tiếp từ statusMap */
const vnToApi = Object.entries(statusMap).reduce((acc, [apiKey, v]) => {
  acc[v.label] = apiKey;
  return acc;
}, {});

/** Map mọi kiểu status về object hiển thị (label, màu, progress) */
function mapStatus(status) {
  if (!status)
    return { label: "Đang chờ", tagColor: "#9CA3AF", ribbonColor: "#9CA3AF", progress: "w-0" };

  // Nếu là enum API
  const asKey = String(status).toLowerCase();
  if (statusMap[asKey]) return statusMap[asKey];

  // Nếu là nhãn VN
  if (vnToApi[status] && statusMap[vnToApi[status]]) return statusMap[vnToApi[status]];

  // Nếu là chuỗi có alias/ngoặc
  const norm = normalizeStatusText(status);
  const alias = STATUS_ALIASES[norm];
  if (alias && statusMap[alias]) return statusMap[alias];

  // Fallback
  return { label: status, tagColor: "#9CA3AF", ribbonColor: "#9CA3AF", progress: "w-1/4" };
}

/** Trả enum API từ enum/nhãn/alias */
function toApiStatus(status) {
  if (!status) return "pending";
  const asKey = String(status).toLowerCase();
  if (statusMap[asKey]) return asKey; // đã là enum
  if (vnToApi[status]) return vnToApi[status]; // là nhãn VN
  const norm = normalizeStatusText(status);
  return STATUS_ALIASES[norm] || "pending"; // là alias
}

/* ----------------------------- FORMAT HELPERS ---------------------------- */
function formatCar(brand, modelName, color) {
  const parts = [brand, modelName].filter(Boolean).join(" ");
  return [parts, color ? `(${color})` : ""].filter(Boolean).join(" ");
}

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

/** Convert progress class w-x/6 to percent for antd Progress */
function progressToPercent(progressClass) {
  if (!progressClass) return 0;
  if (progressClass === "w-full") return 100;
  const match = progressClass.match(/w-(\d)\/6/);
  if (match) {
    const step = Number(match[1]);
    return Math.round((step / 6) * 100);
  }
  if (progressClass === "w-0") return 0;
  return 25;
}

/** Thứ tự 1→6 theo yêu cầu */
const STEP_ORDER = [
  "preparing", // 1
  "shipped_from_warehouse", // 2
  "in_transit", // 3
  "arrived_hub", // 4
  "out_for_delivery", // 5
  "delivered", // 6
];

/** Map status → index step (0..5). 'failed' sẽ hiển thị error ở step cuối. */
function statusToStepIndex(statusLike) {
  const api = toApiStatus(statusLike);
  if (api === "failed") return 5;
  const idx = STEP_ORDER.indexOf(api);
  return idx >= 0 ? idx : 0;
}

/* --------------------------------- MAIN --------------------------------- */
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

  // UI filters
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [dateRange, setDateRange] = useState(null);
  const [brandModel, setBrandModel] = useState("");

  // Load danh sách orders
  const loadDeliveries = async () => {
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
          brand: o.brand,
          modelName: o.modelName,
          color: o.color,
          address: o.deliveryAddress || "",
          time: formatDate(o.deliveryDate),
          status: st.label, // VN label để hiển thị
          _raw: o,
          _style: st, // chứa tagColor, ribbonColor, progress
        };
      });

      setDeliveriesList(mapped);
    } catch (e) {
      setErr(e.message || "Đã xảy ra lỗi khi tải đơn giao hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  const handleAddNewDelivery = () => {
    // reload để có dữ liệu mới
    loadDeliveries();
  };

  const handleViewDetail = (delivery) => {
    setSelectedDelivery(delivery);
    setShowDeliveryDetail(true);
  };

  /** Cập nhật trạng thái NGAY (optimistic), không reload list */
  const handleUpdateStatus = (deliveryId, newStatus) => {
    const apiKey = toApiStatus(newStatus); // chấp nhận enum/nhãn/alias có ()
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
    // Không reload; giả định modal đã gọi API update thành công.
  };

  /* ---------------------------- FILTER + SEARCH --------------------------- */
  const filteredDeliveries = useMemo(() => {
    let list = deliveriesList;

    const q = searchTerm.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (d) =>
          (d.id || "").toLowerCase().includes(q) ||
          (d.customer || "").toLowerCase().includes(q) ||
          (d.car || "").toLowerCase().includes(q)
      );
    }

    if (statusFilter) list = list.filter((d) => d.status === statusFilter);

    const bm = brandModel.trim().toLowerCase();
    if (bm) {
      list = list.filter(
        (d) =>
          (d.brand || "").toLowerCase().includes(bm) ||
          (d.modelName || "").toLowerCase().includes(bm) ||
          (d.color || "").toLowerCase().includes(bm)
      );
    }

    if (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
      const [start, end] = dateRange;
      const startMs = start.startOf("day").valueOf();
      const endMs = end.endOf("day").valueOf();
      list = list.filter((d) => {
        if (!d.time) return false;
        const ms = new Date(d.time.replace(" 00:00", "T00:00:00")).getTime();
        return ms >= startMs && ms <= endMs;
      });
    }

    return list;
  }, [searchTerm, deliveriesList, statusFilter, dateRange, brandModel]);

  // Reset page khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateRange, brandModel]);

  const paginatedDeliveries = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredDeliveries.slice(startIndex, endIndex);
  }, [filteredDeliveries, currentPage, pageSize]);

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const statusOptions = useMemo(
    () =>
      Object.values(statusMap).map((s) => ({
        label: s.label,
        value: s.label,
      })),
    []
  );

  /* --------------------------------- UI --------------------------------- */
  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: "#1677ff", borderRadius: 12 },
      }}
    >
      <div className="p-6">
        {/* Header */}
        <Row align="middle" justify="space-between" gutter={[16, 16]} className="mb-4">
          <Col>
            <Space size={12} align="center">
              <h1 className="text-xl font-semibold m-0">Theo dõi Giao hàng</h1>
              <Tooltip title="Tải lại danh sách">
                <Button icon={<ReloadOutlined />} onClick={loadDeliveries} />
              </Tooltip>
              {err && <Tag color="#ff4d4f">⚠️ {err}</Tag>}
            </Space>
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowNewDeliveryCard(true)}>
              Thêm Giao hàng Mới
            </Button>
          </Col>
        </Row>

        {/* Filters */}
        <Card size="small" className="mb-4" bordered>
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} md={8}>
              <Input
                allowClear
                prefix={<SearchOutlined />}
                placeholder="Tìm mã đơn, khách hàng, xe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col xs={24} md={6}>
              <Select
                allowClear
                placeholder="Trạng thái"
                options={statusOptions}
                value={statusFilter}
                onChange={setStatusFilter}
                className="w-full"
              />
            </Col>
            <Col xs={24} md={6}>
              <Input
                allowClear
                placeholder="Hãng / Đời / Màu"
                value={brandModel}
                onChange={(e) => setBrandModel(e.target.value)}
              />
            </Col>
            <Col xs={24} md={8}>
              <RangePicker
                className="w-full"
                placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
                value={dateRange}
                onChange={setDateRange}
                allowClear
              />
            </Col>
            <Col xs={24} md="auto">
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter(undefined);
                  setBrandModel("");
                  setDateRange(null);
                }}
              >
                Xóa lọc
              </Button>
            </Col>
          </Row>
        </Card>

        {/* List */}
        {loading ? (
          <Row gutter={[16, 16]}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Col xs={24} sm={12} md={8} lg={6} key={i}>
                <Card loading />
              </Col>
            ))}
          </Row>
        ) : paginatedDeliveries.length === 0 ? (
          <Card>
            <Empty description="Không có đơn hàng phù hợp" />
          </Card>
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {paginatedDeliveries.map((d) => {
                const percent = progressToPercent(d._style?.progress);
                const stepIndex = statusToStepIndex(d.status);
                const apiStatus = toApiStatus(d.status);
                const ribbonColor = d._style?.ribbonColor || "#9CA3AF";
                const tagColor = d._style?.tagColor || "#9CA3AF";

                const initials = (d.customer || "")
                  .split(" ")
                  .map((s) => s[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <Col xs={24} sm={12} md={8} lg={6} key={d.id}>
                    <Badge.Ribbon text={d.status} color={ribbonColor} style={{ color: "#fff" }}>
                      <Card
                        hoverable
                        styles={{ body: { paddingTop: 14, paddingBottom: 16 } }}
                        title={
                          <Space align="center">
                            <Avatar size={36} style={{ background: "#e6f4ff", color: "#1677ff" }}>
                              {initials || <UserOutlined />}
                            </Avatar>
                            <div>
                              <div className="text-xs text-gray-500">Mã đơn</div>
                              <Text strong>{d.id}</Text>
                            </div>
                          </Space>
                        }
                        extra={
                          <Button type="link" onClick={() => handleViewDetail(d)} icon={<InfoCircleOutlined />}>
                            Chi tiết
                          </Button>
                        }
                      >
                        <Space direction="vertical" size={10} className="w-full">
                          <Space size={8}>
                            <UserOutlined style={{ opacity: 0.65 }} />
                            <Text>{d.customer}</Text>
                          </Space>
                          <Space size={8}>
                            <CarOutlined style={{ opacity: 0.65 }} />
                            <Text>{d.car}</Text>
                          </Space>
                          <Space size={8}>
                            <EnvironmentOutlined style={{ opacity: 0.65 }} />
                            <Text ellipsis={{ tooltip: d.address }} style={{ width: "100%" }}>
                              {d.address || "-"}
                            </Text>
                          </Space>
                          <Space size={8}>
                            <CalendarOutlined style={{ opacity: 0.65 }} />
                            <Text>{d.time}</Text>
                          </Space>

                          <Divider style={{ margin: "8px 0" }} />

                          {/* Steps theo thứ tự 1→6 */}
                          <Steps
                            size="small"
                            current={stepIndex}
                            items={[
                              { title: "Chuẩn bị" }, // 1
                              { title: "Xuất kho" }, // 2
                              { title: "Vận chuyển" }, // 3
                              { title: "Trung chuyển" }, // 4
                              { title: "Giao hàng" }, // 5
                              { title: "Hoàn thành" }, // 6
                            ]}
                            status={
                              apiStatus === "failed"
                                ? "error"
                                : apiStatus === "delivered"
                                ? "finish"
                                : "process"
                            }
                          />

                          {/* Progress mảnh */}
                          <Progress
                            percent={percent}
                            size="small"
                            style={{ marginTop: 4 }}
                            status={
                              apiStatus === "failed"
                                ? "exception"
                                : apiStatus === "delivered"
                                ? "success"
                                : "active"
                            }
                            showInfo={false}
                          />

                          {/* Badge trạng thái (màu vivid) */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Tag color={tagColor} style={{ color: "#fff", border: "none" }}>
                              {d.status}
                            </Tag>
                            <Tooltip title="Xem chi tiết">
                              <Button size="small" onClick={() => handleViewDetail(d)}>
                                Mở
                              </Button>
                            </Tooltip>
                          </div>
                        </Space>
                      </Card>
                    </Badge.Ribbon>
                  </Col>
                );
              })}
            </Row>

            {/* Pagination */}
            <div className="flex justify-center mt-6">
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

        {/* Modals */}
        <NewDeliveryCard
          isOpen={showNewDeliveryCard}
          onClose={() => setShowNewDeliveryCard(false)}
          onSubmit={handleAddNewDelivery}
        />

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
    </ConfigProvider>
  );
}
