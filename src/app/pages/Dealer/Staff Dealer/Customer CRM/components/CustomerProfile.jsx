import React, { useEffect, useState } from "react";
import api from "../../../../../context/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Package, Clock } from "lucide-react";
import {
  Button,
  Skeleton,
  Tag,
  Divider,
  Card,
  Tabs,
  Typography,
  Row,
  Col,
  Input,
  Select,
  Space,
  Empty,
  Badge,
  Modal,
  Descriptions,
  List,
  Pagination,
} from "antd";
import ContractModalAnt from "./ContractCardAnt";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export default function CustomerProfile({ customer }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [contracts, setContracts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const [openContract, setOpenContract] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);

  // ✅ loading states
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true); // <-- NEW

  // ✅ Pagination states
  const [contractsPage, setContractsPage] = useState(1);
  const [contractsPageSize, setContractsPageSize] = useState(9);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersPageSize, setOrdersPageSize] = useState(9);

  // ✅ NEW: Order detail modal states
  const [openOrderDetail, setOpenOrderDetail] = useState(false);
  const [orderDetail, setOrderDetail] = useState(null);
  const [loadingOrderDetail, setLoadingOrderDetail] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let profileTimer;
    if (customer?.customerId) {
      // Hiển thị skeleton form ngắn để tránh nhấp nháy khi đổi khách hàng
      setLoadingProfile(true);
      setForm(customer);
      profileTimer = setTimeout(() => setLoadingProfile(false), 300);

      // Fetch contracts/orders/profile via helper
      refreshProfile();
    } else {
      setForm({});
      setContracts([]);
      setOrders([]);
      setLoadingProfile(false);
    }

    return () => {
      if (profileTimer) clearTimeout(profileTimer);
    };
  }, [customer]);

  // Refresh profile data (contracts + orders). Call this after actions that change customer-related data.
  async function refreshProfile() {
    if (!customer?.customerId) return;
    const token = localStorage.getItem("token");

    try {
      setLoadingContracts(true);
      const resC = await fetch(`${api.customer}/customers/${customer.customerId}/contracts`, {
        headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
      });
      const jsonC = await resC.json().catch(() => ({}));
      if (resC.ok || jsonC?.status === 200) setContracts(jsonC.data || []);
      else setContracts([]);
    } catch (err) {
      console.error("Error loading contracts:", err);
      setContracts([]);
    } finally {
      setLoadingContracts(false);
    }

    try {
      setLoadingOrders(true);
      const resO = await fetch(`${api.customer}/customers/${customer.customerId}/orders`, {
        headers: { Accept: "*/*", Authorization: token ? `Bearer ${token}` : "" },
      });
      const jsonO = await resO.json().catch(() => ({}));
      if (resO.ok || jsonO?.status === 200) setOrders(jsonO.data || []);
      else setOrders([]);
    } catch (err) {
      console.error("Error loading orders:", err);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }

  const handleChange = (field, value) => {
    const newValue = field === 'phone' ? (value || '').toString().replace(/\D/g, '').slice(0,10) : value;
    setForm((prev) => ({ ...prev, [field]: newValue }));
    // live validate
    const err = validateField(field, newValue);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  // local email validator (same rules as modal)
  function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const s = email.trim(); if (!s) return false;
    if (!s.includes('@') || !s.includes('.')) return false;
    const parts = s.split('@'); if (parts.length !== 2) return false;
    const [local, domain] = parts; if (!local || !domain) return false;
    if (local.startsWith('.') || local.endsWith('.')) return false; if (local.includes('..')) return false;
    if (!/^[A-Za-z0-9._%+-]+$/.test(local)) return false;
    if (!domain.includes('.')) return false; const domainParts = domain.split('.'); if (domainParts.length < 2) return false;
    for (const l of domainParts) { if (l.length === 0) return false; if (!/^[A-Za-z0-9-]+$/.test(l)) return false; if (l.startsWith('-')||l.endsWith('-')) return false; }
    const tld = domainParts[domainParts.length-1]; if (!/^[A-Za-z]{2,}$/.test(tld)) return false;
    return true;
  }

  const validateField = (fieldName, value) => {
    const v = (value || '').toString();
    switch (fieldName) {
      case 'name':
        return v.trim() ? undefined : 'Vui lòng nhập tên khách hàng.';
      case 'phone': {
        const digits = v.replace(/\D/g, '');
        if (!digits) return 'Vui lòng nhập số điện thoại.';
        if (digits.length !== 10) return 'Số điện thoại phải đúng 10 chữ số.';
        return undefined;
      }
      case 'email': {
        const t = v.trim(); if (!t) return 'Vui lòng nhập email.';
        return isValidEmail(t) ? undefined : 'Địa chỉ email không hợp lệ.';
      }
      case 'address':
        return v.trim() ? undefined : 'Vui lòng nhập địa chỉ.';
      case 'status':
        return ['active','inactive'].includes(v) ? undefined : 'Trạng thái không hợp lệ.';
      default:
        return undefined;
    }
  };

  const isFormValid = () => {
    const fields = ['name','phone','email','address','status'];
    return fields.every(f => !validateField(f, form[f]));
  };

  const handleUpdate = async () => {
    if (!form.customerId) return;
    try {
      setSaving(true);
      // Ensure we have a token before calling the API
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Không tìm thấy token. Vui lòng đăng nhập lại.");
        setSaving(false);
        return;
      }

      const res = await fetch(`${api.customer}/api/customers`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerId: form.customerId,
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          status: form.status,
        }),
      });
      if (res.ok) {
        toast.success("Cập nhật khách hàng thành công");
      } else {
        toast.error("Cập nhật thất bại");
      }
    } catch (err) {
      console.error("Update failed", err);
      toast.error("Có lỗi xảy ra khi cập nhật");
    } finally {
      setSaving(false);
    }
  };

  if (!customer) {
    return (
      <Card style={{ width: "100%" }}>
        <Empty description="Chọn khách hàng để xem thông tin" />
      </Card>
    );
  }

  const openContractDetail = (c) => {
    setSelectedContract({
      id: c.contractId,
      customer: c.customerName,
      car: [c.brand, c.vehicleName, c.versionName].filter(Boolean).join(" "),
      content: c.content,
    });
    setOpenContract(true);
  };

  // ✅ Lấy OrderDetail theo orderId (GET /api/orders/{orderId})
  const openOrderDetailModal = async (orderId) => {
    if (!orderId) return;
    setOpenOrderDetail(true);
    setLoadingOrderDetail(true);
    setOrderDetail(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${api.customer}/api/orders/${orderId}`, {
        headers: {
          Accept: "*/*",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok || data?.status === 200) {
        setOrderDetail(data?.data ?? data); // ⬅️ dùng data.data theo res bạn gửi
      } else {
        toast.error(data?.message || "Không lấy được chi tiết đơn hàng");
      }
    } catch (e) {
      console.error("Fetch order detail failed:", e);
      toast.error("Có lỗi khi tải chi tiết đơn hàng");
    } finally {
      setLoadingOrderDetail(false);
    }
  };


  const fmtCurrency = (n) =>
    typeof n === "number"
      ? n.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
      : n;

  const StatusTag = ({ status }) => (
    <Tag
      color={
        (status || "").toLowerCase() === "draft"
          ? "default"
          : (status || "").toLowerCase() === "approved"
            ? "green"
            : (status || "").toLowerCase() === "cancelled"
            ? "volcano"
            : "default"
      }
      style={{ textTransform: "capitalize", marginLeft: 8 }}
    >
      {status || "-"}
    </Tag>
  );

  const OrdersBadge = ({ status }) => {
    const s = (status || "").toLowerCase();
    const map = {
      preparing: { color: "gold", text: "preparing" },
      "shipped from warehouse": { color: "geekblue", text: "shipped" },
      "in transit": { color: "blue", text: "in transit" },
      arrived: { color: "purple", text: "arrived" },
      "out for delivery": { color: "cyan", text: "out for delivery" },
      completed: { color: "green", text: "completed" },
      "delivery failed": { color: "red", text: "failed" },
      waiting: { color: "default", text: "waiting" },
    };
    const meta = map[s] || { color: "default", text: status || "-" };
    return <Badge color={meta.color} text={meta.text} />;
  };

  return (
    <Card style={{ width: "100%" }} bodyStyle={{ padding: 20 }} bordered>
      <ToastContainer position="top-right" autoClose={3000} />
      <Space direction="vertical" size="small" style={{ width: "100%" }}>
        <Space align="center" style={{ width: "100%", justifyContent: "space-between" }}>
          <Space direction="vertical" size={0}>
            <Title level={4} style={{ margin: 0 }}>
              {customer?.name || "Không rõ tên"}
            </Title>
            <Text type="secondary">
              Mã KH: <Text code>{customer?.customerId}</Text>
            </Text>
          </Space>
          <Tag color="processing">Hồ sơ khách hàng</Tag>
        </Space>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: "profile", label: "Hồ sơ" },
            { key: "contracts", label: "Hợp đồng khách hàng" },
            { key: "orders", label: "Đơn hàng khách hàng" },
          ]}
        />

        {/* Tab Hồ sơ */}
        {activeTab === "profile" && (
          <Card type="inner" title="Thông tin hồ sơ" bordered>
            {loadingProfile ? (
              <>
                <Row gutter={[16, 16]}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Col xs={24} md={12} key={i}>
                      <Skeleton.Input active block style={{ height: 38 }} />
                    </Col>
                  ))}
                  <Col span={24}>
                    <Skeleton.Button active block style={{ height: 40 }} />
                  </Col>
                </Row>
              </>
            ) : (
              <>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Text className="ant-form-item-label">Tên Khách hàng</Text>
                    <Input
                      value={form?.name || ""}
                      onChange={(e) => handleChange("name", e.target.value)}
                      onBlur={() => setErrors((prev)=>({ ...prev, name: validateField('name', form.name) }))}
                      placeholder="Nhập tên khách hàng"
                      size="large"
                      aria-invalid={!!errors.name}
                      autoComplete="name"
                    />
                    {errors.name && <div className="text-red-600 text-sm mt-1">{errors.name}</div>}
                  </Col>
                  <Col xs={24} md={12}>
                    <Text>Điện thoại</Text>
                    <Input
                      value={form?.phone || ""}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      onBlur={() => setErrors((prev)=>({ ...prev, phone: validateField('phone', form.phone) }))}
                      placeholder="Số điện thoại"
                      size="large"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      aria-invalid={!!errors.phone}
                      autoComplete="tel"
                    />
                    {errors.phone && <div className="text-red-600 text-sm mt-1">{errors.phone}</div>}
                  </Col>
                  <Col xs={24} md={12}>
                    <Text>Email</Text>
                    <Input
                      value={form?.email || ""}
                      onChange={(e) => handleChange("email", e.target.value)}
                      onBlur={() => setErrors((prev)=>({ ...prev, email: validateField('email', form.email) }))}
                      placeholder="Địa chỉ email"
                      size="large"
                      type="email"
                      aria-invalid={!!errors.email}
                      autoComplete="email"
                    />
                    {errors.email && <div className="text-red-600 text-sm mt-1">{errors.email}</div>}
                  </Col>
                  <Col xs={24} md={12}>
                    <Text>Địa chỉ</Text>
                    <Input
                      value={form?.address || ""}
                      onChange={(e) => handleChange("address", e.target.value)}
                      onBlur={() => setErrors((prev)=>({ ...prev, address: validateField('address', form.address) }))}
                      placeholder="Địa chỉ"
                      size="large"
                      aria-invalid={!!errors.address}
                      autoComplete="street-address"
                    />
                    {errors.address && <div className="text-red-600 text-sm mt-1">{errors.address}</div>}
                  </Col>
                  <Col xs={24} md={12}>
                    <div className="flex items-center gap-2">
                      <div className="w-20">
                        <Text>Trạng thái</Text>
                      </div>
                      <div className="flex-1">
                        <Select
                          value={form?.status || 'active'}
                          onChange={(val) => handleChange('status', val)}
                          onBlur={() => setErrors((prev)=>({ ...prev, status: validateField('status', form.status) }))}
                          size="large"
                          options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]}
                          aria-invalid={!!errors.status}
                          style={{ width: '100%' }}
                        />
                        {errors.status && <div className="text-red-600 text-sm mt-1">{errors.status}</div>}
                      </div>
                    </div>
                  </Col>
                  <Col span={24}>
                    <Space>
                      <Button type="primary" loading={saving} onClick={handleUpdate} size="large" disabled={!isFormValid() || saving}>
                        Lưu thay đổi
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </>
            )}
          </Card>
        )}

        {/* Tab Hợp đồng */}
        {activeTab === "contracts" && (
          <Card
            type="inner"
            title="Hợp đồng khách hàng"
            bordered
            extra={<Text type="secondary">Tổng: {contracts.length}</Text>}
          >
            {loadingContracts ? (
              <Row gutter={[16, 16]}>
                {[...Array(3)].map((_, i) => (
                  <Col xs={24} md={12} lg={8} key={i}>
                    <Card>
                      <Skeleton active paragraph={{ rows: 3 }} />
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : contracts.length === 0 ? (
              <Empty description="Không có hợp đồng nào" />
            ) : (
              <>
                <Row gutter={[16, 16]}>
                  {contracts
                    .slice(
                      (contractsPage - 1) * contractsPageSize,
                      contractsPage * contractsPageSize
                    )
                    .map((c) => (
                      <Col xs={24} md={12} lg={8} key={c.contractId}>
                    <Card
                      hoverable
                      title={
                        <Space direction="vertical" size={0}>
                          <Text strong>Mã hợp đồng</Text>
                          <Text type="secondary" style={{ wordBreak: "break-all" }}>
                            {c.contractId}
                          </Text>
                        </Space>
                      }
                      extra={<StatusTag status={c.status} />}
                      actions={[
                        <Button type="link" onClick={() => openContractDetail(c)} key="xem">
                          Xem chi tiết
                        </Button>,
                      ]}
                    >
                      <Space direction="vertical" size="small" style={{ width: "100%" }}>
                        <Space>
                          <Text type="secondary">Nhân viên phụ trách:</Text>
                          <Text strong>{c.staffContract || "-"}</Text>
                        </Space>
                        <Space>
                          <Text type="secondary">Hãng xe:</Text>
                          <Text strong>{c.brand || "-"}</Text>
                        </Space>
                        <Space>
                          <Text type="secondary">Dòng xe:</Text>
                          <Text strong>{c.vehicleName || "-"}</Text>
                        </Space>
                        <Space>
                          <Text type="secondary">Phiên bản:</Text>
                          <Text strong>{c.versionName || "-"}</Text>
                        </Space>
                        <Space>
                          <Text type="secondary">Giá trị HĐ:</Text>
                          <Text strong>{fmtCurrency(c.totalValue)}</Text>
                        </Space>
                        <Space>
                          <Text type="secondary">Ngày ký:</Text>
                          <Text strong>{c.signedDate || "-"}</Text>
                        </Space>

                        {(c.createdAt || c.updatedAt) && (
                          <>
                            <Divider style={{ margin: "8px 0" }} />
                            <Space size="small" direction="vertical">
                              {c.createdAt && (
                                <Text type="secondary">
                                  Tạo: {new Date(c.createdAt).toLocaleDateString()}
                                </Text>
                              )}
                              {c.updatedAt && (
                                <Text type="secondary">
                                  Cập nhật: {new Date(c.updatedAt).toLocaleDateString()}
                                </Text>
                              )}
                            </Space>
                          </>
                        )}
                      </Space>
                    </Card>
                      </Col>
                    ))}
                </Row>
                <Divider />
                <Pagination
                  current={contractsPage}
                  pageSize={contractsPageSize}
                  total={contracts.length}
                  onChange={(page) => setContractsPage(page)}
                  onShowSizeChange={(current, size) => {
                    setContractsPageSize(size);
                    setContractsPage(1);
                  }}
                  showSizeChanger
                  pageSizeOptions={["6", "9", "12", "18"]}
                  style={{ textAlign: "center" }}
                />
              </>
            )}
          </Card>
        )}

        {/* Tab Đơn hàng */}
        {activeTab === "orders" && (
          <Card
            type="inner"
            title={
              <Space>
                <Package style={{ color: "#1677ff" }} size={18} />
                <Text strong>Danh sách đơn hàng</Text>
              </Space>
            }
            bordered
            extra={<Text type="secondary">Tổng: {orders.length}</Text>}
          >
            {loadingOrders ? (
              <Row gutter={[16, 16]}>
                {[...Array(3)].map((_, i) => (
                  <Col xs={24} md={12} lg={8} key={i}>
                    <Card>
                      <Skeleton active paragraph={{ rows: 2 }} />
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : orders.length === 0 ? (
              <Empty description="Khách hàng chưa có đơn hàng nào" />
            ) : (
              <>
                <Row gutter={[16, 16]}>
                  {orders
                    .slice(
                      (ordersPage - 1) * ordersPageSize,
                      ordersPage * ordersPageSize
                    )
                    .map((o) => (
                      <Col xs={24} md={12} lg={8} key={o.orderId}>
                        <Card
                          hoverable
                          actions={[
                            <Button type="link" key="detail" onClick={() => openOrderDetailModal(o.orderId)}>
                              Xem chi tiết
                            </Button>,
                          ]}
                        >
                          <Space direction="vertical" size="small" style={{ width: "100%" }}>
                            <Space style={{ justifyContent: "space-between", width: "100%" }}>
                              <Text strong>
                                Mã đơn: {o.orderId}
                              </Text>
                            </Space>
                              <OrdersBadge status={o.status} />

                            <Space size="small" style={{ color: "#6b7280" }}>
                              <Clock size={14} />
                              <Text type="secondary">Ngày giao: {o.deliveryDate || "-"}</Text>
                            </Space>
                          </Space>
                        </Card>
                      </Col>
                    ))}
                </Row>
                <Divider />
                <Pagination
                  current={ordersPage}
                  pageSize={ordersPageSize}
                  total={orders.length}
                  onChange={(page) => setOrdersPage(page)}
                  onShowSizeChange={(current, size) => {
                    setOrdersPageSize(size);
                    setOrdersPage(1);
                  }}
                  showSizeChanger
                  pageSizeOptions={["6", "9", "12", "18"]}
                  style={{ textAlign: "center" }}
                />
              </>
            )}
          </Card>
        )}

        {/* ✅ Modal chi tiết hợp đồng */}
        <ContractModalAnt
          open={openContract}
          contract={selectedContract}
          onClose={() => setOpenContract(false)}
          onUpdated={refreshProfile}
        />

        {/* ✅ NEW: Modal chi tiết đơn hàng */}
        <Modal
          title="Chi tiết đơn hàng"
          open={openOrderDetail}
          onCancel={() => setOpenOrderDetail(false)}
          footer={<Button onClick={() => setOpenOrderDetail(false)}>Đóng</Button>}
          width={720}
        >
          {loadingOrderDetail ? (
            <>
              <Skeleton active paragraph={{ rows: 3 }} />
              <Divider />
              <Skeleton active paragraph={{ rows: 2 }} />
            </>
          ) : !orderDetail ? (
            <Empty description="Không có dữ liệu chi tiết" />
          ) : (
            <>
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Mã đơn" span={2}>
                  <Text code>{orderDetail.orderId || "-"}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <OrdersBadge status={orderDetail.status} />
                </Descriptions.Item>
                <Descriptions.Item label="Ngày giao">
                  {orderDetail.deliveryDate || "-"}
                </Descriptions.Item>

                <Descriptions.Item label="Tên khách hàng">
                  {orderDetail.name || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Điện thoại">
                  {orderDetail.phone || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Email" span={2}>
                  {orderDetail.email || "-"}
                </Descriptions.Item>

                <Descriptions.Item label="Hãng xe">
                  {orderDetail.brand || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Dòng xe">
                  {orderDetail.modelName || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Màu sắc">
                  {orderDetail.color || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ giao" span={2}>
                  {orderDetail.deliveryAddress || "-"}
                </Descriptions.Item>
              </Descriptions>

              {orderDetail.timestamp && (
                <>
                  <Divider />
                  <Text type="secondary">
                    Cập nhật lúc: {new Date(orderDetail.timestamp).toLocaleString()}
                  </Text>
                </>
              )}
            </>
          )}
        </Modal>

      </Space>
    </Card>
  );
}
