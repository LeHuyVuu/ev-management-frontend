import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Modal,
  Select,
  Form,
  Input,
  Space,
  Typography,
  message,
  Popconfirm,
  Alert,
  DatePicker,
  InputNumber,
  Divider,
  Tooltip,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SyncOutlined,
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

/** ===== Config ===== */
const SHORT_ID_LEN = 8;
/** ===== Config (STATUS for distribution) ===== */
const STATUS_OPTIONS = [
  "pending",
  "shipping",
  "received",
  "cancelled",
  "rejected",
];

const STATUS_META = {
  pending: { label: "Đang chờ", color: "gold" },
  shipping: { label: "Đang vận chuyển", color: "processing" },
  received: { label: "Đã nhận", color: "green" },
  cancelled: { label: "Đã hủy", color: "volcano" },
  rejected: { label: "Từ chối", color: "red" },
};

const TOKEN =
  (typeof window !== "undefined" && localStorage.getItem("token")) || "";

/** ===== Helpers ===== */
function shortId(id = "") {
  if (!id) return "";
  return id.length > SHORT_ID_LEN ? id.slice(0, SHORT_ID_LEN) + "…" : id;
}

function toTimestampOrInf(d) {
  if (!d) return Infinity;
  const t = new Date(d).getTime();
  return Number.isFinite(t) ? t : Infinity;
}

function StatusTag({ value }) {
  const meta = STATUS_META[value] || { label: value || "-", color: "default" };
  return <Tag color={meta.color}>{meta.label}</Tag>;
}

function includesText(hay = "", needle = "") {
  return String(hay).toLowerCase().includes(String(needle).toLowerCase());
}

function inRangeDate(iso, start, end) {
  if (!iso) return false;
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return false;
  const s = start ? start.startOf("day").valueOf() : -Infinity;
  const e = end ? end.endOf("day").valueOf() : Infinity;
  return ts >= s && ts <= e;
}

/** ===== Component ===== */
export default function AllocationRequestsList() {
  const [data, setData] = useState([]); // rows
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState("");

  // Update modal state
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [current, setCurrent] = useState(null); // record đang update
  const [form] = Form.useForm();

  const [lastUpdated, setLastUpdated] = useState(null); // {id,status,at}

  // AntD message & modal (context-based API)
  const [messageApi, messageContextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();

  // =========== NEW: Filter states ===========
  const [q, setQ] = useState(""); // keyword search
  const [fStatuses, setFStatuses] = useState([]); // multiple statuses
  const [fDestinations, setFDestinations] = useState([]); // multiple dealers
  const [fReqRange, setFReqRange] = useState([null, null]); // [start,end] dayjs
  const [fDelRange, setFDelRange] = useState([null, null]); // [start,end] dayjs
  const [fQtyMin, setFQtyMin] = useState(null);
  const [fQtyMax, setFQtyMax] = useState(null);

  // =========== NEW: Filter states ===========
  const [q, setQ] = useState(""); // keyword search
  const [fStatuses, setFStatuses] = useState([]); // multiple statuses
  const [fDestinations, setFDestinations] = useState([]); // multiple dealers
  const [fReqRange, setFReqRange] = useState([null, null]); // [start,end] dayjs
  const [fDelRange, setFDelRange] = useState([null, null]); // [start,end] dayjs
  const [fQtyMin, setFQtyMin] = useState(null);
  const [fQtyMax, setFQtyMax] = useState(null);

  // ===== Pagination (server-side) =====
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchList = async (pageParams = {}) => {
    const { current = pagination.current, pageSize = pagination.pageSize } =
      pageParams;
    try {
      setLoading(true);
      setLoadErr("");
      const url = new URL(
        "https://prn232.freeddns.org/order-service/api/VehicleAllocation"
      );
      url.searchParams.set("pageNumber", String(current));
      url.searchParams.set("pageSize", String(pageSize));

      const res = await fetch(url.toString(), {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${TOKEN}`,
        },
      });
      const json = await res.json();

      if (json.status === 200 && json.data?.items) {
        const mapped = json.data.items.map((item) => ({
          key: item.allocationId,
          id: item.allocationId,
          idShort: shortId(item.allocationId),
          car: item.vehicleName,
          destination: item.dealerName,
          quantity: item.quantity,
          requestDate: item.requestDate,
          deliveryDate: item.expectedDelivery,
          status: item.status,
        }));

        // Optional client-side ordering within the current page
        mapped.sort(
          (a, b) =>
            toTimestampOrInf(a.deliveryDate) - toTimestampOrInf(b.deliveryDate)
        );
        setData(mapped);

        // Try to extract pagination meta from backend; fallback to passed-in values
        const total =
          json.data?.totalItems ??
          json.data?.totalCount ??
          json.data?.total ??
          0;
        const pageNum = json.data?.pageNumber ?? current;
        const size = json.data?.pageSize ?? pageSize;
        setPagination((prev) => ({
          ...prev,
          current: pageNum,
          pageSize: size,
          total,
        }));
      } else {
        throw new Error(json?.message || "Không thể tải dữ liệu.");
      }
    } catch (err) {
      setLoadErr(err.message || "Lỗi không xác định.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch list on mount
  useEffect(() => {
    fetchList({ current: 1, pageSize: 10 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Open modal (prefill)
  const openModal = (record) => {
    setCurrent(record || null);
    form.setFieldsValue({
      id: record?.id || "",
      status: record?.status || "",
    });
    setOpen(true);
  };

  const handleCancel = () => {
    if (updating) return;
    setOpen(false);
    form.resetFields();
  };

  // Submit update
  const onFinish = async (values) => {
    const { id, status } = values || {};
    if (!id || !status) {
      messageApi.warning("Vui lòng nhập ID và chọn trạng thái");
      return;
    }

    // ==== Chặn chọn trạng thái "trên" (trước) trạng thái hiện tại ====
    const prev = current?.status;
    if (prev) {
      const prevIdx = STATUS_OPTIONS.indexOf(prev);
      const nextIdx = STATUS_OPTIONS.indexOf(status);
      if (prevIdx !== -1 && nextIdx !== -1 && nextIdx < prevIdx) {
        messageApi.warning("Không thể quay lại trạng thái trước đó");
        return;
      }
    }

    try {
      setUpdating(true);
      const resp = await fetch(
        `https://prn232.freeddns.org/order-service/api/VehicleAllocation/${encodeURIComponent(
          id
        )}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json", // nếu server yêu cầu text/plain: đổi "application/json" -> "text/plain" và body: status
            accept: "*/*",
            Authorization: `Bearer ${TOKEN}`,
          },
          body: JSON.stringify(status), // backend khai báo body là "string"
        }
      );
      if (!resp.ok) {
        let msg = `Cập nhật thất bại (HTTP ${resp.status}).`;
        try {
          const j = await resp.json();
          msg = j?.message || msg;
        } catch {}
        throw new Error(msg);
      }

      // Update ngay trong table (giữ nguyên page hiện tại)
      setData((prevRows) =>
        prevRows.map((row) => (row.id === id ? { ...row, status } : row))
      );

      setLastUpdated({ id, status, at: new Date().toLocaleString() });
      messageApi.success("Cập nhật trạng thái thành công");
      setOpen(false);
      form.resetFields();
    } catch (err) {
      messageApi.error(err.message || "Có lỗi khi cập nhật trạng thái");
    } finally {
      setUpdating(false);
    }
  };

  // ========= NEW: derive destinations for filter =========
  const destinationOptions = useMemo(() => {
    const set = new Set();
    data.forEach((r) => r.destination && set.add(r.destination));
    return Array.from(set).map((d) => ({ label: d, value: d }));
  }, [data]);

  // ========= NEW: filtered dataset (does NOT change original logic unless filters active) =========
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // keyword over id, car, destination, status
      if (q) {
        const ok =
          includesText(row.id, q) ||
          includesText(row.car, q) ||
          includesText(row.destination, q) ||
          includesText(row.status, q);
        if (!ok) return false;
      }
      // status multi
      if (fStatuses.length > 0 && !fStatuses.includes(row.status)) return false;
      // destination multi
      if (fDestinations.length > 0 && !fDestinations.includes(row.destination)) return false;
      // quantity range
      if (fQtyMin != null && Number(row.quantity) < Number(fQtyMin)) return false;
      if (fQtyMax != null && Number(row.quantity) > Number(fQtyMax)) return false;
      // requestDate range
      if ((fReqRange[0] || fReqRange[1]) && !inRangeDate(row.requestDate, fReqRange[0], fReqRange[1])) {
        return false;
      }
      // deliveryDate range
      if ((fDelRange[0] || fDelRange[1]) && !inRangeDate(row.deliveryDate, fDelRange[0], fDelRange[1])) {
        return false;
      }
      return true;
    });
  }, [data, q, fStatuses, fDestinations, fQtyMin, fQtyMax, fReqRange, fDelRange]);

  const columns = [
    {
      title: "ID",
      dataIndex: "idShort",
      width: 120,
      render: (val, row) => (
        <Typography.Text copyable={{ text: row.id }} title={row.id}>
          {val}
        </Typography.Text>
      ),
    },
    { title: "Xe", dataIndex: "car", ellipsis: true },
    { title: "Địa điểm đến", dataIndex: "destination", ellipsis: true },
    {
      title: "SL",
      dataIndex: "quantity",
      width: 80,
      align: "center",
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "requestDate",
      width: 160,
      sorter: (a, b) =>
        toTimestampOrInf(a.requestDate) - toTimestampOrInf(b.requestDate),
      render: (v) =>
        v ? (
          new Date(v).toLocaleDateString()
        ) : (
          <Typography.Text type="secondary">-</Typography.Text>
        ),
    },
    {
      title: "Dự kiến giao",
      dataIndex: "deliveryDate",
      width: 160,
      sorter: (a, b) =>
        toTimestampOrInf(a.deliveryDate) - toTimestampOrInf(b.deliveryDate),
      render: (v) =>
        v ? (
          new Date(v).toLocaleDateString()
        ) : (
          <Typography.Text type="secondary">-</Typography.Text>
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 160,
      render: (v) => <StatusTag value={v} />,
      // Giữ nguyên filter của Table (song song với filter bar)
      filters: STATUS_OPTIONS.map((s) => ({
        text: STATUS_META[s]?.label || s,
        value: s,
      })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Hành động",
      key: "actions",
      width: 210,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              modal.info({
                title: "Chi tiết yêu cầu phân bổ",
                content: (
                  <div>
                    <p><strong>ID:</strong> {record.id}</p>
                    <p><strong>Xe:</strong> {record.car}</p>
                    <p><strong>Đại lý:</strong> {record.destination}</p>
                    <p><strong>Số lượng:</strong> {record.quantity}</p>
                    <p><strong>Ngày yêu cầu:</strong> {record.requestDate ? new Date(record.requestDate).toLocaleString() : "-"}</p>
                    <p><strong>Dự kiến giao:</strong> {record.deliveryDate ? new Date(record.deliveryDate).toLocaleString() : "-"}</p>
                    <p><strong>Trạng thái:</strong> <StatusTag value={record.status} /></p>
                  </div>
                ),
                width: 520,
                centered: true,
              });
            }}
          />
          <Button
            size="small"
            type="default"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            Cập nhật
          </Button>
          <Popconfirm
            title="Xóa (mock)?"
            description={`Xóa yêu cầu ${record.id}?`}
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => messageApi.success(`${record.id} đã xóa (mock)`)}
          ></Popconfirm>
        </Space>
      ),
    },
  ];

  // ========= NEW: clear filters =========
  const clearFilters = () => {
    setQ("");
    setFStatuses([]);
    setFDestinations([]);
    setFReqRange([null, null]);
    setFDelRange([null, null]);
    setFQtyMin(null);
    setFQtyMax(null);
  };

  // Handle table events (pagination / filters / sorters)
  const handleTableChange = (pag /*, filters, sorter*/) => {
    const { current, pageSize } = pag;
    setPagination((prev) => ({ ...prev, current, pageSize }));
    fetchList({ current, pageSize });
  };

  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 16 }}>
      {/* context holders cho message & modal */}
      {messageContextHolder}
      {modalContextHolder}

      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Các yêu cầu phân bổ từ các đại lý
          </Typography.Title>
          <Typography.Text type="secondary">
            
            Theo dõi trạng thái và cập nhật trực tiếp.
          
          </Typography.Text>
        </div>
        <Space>
          {/* <Button icon={<PlusOutlined />} onClick={() => messageApi.info("TODO: Create New Order")}>
            Tạo đơn mới
          </Button> */}
          <Button
            type="primary"
            icon={<SyncOutlined />}
            onClick={() => fetchList()}
            loading={loading}
          >
            Tải lại
          </Button>
        </Space>
      </Space>

      {/* ========= NEW: Filter Bar ========= */}
      <div
        style={{
          background: "#fafafa",
          border: "1px solid #f0f0f0",
          borderRadius: 10,
          padding: 12,
          marginBottom: 12,
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }} size={8}>
          <Space wrap style={{ width: "100%", justifyContent: "space-between" }}>
            <Space wrap>
              <Input
                allowClear
                style={{ width: 280 }}
                prefix={<SearchOutlined />}
                placeholder="Tìm (ID / Xe / Đại lý / Trạng thái)"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <Select
                allowClear
                mode="multiple"
                style={{ minWidth: 220 }}
                placeholder="Trạng thái"
                value={fStatuses}
                onChange={setFStatuses}
                options={STATUS_OPTIONS.map((s) => ({
                  value: s,
                  label: STATUS_META[s]?.label || s,
                }))}
                maxTagCount="responsive"
                suffixIcon={<FilterOutlined />}
              />
              <Select
                allowClear
                mode="multiple"
                style={{ minWidth: 240 }}
                placeholder="Đại lý"
                value={fDestinations}
                onChange={setFDestinations}
                options={destinationOptions}
                maxTagCount="responsive"
                suffixIcon={<FilterOutlined />}
              />
            </Space>
            <Space wrap>
              <Tooltip title="Xóa toàn bộ bộ lọc">
                <Button icon={<ClearOutlined />} onClick={clearFilters}>
                  Xóa lọc
                </Button>
              </Tooltip>
            </Space>
          </Space>

          <Divider style={{ margin: "8px 0" }} />

          <Space wrap>
            <Space direction="vertical" size={2}>
              <Typography.Text type="secondary">Khoảng ngày yêu cầu</Typography.Text>
              <DatePicker.RangePicker
                value={[
                  fReqRange[0],
                  fReqRange[1],
                ]}
                onChange={(vals) => setFReqRange(vals || [null, null])}
                allowEmpty={[true, true]}
                style={{ width: 280 }}
              />
            </Space>

            <Space direction="vertical" size={2}>
              <Typography.Text type="secondary">Khoảng ngày dự kiến giao</Typography.Text>
              <DatePicker.RangePicker
                value={[
                  fDelRange[0],
                  fDelRange[1],
                ]}
                onChange={(vals) => setFDelRange(vals || [null, null])}
                allowEmpty={[true, true]}
                style={{ width: 280 }}
              />
            </Space>

            <Space direction="vertical" size={2}>
              <Typography.Text type="secondary">Số lượng (từ / đến)</Typography.Text>
              <Space>
                <InputNumber
                  min={0}
                  placeholder="Từ"
                  value={fQtyMin}
                  onChange={setFQtyMin}
                  style={{ width: 120 }}
                />
                <InputNumber
                  min={0}
                  placeholder="Đến"
                  value={fQtyMax}
                  onChange={setFQtyMax}
                  style={{ width: 120 }}
                />
              </Space>
            </Space>
          </Space>
        </Space>
      </div>

      {lastUpdated?.id ? (
        <Alert
          style={{ marginBottom: 12 }}
          type="success"
          message={
            <>
              Đã cập nhật:&nbsp;
              <Typography.Text code>{shortId(lastUpdated.id)}</Typography.Text>
              &nbsp;→&nbsp;
              <StatusTag value={lastUpdated.status} /> lúc {lastUpdated.at}
            </>
          }
          showIcon
        />
      ) : null}

      {loadErr ? (
        <Alert type="error" message={loadErr} showIcon />
      ) : (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          bordered
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (t, range) => `${range[0]}-${range[1]} / ${t}`,
          }}
          onChange={handleTableChange}
        />
      )}

      {/* Modal cập nhật */}
      <Modal
        title="Cập nhật trạng thái"
        open={open}
        onCancel={handleCancel}
        okText="Cập nhật"
        confirmLoading={updating}
        onOk={() => form.submit()}
        destroyOnClose
        zIndex={2000}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ id: "", status: "" }}
        >
          <Form.Item
            name="id"
            label="Allocation ID"
            rules={[{ required: true, message: "Nhập Allocation ID" }]}
          >
            <Input placeholder="Nhập ID (UUID)" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Chọn trạng thái" }]}
          >
            <Select
              placeholder="Chọn trạng thái"
              // ⛔ Khóa toàn bộ khi đã received
              disabled={current?.status === "received"}
              options={STATUS_OPTIONS.map((s, i) => ({
                value: s,
                label: STATUS_META[s]?.label || s,
                // Giữ luật: không cho lùi (chỉ khi chưa received)
                disabled:
                  current?.status && current?.status !== "received"
                    ? i < STATUS_OPTIONS.indexOf(current.status)
                    : false,
              }))}
              showSearch
              optionFilterProp="label"
              getPopupContainer={(trigger) => trigger.parentElement}
              placement="bottomLeft"
              listHeight={256}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
