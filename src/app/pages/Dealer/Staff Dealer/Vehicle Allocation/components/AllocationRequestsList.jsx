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
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { RangePicker } = DatePicker;

/** ===== Config ===== */
const SHORT_ID_LEN = 8;
/** ===== Config (STATUS for allocation) ===== */
// Unified with distribution statuses
const STATUS_OPTIONS = [
  "pending",
  "shipping",
  "received",
  "cancelled",
  "rejected",
];

const STATUS_META = {
  pending:   { label: "Đang chờ",         color: "gold" },
  shipping:  { label: "Đang vận chuyển",  color: "processing" },
  received:  { label: "Đã nhận xe",          color: "green" },
  cancelled: { label: "Đã hủy",           color: "volcano" },
  rejected:  { label: "Từ chối",          color: "red" },
};

/** =======================
 *  TOKEN
 *  =======================
 *  ❌ Trước đây (lỗi): const TOKEN = localStorage.getItem("token");
 *  ✅ Sửa thành hàm lấy token tại thời điểm gọi API
 */
const getToken = () => localStorage.getItem("token") || ""; // [CHANGE]

/** ===== Helpers ===== */
function shortId(id = "") {
  if (!id) return "";
  return id.length > SHORT_ID_LEN ? id.slice(0, SHORT_ID_LEN) + "…" : id;
}

function StatusTag({ value }) {
  const meta = STATUS_META[value] || { label: value || "-", color: "default" };
  return <Tag color={meta.color}>{meta.label}</Tag>;
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

  // ===== NEW: local search & filter states =====
  const [kw, setKw] = useState("");                         // tìm theo ID/xe/đại lý
  const [statusFilter, setStatusFilter] = useState([]);     // lọc theo trạng thái (multi)
  const [dateRange, setDateRange] = useState(null);         // lọc theo khoảng ngày yêu cầu (RangePicker)

  // ===== Extract fetch logic to a function so we can call it again on demand
  const fetchList = async () => {
    try {
      setLoading(true);
      setLoadErr("");
      const res = await fetch(
        "https://prn232.freeddns.org/order-service/api/VehicleAllocation?pageNumber=1&pageSize=100",
        {
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${getToken()}`, // [CHANGE]
          },
        }
      );
      const json = await res.json();
      if (json.status === 200 && json.data?.items) {
        const mapped = json.data.items.map((item) => ({
          key: item.allocationId,
          id: item.allocationId,
          idShort: shortId(item.allocationId),
          car:
            (item.vehicleName || "") +
            (item.versionName ? " " + item.versionName : "") +
            (item.color ? " " + item.color : "") +
            (item.evType ? ` - ${item.evType}` : ""),
          destination: item.dealerName,
          quantity: item.quantity,
          date: item.requestDate,
          status: item.status,
        }));
        // giữ nguyên logic cũ: sort theo requestDate giảm dần
        mapped.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        setData(mapped);
      } else {
        throw new Error("Không thể tải dữ liệu.");
      }
    } catch (err) {
      setLoadErr(err.message || "Lỗi không xác định.");
    } finally {
      setLoading(false);
    }
  };

  // Lần đầu load
  useEffect(() => {
    fetchList();
  }, []);

  // Nghe sự kiện từ AllocationRequest để refetch -> item mới nằm đầu list
  useEffect(() => {
    const onRefresh = () => fetchList();
    window.addEventListener("allocation:refresh", onRefresh);
    return () => window.removeEventListener("allocation:refresh", onRefresh);
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
      message.warning("Vui lòng nhập ID và chọn trạng thái");
      return;
    }
    // Prevent invalid transitions: received -> cancelled and cancelled -> received
    try {
      // If current is 'rejected' it's terminal: do not allow any update
      if ((current?.status || "").toString().toLowerCase() === "rejected") {
        message.warning("Không thể cập nhật trạng thái khi trạng thái hiện tại là 'Từ chối'.");
        return;
      }
      const cur = (current?.status || "").toString().toLowerCase();
      const next = (status || "").toString().toLowerCase();
      if (cur === "received" && next === "cancelled") {
        message.warning("Không thể đổi trạng thái từ 'Đã nhận' sang 'Đã hủy'.");
        return;
      }
      if (cur === "cancelled" && next === "received") {
        message.warning("Không thể đổi trạng thái từ 'Đã hủy' sang 'Đã nhận'.");
        return;
      }
    } catch (e) {
      // ignore
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
            "Content-Type": "application/json", // nếu server yêu cầu text/plain: đổi thành text/plain và body: status
            accept: "*/*",
            Authorization: `Bearer ${getToken()}`, // [CHANGE]
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

      // Update ngay trong table
      setData((prev) =>
        prev.map((row) => (row.id === id ? { ...row, status } : row))
      );

      setLastUpdated({ id, status, at: new Date().toLocaleString() });
      message.success("Cập nhật trạng thái thành công");
      setOpen(false);
      form.resetFields();
    } catch (err) {
      message.error(err.message || "Có lỗi khi cập nhật trạng thái");
    } finally {
      setUpdating(false);
    }
  };

  // ===== NEW: derive filtered data on client =====
  const filteredData = useMemo(() => {
    const q = kw.trim().toLowerCase();
    const [start, end] = Array.isArray(dateRange) ? dateRange : [null, null];

    return data.filter((row) => {
      // keyword match (ID / car / destination)
      const kwOk =
        !q ||
        (row.id && row.id.toLowerCase().includes(q)) ||
        (row.car && row.car.toLowerCase().includes(q)) ||
        (row.destination && row.destination.toLowerCase().includes(q));

      // status match
      const statusOk =
        !statusFilter?.length || statusFilter.includes(row.status);

      // date range match
      let dateOk = true;
      if (start && end) {
        const rowDate = row.date ? new Date(row.date) : null;
        if (!rowDate) {
          dateOk = false;
        } else {
          // RangePicker (antd v5) trả Dayjs -> dùng toDate()
          const s = start.startOf("day").toDate();
          const e = end.endOf("day").toDate();
          dateOk = rowDate >= s && rowDate <= e;
        }
      }

      return kwOk && statusOk && dateOk;
    });
  }, [data, kw, statusFilter, dateRange]);

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
      dataIndex: "date",
      width: 180,
      // Hiển thị chỉ phần ngày, bỏ giờ
      render: (v) =>
        v ? new Date(v).toLocaleDateString() : <Typography.Text type="secondary">-</Typography.Text>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 160,
      render: (v) => <StatusTag value={v} />,
      filters: STATUS_OPTIONS.map((s) => ({
        text: STATUS_META[s]?.label || s,
        value: s,
      })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Hành động",
      key: "actions",
      width: 170,
      render: (_, record) => (
        <Space>
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
            onConfirm={() => message.success(`${record.id} đã xóa (mock)`)}
          >
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ===== NEW: reset all filters =====
  const resetFilters = () => {
    setKw("");
    setStatusFilter([]);
    setDateRange(null);
  };

  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 16 }}>
      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Các yêu cầu phân bổ hiện có
          </Typography.Title>
          <Typography.Text type="secondary">
            Theo dõi trạng thái và cập nhật trực tiếp.
          </Typography.Text>
        </div>
        {/* Top-level update button removed per request */}
      </Space>

      {/* ===== NEW: Filter bar ===== */}
      <Space
        size={[12, 12]}
        wrap
        style={{ width: "100%", marginBottom: 12, display: "flex", justifyContent: "space-between" }}
      >
        <Input.Search
          allowClear
          style={{ maxWidth: 360, width: "100%" }}
          placeholder="Tìm theo ID / Xe / Đại lý…"
          value={kw}
          onChange={(e) => setKw(e.target.value)}
        />
        <Space wrap>
          <Select
            mode="multiple"
            allowClear
            placeholder="Trạng thái"
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS.map((s) => ({
              value: s,
              label: STATUS_META[s]?.label || s,
            }))}
            style={{ minWidth: 220 }}
            maxTagCount="responsive"
          />
          <RangePicker
            allowClear
            value={dateRange || null}
            onChange={setDateRange}
            placeholder={["Từ ngày", "Đến ngày"]}
          />
          <Button onClick={resetFilters}>Xóa lọc</Button>
        </Space>
      </Space>

      {lastUpdated && lastUpdated.id ? (
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
          dataSource={filteredData}  // ===== NEW: áp dụng dữ liệu đã lọc
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          bordered
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
              options={["received", "cancelled"].map((s) => ({
                value: s,
                label: STATUS_META[s]?.label || s,
                // If record is rejected, disable all options. Also keep previous received<->cancelled disable logic.
                disabled: current?.status
                  ? ((current.status.toString().toLowerCase() === "rejected") ||
                      (current.status.toString().toLowerCase() === "received" && s === "cancelled") ||
                      (current.status.toString().toLowerCase() === "cancelled" && s === "received"))
                  : false,
              }))}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
