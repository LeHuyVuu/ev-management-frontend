import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
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

const DEALERS_URL = `${API_BASE}/dealer-service/api/Dealers/active-dealers`;
const VEHICLES_URL = `${API_BASE}/brand-service/api/vehicle-versions?pageNumber=1&pageSize=1000`;

const PAGE_SIZE = 10;

// Don't capture token once at module load — read current token when making requests
function getToken() {
  return localStorage.getItem("token") || localStorage.getItem("accessToken") || null;
}

function getAuthHeaders() {
  const h = { accept: "*/*" };
  const t = getToken();
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}
/** Trạng thái → nhãn & màu AntD (harmony with distribution statuses) */
const STATUS_META = {
  pending:   { label: "Đang chờ",        color: "gold" },
  shipping:  { label: "Đang vận chuyển", color: "processing" },
  received:  { label: "Đã nhận",         color: "green" },
  cancelled: { label: "Đã hủy",          color: "volcano" },
  rejected:  { label: "Từ chối",         color: "red" },
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
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [openCreate, setOpenCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm] = Form.useForm();

  const [openUpdate, setOpenUpdate] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateForm] = Form.useForm();

  const [dealerOptions, setDealerOptions] = useState([]);
  const [vehicleOptions, setVehicleOptions] = useState([]);
  const [loadingDealers, setLoadingDealers] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  // Note: compute headers per-request via getAuthHeaders() to avoid stale token

  const [messageApi, messageContextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();

  /** -------- Fetch list -------- */
  const fetchList = async (p = 1) => {
    try {
      setLoading(true);
      setLoadErr("");
      const url = `${LIST_URL}?pageNumber=${p}&pageSize=${PAGE_SIZE}`;
  const res = await fetch(url, { headers: getAuthHeaders() });
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
      messageApi.error(e?.message || "Load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(1);
  }, []);

  /** -------- Fetch dropdown data -------- */
  const fetchDealers = async () => {
    try {
      setLoadingDealers(true);
      // include auth headers when available
  const res = await fetch(DEALERS_URL, { headers: getAuthHeaders() });
      const json = await res.json();
      const items = json?.data ?? [];
      setDealerOptions(
        items.map((d) => ({
          value: d.dealerId,
          label: `${d.dealerCode ?? ""} — ${d.name ?? ""}`.trim(),
        }))
      );
    } catch (e) {
      messageApi.error(e?.message || "Không tải được danh sách đại lý");
    } finally {
      setLoadingDealers(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      setLoadingVehicles(true);
      // include auth headers when available
      // first try the vehicles endpoint
      let res = await fetch(VEHICLES_URL, { headers: getAuthHeaders() });
      const json = await res.json();
      const items = json?.data?.items ?? [];
      // If the vehicles endpoint didn't return items, try the vehicle-versions endpoint (common alternative)
      if ((!items || items.length === 0) && getToken()) {
        try {
          const altUrl = `${API_BASE}/brand-service/api/vehicle-versions/dealer?pageNumber=1&pageSize=200`;
          const altRes = await fetch(altUrl, { headers: getAuthHeaders() });
          const altJson = await altRes.json().catch(() => ({}));
          const altItems = altJson?.data?.items ?? altJson?.data ?? [];
          if (Array.isArray(altItems) && altItems.length > 0) {
            setVehicleOptions(
              altItems.map((v) => ({
                value: v.vehicleVersionId || v.id || v.vehicleId,
                label: `${v.brand ?? ""} ${v.versionName ?? v.modelName ?? ""}`.trim(),
              }))
            );
            return;
          }
        } catch (er) {
          // ignore fallback error — we'll handle below
        }
      }
      setVehicleOptions(
        items.map((v) => ({
          value: v.vehicleVersionId,
          label: `${v.brand ?? ""} ${v.modelName ?? ""} ${v.versionName ?? ""} ${v.color ?? ""}`
            .replace(/\s+/g, " ")
            .trim(),
        }))
      );
    } catch (e) {
      messageApi.error(e?.message || "Không tải được danh sách xe");
    } finally {
      setLoadingVehicles(false);
    }
  };

  useEffect(() => {
    if (openCreate) {
      if (dealerOptions.length === 0) fetchDealers();
      if (vehicleOptions.length === 0) fetchVehicles();
    }
  }, [openCreate]);

  const fromDealerId = Form.useWatch("fromDealerId", createForm);

  /** -------- Create (POST) -------- */
  const submitCreate = async () => {
    try {
      // validateFields chỉ resolve nếu tất cả hợp lệ
      const values = await createForm.validateFields();
      if (values.fromDealerId === values.toDealerId) {
        messageApi.warning("From Dealer và To Dealer không được trùng nhau");
        return;
      }

      const payload = {
        fromDealerId: values.fromDealerId,
        toDealerId: values.toDealerId,
        vehicleVersionId: values.vehicleVersionId,
        quantity: Number(values.quantity),
        requestDate: new Date().toISOString(),
        status: "processing",
      };

      setCreating(true);
      const res = await fetch(CREATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(payload),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.message || `Create failed (${res.status})`);

      const added = {
        id: j?.data?.vehicleTransferOrderId || crypto.randomUUID(),
        from: j?.data?.fromDealerName || "",
        to: j?.data?.toDealerName || "",
        product: j?.data?.vehicleName || "",
        quantity: payload.quantity,
        date: payload.requestDate,
        status: payload.status,
      };
      setRows((prev) => [added, ...prev]);
      setTotal((t) => t + 1);
      messageApi.success("Tạo đơn chuyển xe thành công");
      setOpenCreate(false);
      createForm.resetFields();
    } catch (e) {
      messageApi.error(e?.message || "Vui lòng kiểm tra lại thông tin nhập");
    } finally {
      setCreating(false);
    }
  };

  /** -------- Update status -------- */
  const submitUpdate = async () => {
    try {
      const values = await updateForm.validateFields();
      const { id, status } = values;
      setUpdating(true);
      const res = await fetch(UPDATE_STATUS_URL(id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json", // nếu server yêu cầu text/plain: đổi thành 'text/plain'
          ...getAuthHeaders(),
        },
        body: JSON.stringify(status), // body là "string"
      });
      if (!res.ok) throw new Error(`Update failed (${res.status})`);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      messageApi.success("Cập nhật trạng thái thành công");
      setOpenUpdate(false);
      updateForm.resetFields();
    } catch (e) {
      messageApi.error(e?.message || "Có lỗi khi cập nhật trạng thái");
    } finally {
      setUpdating(false);
    }
  };

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
        v ? dayjs(v).format("YYYY-MM-DD") : <Typography.Text type="secondary">-</Typography.Text>,
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
            onClick={() =>
              modal.info({
                title: "Chi tiết Vehicle Transfer Order",
                content: (
                  <div>
                    <p><strong>ID:</strong> {record.id}</p>
                    <p><strong>Source:</strong> {record.from}</p>
                    <p><strong>Destination:</strong> {record.to}</p>
                    <p><strong>Product:</strong> {record.product}</p>
                    <p><strong>Quantity:</strong> {record.quantity}</p>
                    <p><strong>Date:</strong> {record.date}</p>
                    <p><strong>Status:</strong> <StatusTag value={record.status} /></p>
                  </div>
                ),
                width: 500,
                centered: true,
              })
            }
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
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => {
              setRows((prev) => prev.filter((x) => x.id !== record.id));
              setTotal((t) => Math.max(0, t - 1));
              messageApi.success("Đã xóa (mock)");
            }}
          >
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 16 }}>
      {messageContextHolder}
      {modalContextHolder}

      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 12 }}>
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
            onClick={() => {
              createForm.resetFields();
              setOpenCreate(true);
            }}
          >
            Create
          </Button>
        </Space>
      </Space>

      {loadErr && <Alert type="error" message={loadErr} showIcon style={{ marginBottom: 12 }} />}

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

      {/* CREATE MODAL */}
      <Modal
        open={openCreate}
        title="Create Transfer Order"
        onCancel={() => {
          setOpenCreate(false);
          createForm.resetFields();
        }}
        onOk={submitCreate}
        okText="Create"
        confirmLoading={creating}
        destroyOnClose
      >
        <Form form={createForm} layout="vertical" initialValues={{ quantity: 1 }}>
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

          <Form.Item
            name="toDealerId"
            label="To Dealer"
            rules={[{ required: true, message: "Chọn đại lý đích" }]}
          >
            <Select
              showSearch
              placeholder="Chọn đại lý đích"
              options={dealerOptions.filter((o) => o.value !== fromDealerId)}
              loading={loadingDealers}
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item
            name="vehicleVersionId"
            label="Vehicle"
            rules={[{ required: true, message: "Chọn xe" }]}
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
            rules={[
              { required: true, message: "Nhập số lượng" },
              {
                validator: (_, value) => {
                  if (value === undefined || value === null) {
                    return Promise.reject("Vui lòng nhập số lượng");
                  }
                  if (typeof value !== "number" || isNaN(value)) {
                    return Promise.reject("Số lượng phải là số");
                  }
                  if (value <= 0) {
                    return Promise.reject("Số lượng phải lớn hơn 0");
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* UPDATE MODAL */}
      <Modal
        open={openUpdate}
        title="Update Order Status"
        onCancel={() => {
          setOpenUpdate(false);
          updateForm.resetFields();
        }}
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
