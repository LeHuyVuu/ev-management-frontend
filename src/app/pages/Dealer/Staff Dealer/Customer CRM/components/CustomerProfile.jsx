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

  useEffect(() => {
    let profileTimer;
    if (customer?.customerId) {
      // Hiển thị skeleton form ngắn để tránh nhấp nháy khi đổi khách hàng
      setLoadingProfile(true);
      setForm(customer);
      profileTimer = setTimeout(() => setLoadingProfile(false), 300);

      // Lấy token
      const token = localStorage.getItem("token");

      // 🔹 Lấy hợp đồng
      setLoadingContracts(true);
      fetch(`${api.customer}/customers/${customer.customerId}/contracts`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.status === 200) setContracts(res.data || []);
          else setContracts([]);
        })
        .catch((err) => {
          console.error("Error loading contracts:", err);
          setContracts([]);
        })
        .finally(() => setLoadingContracts(false));

      // 🔹 Lấy đơn hàng
      setLoadingOrders(true);
      fetch(
        `${api.customer}/customers/${customer.customerId}/orders`,
        {
          headers: {
            Accept: "*/*",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      )
        .then((res) => res.json())
        .then((res) => {
          if (res.status === 200) setOrders(res.data || []);
          else setOrders([]);
        })
        .catch((err) => {
          console.error("Error loading orders:", err);
          setOrders([]);
        })
        .finally(() => setLoadingOrders(false));
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

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    if (!form.customerId) return;
    try {
      setSaving(true);
      const res = await fetch(`${api.customer}/api/customers`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
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
      const res = await fetch(`${api.order}/api/orders/${orderId}`, {
        headers: { Accept: "*/*" },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok || data?.status === 200) {
        setOrderDetail(data?.data ?? data); // ⬅️ dùng data.data theo res bạn gửi
      } else {
        toast.error("Không lấy được chi tiết đơn hàng");
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
          : (status || "").toLowerCase() === "signed"
            ? "green"
            : "blue"
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
                      placeholder="Nhập tên khách hàng"
                      size="large"
                    />
                  </Col>
                  <Col xs={24} md={12}>
                    <Text>Điện thoại</Text>
                    <Input
                      value={form?.phone || ""}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="Số điện thoại"
                      size="large"
                    />
                  </Col>
                  <Col xs={24} md={12}>
                    <Text>Email</Text>
                    <Input
                      value={form?.email || ""}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="Địa chỉ email"
                      size="large"
                    />
                  </Col>
                  <Col xs={24} md={12}>
                    <Text>Địa chỉ</Text>
                    <Input
                      value={form?.address || ""}
                      onChange={(e) => handleChange("address", e.target.value)}
                      placeholder="Địa chỉ"
                      size="large"
                    />
                  </Col>
                  <Col xs={24} md={12}>
                    <Text>Trạng thái</Text>
                    <Input
                      value={form?.status || ""}
                      onChange={(e) => handleChange("status", e.target.value)}
                      placeholder="Trạng thái"
                      size="large"
                    />
                  </Col>
                  <Col span={24}>
                    <Space>
                      <Button type="primary" loading={saving} onClick={handleUpdate} size="large">
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
                                Mã đơn: {o.orderId ? `${o.orderId.slice(0, 8)}...` : "-"}
                              </Text>
                              <OrdersBadge status={o.status} />
                            </Space>
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
