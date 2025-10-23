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
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SyncOutlined,
} from "@ant-design/icons";

/** ===== Config ===== */
const SHORT_ID_LEN = 8;
const STATUS_OPTIONS = [
  "received",
  "approved",
  "rejected",
  "assigned",
  "in_transit",
  "at_dealer",
  "delivered",
  "cancelled",
];

const STATUS_META = {
  received: { label: "Đã nhận yêu cầu", color: "default" },
  approved: { label: "Đã duyệt", color: "blue" },
  rejected: { label: "Từ chối", color: "red" },
  assigned: { label: "Đã phân xe", color: "purple" },
  in_transit: { label: "Đang vận chuyển", color: "gold" },
  at_dealer: { label: "Tại đại lý", color: "cyan" },
  delivered: { label: "Đã giao", color: "green" },
  cancelled: { label: "Đã hủy", color: "volcano" },
};

const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOiJhNzRlOWUwMy03YzRkLTQ0ZDAtOGY0Yy0wZjAxODRiN2U2ZjQiLCJSb2xlSWQiOiI0IiwiUm9sZU5hbWUiOiJEZWFsZXIgU3RhZmYiLCJEZWFsZXJJZCI6ImViODAyYjcxLTRhZTAtNGNiMy1iYzg1LThjNTZmNjdiZDc1NyIsIm5iZiI6MTc2MTE0NjUxMCwiZXhwIjoxNzY5MDk1MzEwLCJpYXQiOjE3NjExNDY1MTAsImlzcyI6IkVWTSIsImF1ZCI6IlVzZXIifQ.Pr-9xC1ZungY2cTIIDUeFs7lHr6Sm2L0spguOLRaCpY";

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

  // Fetch list
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setLoadErr("");
        const res = await fetch(
          "https://prn232.freeddns.org/order-service/api/VehicleAllocation?pageNumber=1&pageSize=10",
          {
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${TOKEN}`,
            },
          }
        );
        const json = await res.json();
        if (json.status === 200 && json.data?.items) {
          const mapped = json.data.items.map((item) => ({
            key: item.allocationId,
            id: item.allocationId,
            idShort: shortId(item.allocationId),
            car: item.vehicleName,
            destination: item.dealerName,
            quantity: item.quantity,
            date: item.requestDate,
            status: item.status,
          }));
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
    })();
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
      render: (v) =>
        v ? new Date(v).toLocaleString() : <Typography.Text type="secondary">-</Typography.Text>,
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
            icon={<EyeOutlined />}
            onClick={() => message.info(`Xem ${record.id}`)}
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
            onConfirm={() => message.success(`${record.id} đã xóa (mock)`)}
          >
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

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
        <Button type="primary" icon={<SyncOutlined />} onClick={() => openModal(null)}>
          Cập nhật trạng thái
        </Button>
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
          dataSource={data}
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
              options={STATUS_OPTIONS.map((s) => ({
                value: s,
                label: STATUS_META[s]?.label || s,
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
