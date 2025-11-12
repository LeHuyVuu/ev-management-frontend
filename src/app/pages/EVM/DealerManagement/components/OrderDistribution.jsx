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
  `${API_BASE}/order-service/api/VehicleTransferOrder/${encodeURIComponent(
    id
  )}/status`;

const DEALERS_URL = `${API_BASE}/dealer-service/api/Dealers/active-dealers`;

// 🔧 VEHICLES_URL mới: HÀM nhận dealerId (không còn alt URL)
const VEHICLES_URL = (dealerId) =>
  `${API_BASE}/brand-service/api/vehicle-versions/dealer/${encodeURIComponent(
    dealerId
  )}?pageNumber=1&pageSize=200`;

const PAGE_SIZE = 10;

// Don't capture token once at module load — read current token when making requests
function getToken() {
  return (
    localStorage.getItem("token") || localStorage.getItem("accessToken") || null
  );
}

function getAuthHeaders() {
  const h = { accept: "*/*" };
  const t = getToken();
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}
/** Trạng thái → nhãn & màu AntD (harmony with distribution statuses) */
const STATUS_META = {
  pending: { label: "Đang chờ", color: "gold" },
  shipping: { label: "Đang vận chuyển", color: "processing" },
  received: { label: "Đã nhận xe", color: "green" },
  cancelled: { label: "Đã hủy", color: "volcano" },
  rejected: { label: "Từ chối", color: "red" },
};

// Thứ tự hợp lệ của flow trạng thái (dùng để chặn lùi)
const STATUS_ORDER = [
  "pending",
  "shipping",
  "received",
  "cancelled",
  "rejected",
];

const STATUS_OPTIONS_FOR_FILTER = STATUS_ORDER.map((k) => ({
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

  // Lưu trạng thái hiện tại của đơn đang cập nhật để disable option trong Select
  const [currentStatus, setCurrentStatus] = useState(null);

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
      if (json?.status !== 200)
        throw new Error(json?.message || "Fetch failed");
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

  /**
   * fetchVehicles(dealerId): gọi trực tiếp endpoint theo dealer
   * brand-service/api/vehicle-versions/dealer/{dealerId}?pageNumber=1&pageSize=200
   * → Kéo kèm stockQuantity vào option để validate quantity
   */
  const fetchVehicles = async (dealerId) => {
    try {
      setLoadingVehicles(true);

      // Nếu chưa chọn From Dealer thì clear danh sách xe và dừng
      if (!dealerId) {
        setVehicleOptions([]);
        return;
      }

      const res = await fetch(VEHICLES_URL(dealerId), {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      const items = json?.data?.items ?? json?.data ?? [];

      setVehicleOptions(
        (items || []).map((v) => {
          const stock =
            v.stockQuantity ??
            v.quantityInStock ??
            v.availableQuantity ??
            v.stock ??
            0;

          const label = `${v.brand ?? ""} ${v.modelName ?? ""} ${
            v.versionName ?? ""
          } ${v.color ?? ""}`
            .replace(/\s+/g, " ")
            .trim();

          return {
            value: v.vehicleVersionId || v.id || v.vehicleId,
            label:
              stock != null && stock !== ""
                ? `${label}`
                : label,
            stockQuantity: Number.isFinite(Number(stock)) ? Number(stock) : 0,
          };
        })
      );
    } catch (e) {
      messageApi.error("Không tải được danh sách xe");
    } finally {
      setLoadingVehicles(false);
    }
  };

  // id đại lý nguồn đã chọn trong form Create
  const fromDealerId = Form.useWatch("fromDealerId", createForm);
  // xe đang chọn trong form Create
  const selectedVehicleId = Form.useWatch("vehicleVersionId", createForm);

  // tồn kho của xe đang chọn (đọc từ vehicleOptions đã set ở trên)
  const selectedVehicleStock = useMemo(() => {
    const opt = vehicleOptions.find((o) => o.value === selectedVehicleId);
    const stock =
      opt?.stockQuantity ?? opt?.stock ?? opt?.availableQuantity ?? 0;
    return Number.isFinite(Number(stock)) ? Number(stock) : 0;
  }, [selectedVehicleId, vehicleOptions]);

  // Khi mở modal Create: luôn load dealers; và mỗi khi fromDealerId đổi thì gọi fetchVehicles(fromDealerId)
  useEffect(() => {
    if (openCreate) {
      if (dealerOptions.length === 0) fetchDealers();
      setVehicleOptions([]); // clear list cũ khỏi UI
      fetchVehicles(fromDealerId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openCreate, fromDealerId]);

  // Đổi From Dealer thì reset lựa chọn xe để tránh lệch dữ liệu
  useEffect(() => {
    if (openCreate) {
      createForm.setFieldsValue({ vehicleVersionId: undefined });
    }
  }, [fromDealerId, openCreate, createForm]);

  /** -------- Create (POST) -------- */
  const submitCreate = async () => {
    try {
      const values = await createForm.validateFields();
      if (values.fromDealerId === values.toDealerId) {
        messageApi.warning("From Dealer và To Dealer không được trùng nhau");
        return;
      }

      // Double-check: không cho vượt tồn kho (phòng trường hợp user đổi rất nhanh)
      const picked = vehicleOptions.find(
        (o) => o.value === values.vehicleVersionId
      );
      const maxStock = Number.isFinite(Number(picked?.stockQuantity))
        ? Number(picked?.stockQuantity)
        : 0;
      if (
        values.vehicleVersionId &&
        Number.isFinite(maxStock) &&
        values.quantity > maxStock
      ) {
        messageApi.error(`Số lượng vượt quá tồn kho.`);
        return;
      }

      const payload = {
        fromDealerId: values.fromDealerId,
        toDealerId: values.toDealerId,
        vehicleVersionId: values.vehicleVersionId,
        quantity: Number(values.quantity),
        requestDate: new Date().toISOString(),
        status: "pending", // dùng "pending" để thống nhất với STATUS_ORDER
      };

      setCreating(true);
      const res = await fetch(CREATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(payload),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(j?.message || `Create failed (${res.status})`);

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

      // ===== Chắn logic: không cho lùi trạng thái =====
      const prevStatus = rows.find((r) => r.id === id)?.status ?? currentStatus;
      if (prevStatus) {
        const prevIdx = STATUS_ORDER.indexOf(prevStatus);
        const nextIdx = STATUS_ORDER.indexOf(status);
        if (prevIdx !== -1 && nextIdx !== -1 && nextIdx < prevIdx) {
          messageApi.warning("Không thể quay lại trạng thái trước đó");
          return;
        }
      }

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
      setCurrentStatus(null);
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
      filters: STATUS_OPTIONS_FOR_FILTER.map((s) => ({
        text: s.label,
        value: s.value,
      })),
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
                    <p>
                      <strong>ID:</strong> {record.id}
                    </p>
                    <p>
                      <strong>Source:</strong> {record.from}
                    </p>
                    <p>
                      <strong>Destination:</strong> {record.to}
                    </p>
                    <p>
                      <strong>Product:</strong> {record.product}
                    </p>
                    <p>
                      <strong>Quantity:</strong> {record.quantity}
                    </p>
                    <p>
                      <strong>Date:</strong> {record.date}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <StatusTag value={record.status} />
                    </p>
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
              setCurrentStatus(record.status);
              updateForm.setFieldsValue({
                id: record.id,
                status: record.status,
              });
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
          ></Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 16 }}>
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

      {loadErr && (
        <Alert
          type="error"
          message={loadErr}
          showIcon
          style={{ marginBottom: 12 }}
        />
      )}

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
        <Form
          form={createForm}
          layout="vertical"
          initialValues={{ quantity: 1 }}
        >
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
              /** Khoá chọn xe khi chưa chọn From Dealer */
              disabled={!fromDealerId}
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
                  // 🔒 chặn vượt tồn kho khi đã chọn xe
                  if (
                    selectedVehicleId &&
                    Number.isFinite(selectedVehicleStock) &&
                    value > selectedVehicleStock
                  ) {
                    return Promise.reject(
                      `Số lượng vượt quá tồn kho.`
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
            extra={
              selectedVehicleId
                ? `Tồn kho: ${selectedVehicleStock}`
                : "Chọn xe để xem tồn kho"
            }
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
          setCurrentStatus(null);
        }}
        onOk={submitUpdate}
        okText="Update"
        confirmLoading={updating}
        destroyOnClose
      >
        <Form
          form={updateForm}
          layout="vertical"
          initialValues={{ status: "" }}
        >
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
            <Select
              // ⛔ Khóa toàn bộ khi đã received
              disabled={currentStatus === "received"}
              options={STATUS_ORDER.map((s, i) => ({
                value: s,
                label: STATUS_META[s].label,
                // Giữ luật: không cho lùi (chỉ khi chưa received)
                disabled:
                  currentStatus && currentStatus !== "received"
                    ? i < STATUS_ORDER.indexOf(currentStatus)
                    : false,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
