import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Space,
  Typography,
  message,
  Popconfirm,
  Alert,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

/** ===================== CONFIG ===================== */
const API_BASE = "https://prn232.freeddns.org";
const LIST_URL = `${API_BASE}/order-service/api/VehicleTransferOrder`;
const CREATE_URL = `${API_BASE}/order-service/api/VehicleTransferOrder`;
const UPDATE_STATUS_URL = (id) =>
  `${API_BASE}/order-service/api/VehicleTransferOrder/${encodeURIComponent(id)}/status`;

const DEALERS_URL = `${API_BASE}/dealer-service/api/Dealers?pageNumber=1&pageSize=1000`;
const VEHICLES_URL = `${API_BASE}/brand-service/api/vehicles?pageNumber=1&pageSize=1000`;

const PAGE_SIZE = 10;

// Nếu cần xác thực, gán token ở đây (Bearer ...). Nếu không, set TOKEN = null.
const TOKEN = localStorage.getItem("token");
/** Trạng thái → nhãn & màu AntD */
const STATUS_META = {
  processing: { label: "Processing", color: "gold" },
  pending: { label: "Pending", color: "default" },
  confirmed: { label: "Confirmed", color: "blue" },
  failed: { label: "Failed", color: "red" },
  cancelled: { label: "Cancelled", color: "volcano" },
  completed: { label: "Completed", color: "green" },
};
const STATUS_OPTIONS = Object.keys(STATUS_META).map((k) => ({
  value: k,
  label: STATUS_META[k].label,
}));

function StatusTag({ value }) {
  const meta = STATUS_META[value] || { label: value || "-", color: "default" };
  return <Tag color={meta.color}>{meta.label}</Tag>;
}

/** ===================== COMPONENT ===================== */
export default function OrderDistributionAnt() {
  // Table state
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Create modal
  const [openCreate, setOpenCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm] = Form.useForm();

  // Update status modal
  const [openUpdate, setOpenUpdate] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateForm] = Form.useForm();

  // Select options
  const [dealerOptions, setDealerOptions] = useState([]); // {value, label}
  const [vehicleOptions, setVehicleOptions] = useState([]); // {value, label}
  const [loadingDealers, setLoadingDealers] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  const headers = useMemo(() => {
    const h = { accept: "*/*" };
    if (TOKEN) h.Authorization = `Bearer ${TOKEN}`;
    return h;
  }, []);

  /** -------- Fetch list -------- */
  const fetchList = async (p = 1) => {
    try {
      setLoading(true);
      setLoadErr("");
      const url = `${LIST_URL}?pageNumber=${p}&pageSize=${PAGE_SIZE}`;
      const res = await fetch(url, { headers });
      const json = await res.json();
      if (json?.status !== 200) throw new Error(json?.message || "Fetch failed");
      const items = json?.data?.items || [];
      const mapped = items.map((it) => ({
        id: it.vehicleTransferOrderId,
        from: it.fromDealerName,
        to: it.toDealerName,
        product: it.vehicleName,
        quantity: it.quantity,
        date: it.requestDate,
        status: it.status,
      }));
      setRows(mapped);
      setTotal(json?.data?.totalItems ?? mapped.length);
      setPage(json?.data?.pageNumber ?? p);
    } catch (e) {
      setLoadErr(e?.message || "Không thể tải danh sách.");
      message.error(e?.message || "Load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(1);
  }, []);

  /** -------- Fetch dropdown options khi mở Create -------- */
  const fetchDealers = async () => {
    try {
      setLoadingDealers(true);
      const res = await fetch(DEALERS_URL, { headers: { accept: "*/*" } });
      const json = await res.json();
      const items = json?.data?.items ?? [];
      setDealerOptions(
        items.map((d) => ({
          value: d.dealerId,
          label: `${d.dealerCode ?? ""} — ${d.name ?? ""}`.trim(),
        }))
      );
    } catch (e) {
      message.error(e?.message || "Không tải được danh sách đại lý");
    } finally {
      setLoadingDealers(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      setLoadingVehicles(true);
      const res = await fetch(VEHICLES_URL, { headers: { accept: "*/*" } });
      const json = await res.json();
      const items = json?.data?.items ?? [];
      setVehicleOptions(
        items.map((v) => ({
          value: v.vehicleId, // dùng vehicleId làm value
          label: `${v.brand ?? ""} ${v.modelName ?? ""}`.trim(), // GHÉP brand + modelName
        }))
      );
    } catch (e) {
      message.error(e?.message || "Không tải được danh sách xe");
    } finally {
      setLoadingVehicles(false);
    }
  };

  useEffect(() => {
    if (openCreate) {
      if (dealerOptions.length === 0) fetchDealers();
      if (vehicleOptions.length === 0) fetchVehicles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openCreate]);

  /** -------- Create (POST) -------- */
  const submitCreate = async () => {
    try {
      const values = await createForm.validateFields();
      const payload = {
        fromDealerId: values.fromDealerId,
        toDealerId: values.toDealerId,
        // Backend expect vehicleVersionId; hiện dùng vehicleId từ Select để gửi theo field này
        vehicleVersionId: values.vehicleVersionId,
        quantity: Number(values.quantity),
        requestDate: values.requestDate
          ? values.requestDate.toDate().toISOString()
          : new Date().toISOString(),
        status: values.status || "processing",
      };

      setCreating(true);
      const res = await fetch(CREATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(payload),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(j?.message || `Create failed (HTTP ${res.status})`);
      }

      // Thêm vào bảng ngay
      const added = {
        id:
          j?.data?.vehicleTransferOrderId ||
          (crypto?.randomUUID ? crypto.randomUUID() : String(Date.now())),
        from: j?.data?.fromDealerName || "", // nếu backend trả, ưu tiên dùng
        to: j?.data?.toDealerName || "",
        product: j?.data?.vehicleName || "", // nếu backend chưa trả tên, có thể để trống
        quantity: payload.quantity,
        date: payload.requestDate,
        status: payload.status,
      };
      setRows((prev) => [added, ...prev]);
      setTotal((t) => t + 1);
      message.success("Tạo đơn chuyển xe thành công");
      setOpenCreate(false);
      createForm.resetFields();
    } catch (e) {
      message.error(e?.message || "Có lỗi khi tạo đơn");
    } finally {
      setCreating(false);
    }
  };

  /** -------- Update status (PUT) -------- */
  const submitUpdate = async () => {
    try {
      const values = await updateForm.validateFields();
      const { id, status } = values;

      setUpdating(true);
      const res = await fetch(UPDATE_STATUS_URL(id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json", // nếu server yêu cầu text/plain: đổi thành 'text/plain'
          ...headers,
        },
        body: JSON.stringify(status), // body là "string"
      });
      if (!res.ok) {
        let msg = `Update failed (HTTP ${res.status})`;
        try {
          const j = await res.json();
          msg = j?.message || msg;
        } catch {}
        throw new Error(msg);
      }
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      message.success("Cập nhật trạng thái thành công");
      setOpenUpdate(false);
      updateForm.resetFields();
    } catch (e) {
      message.error(e?.message || "Có lỗi khi cập nhật trạng thái");
    } finally {
      setUpdating(false);
    }
  };

  /** -------- Columns -------- */
  const columns = [
    { title: "Source", dataIndex: "from", ellipsis: true },
    { title: "Destination", dataIndex: "to", ellipsis: true },
    { title: "Product", dataIndex: "product", ellipsis: true },
    { title: "Qty", dataIndex: "quantity", width: 90, align: "center" },
    {
      title: "Date",
      dataIndex: "date",
      width: 170,
      render: (v) =>
        v ? (
          dayjs(v).format("YYYY-MM-DD")
        ) : (
          <Typography.Text type="secondary">-</Typography.Text>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 150,
      filters: STATUS_OPTIONS.map((s) => ({ text: s.label, value: s.value })),
      onFilter: (val, rec) => rec.status === val,
      render: (v) => <StatusTag value={v} />,
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => message.info(record.id)}
          />
          <Button
            size="small"
            type="default"
            icon={<EditOutlined />}
            onClick={() => {
              setOpenUpdate(true);
              updateForm.setFieldsValue({ id: record.id, status: record.status });
            }}
          >
            Update
          </Button>
          <Popconfirm
            title="Xóa (mock)?"
            description={`Xóa ${record.id}?`}
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => {
              setRows((prev) => prev.filter((x) => x.id !== record.id));
              setTotal((t) => Math.max(0, t - 1));
              message.success("Đã xóa (mock)");
            }}
          >
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 16 }}>
      <Space
        style={{ width: "100%", justifyContent: "space-between", marginBottom: 12 }}
      >
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Vehicle Transfer Orders
          </Typography.Title>
          <Typography.Text type="secondary">
            Tạo đơn & cập nhật trạng thái trực tiếp
          </Typography.Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => fetchList(page)}>
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setOpenCreate(true)}
          >
            Create
          </Button>
        </Space>
      </Space>

      {loadErr ? (
        <Alert type="error" message={loadErr} showIcon style={{ marginBottom: 12 }} />
      ) : null}

      <Table
        rowKey="id"
        columns={columns}
        dataSource={rows}
        loading={loading}
        bordered
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total,
          onChange: (p) => {
            setPage(p);
            fetchList(p);
          },
        }}
      />

      {/* ===================== CREATE MODAL (POST) ===================== */}
      <Modal
        open={openCreate}
        title="Create Transfer Order"
        onCancel={() => setOpenCreate(false)}
        onOk={submitCreate}
        okText="Create"
        confirmLoading={creating}
        destroyOnClose
      >
        <Form
          form={createForm}
          layout="vertical"
          initialValues={{ quantity: 1, status: "processing" }}
        >
          {/* From Dealer */}
          <Form.Item
            name="fromDealerId"
            label="From Dealer"
            rules={[{ required: true, message: "Chọn đại lý nguồn" }]}
          >
            <Select
              showSearch
              placeholder="Chọn đại lý nguồn"
              options={dealerOptions}
              loading={loadingDealers}
              optionFilterProp="label"
            />
          </Form.Item>

          {/* To Dealer */}
          <Form.Item
            name="toDealerId"
            label="To Dealer"
            rules={[{ required: true, message: "Chọn đại lý đích" }]}
          >
            <Select
              showSearch
              placeholder="Chọn đại lý đích"
              options={dealerOptions}
              loading={loadingDealers}
              optionFilterProp="label"
            />
          </Form.Item>

          {/* Vehicle (brand + modelName) → gửi vào field vehicleVersionId */}
          <Form.Item
            name="vehicleVersionId"
            label="Vehicle (Brand + Model)"
            rules={[{ required: true, message: "Chọn xe" }]}
            tooltip="Hiển thị brand + model; value = vehicleId, gửi lên dưới tên field vehicleVersionId"
          >
            <Select
              showSearch
              placeholder="Chọn xe"
              options={vehicleOptions}
              loading={loadingVehicles}
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true, type: "number", min: 1 }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="requestDate" label="Request Date">
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item name="status" label="Status">
            <Select options={STATUS_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>

      {/* ===================== UPDATE STATUS MODAL (PUT) ===================== */}
      <Modal
        open={openUpdate}
        title="Update Order Status"
        onCancel={() => setOpenUpdate(false)}
        onOk={submitUpdate}
        okText="Update"
        confirmLoading={updating}
        destroyOnClose
      >
        <Form form={updateForm} layout="vertical" initialValues={{ status: "" }}>
          <Form.Item
            name="id"
            label="Order ID"
            rules={[{ required: true, message: "Nhập Order ID" }]}
          >
            <Input placeholder="UUID đơn chuyển xe" />
          </Form.Item>
          <Form.Item
            name="status"
            label="New Status"
            rules={[{ required: true, message: "Chọn trạng thái" }]}
          >
            <Select options={STATUS_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
