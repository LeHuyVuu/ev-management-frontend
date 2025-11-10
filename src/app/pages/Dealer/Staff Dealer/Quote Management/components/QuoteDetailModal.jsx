import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Modal,
  Button,
  Descriptions,
  Divider,
  Tag,
  Typography,
  Skeleton,
  Alert,
  Space,
  Form,
  InputNumber,
  Input,
  Statistic,
  message,
  Card,
  Row,
  Col,
  Tooltip,
  Tabs,
  Table,
  Badge,
  Empty,
  Select,
} from "antd";
import { ReloadOutlined, CopyOutlined } from "@ant-design/icons";

const { Text, Title, Paragraph } = Typography;

const API_DETAIL_URL = "https://prn232.freeddns.org/customer-service/api/quotes";

/** Lấy token giống code gốc */
function getTokenFromLocalStorage() {
  const keys = ["access_token", "token", "authToken", "jwt"];
  for (const k of keys) {
    const v = window.localStorage.getItem(k);
    if (v) return v;
  }
  return null;
}

function formatVND(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return n ?? "";
  return new Intl.NumberFormat("vi-VN").format(num) + " VND";
}

function statusColor(s) {
  switch ((s || "").toLowerCase()) {
    case "pending":
      return "processing";
    case "confirmed":
      return "success";
    case "canceled":
    case "cancelled":
      return "error";
    case "draft":
    default:
      return "default";
  }
}

function ribbonColor(s) {
  switch ((s || "").toLowerCase()) {
    case "pending":
      return "gold";
    case "confirmed":
      return "green";
    case "canceled":
    case "cancelled":
      return "red";
    case "draft":
    default:
      return "blue";
  }
}

/** format thời gian */
function formatTimestamp(ts) {
  try {
    if (!ts) return "—";
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return String(ts);
    return d.toLocaleString("vi-VN");
  } catch {
    return String(ts);
  }
}

/** Helper: hiển thị giá trị bất kỳ gọn gàng */
function prettyValue(val) {
  if (Array.isArray(val)) {
    return (
      <Space wrap>
        {val.map((it, idx) => (
          <Tag key={idx}>{typeof it === "string" ? it : JSON.stringify(it)}</Tag>
        ))}
      </Space>
    );
  }
  if (val && typeof val === "object") {
    return (
      <Paragraph copyable className="!mb-0">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {JSON.stringify(val, null, 2)}
        </pre>
      </Paragraph>
    );
  }
  if (val === null || val === undefined || val === "") return <Text type="secondary">—</Text>;
  return <Text>{String(val)}</Text>;
}


/** Header bar cố định để thao tác nhanh */
function StickyHeader({ detail, onReload, onClose, onPatch, onSave, patching, saving }) {
  return (
    <div
      style={{ position: "sticky", top: 0, zIndex: 2, background: "#fff", padding: "8px 0 6px" }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Title level={5} className="!mb-0">Chi tiết báo giá</Title>
          {!!detail?.status && <Tag color={statusColor(detail.status)}>{detail.status}</Tag>}
          {detail?.quoteId && (
            <Tooltip title="Sao chép Quote ID">
              <Button
                size="small"
                type="text"
                icon={<CopyOutlined />}
                onClick={() => navigator.clipboard.writeText(detail.quoteId)}
              >
                <Text code className="!ml-1">{String(detail.quoteId).slice(0, 8)}…</Text>
              </Button>
            </Tooltip>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Button icon={<ReloadOutlined />} onClick={onReload} size="small">Tải lại</Button>
          <Button onClick={onClose} size="small">Đóng</Button>
          <Button onClick={onPatch} loading={patching} size="small">Cập nhật trạng thái</Button>
          <Button type="primary" onClick={onSave} loading={saving} size="small">Lưu</Button>
        </div>
      </div>
      <Divider className="!my-2" />
    </div>
  );
}

export default function QuoteDetailModal({ open, quoteId, onClose, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [detail, setDetail] = useState(null);

  // form state để PUT/PATCH (giữ nguyên logic cũ)
  const [customerId, setCustomerId] = useState("");
  const [vehicleVersionId, setVehicleVersionId] = useState("");
  const [discountAmt, setDiscountAmt] = useState(0);
  const [status, setStatus] = useState("");

  const [saving, setSaving] = useState(false); // PUT
  const [patching, setPatching] = useState(false); // PATCH /status

  const syncFormFromDetail = (d) => {
    setCustomerId(d?.customerId || "");
    setVehicleVersionId(d?.vehicleVersionId || "");
    setDiscountAmt(Number.isFinite(Number(d?.discountAmt)) ? Number(d.discountAmt) : 0);
    setStatus(d?.status || "");
  };

  const fetchDetail = useCallback(async () => {
    if (!open || !quoteId) return;
    setLoading(true);
    setErr("");
    setDetail(null);
    try {
      const token = getTokenFromLocalStorage();
      if (!token) {
        setErr("Không tìm thấy token trong localStorage.");
        return;
      }
      const res = await fetch(`${API_DETAIL_URL}/${quoteId}`, {
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
      const d = json?.data || null;
      setDetail(d);
      syncFormFromDetail(d);
    } catch (e) {
      setErr(e.message || "Đã xảy ra lỗi khi tải chi tiết báo giá.");
    } finally {
      setLoading(false);
    }
  }, [open, quoteId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // PUT full quote (giữ nguyên logic cũ)
  const handleSave = async () => {
    if (!quoteId) return;
    const token = getTokenFromLocalStorage();
    if (!token) {
      message.error("Không tìm thấy token.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        customerId: customerId || null,
        vehicleVersionId: vehicleVersionId || null,
        optionsJson: optionsJson ?? "",
        discountAmt: Number(discountAmt) || 0,
        status: status || "",
      };

      const res = await fetch(`${API_DETAIL_URL}/${quoteId}`, {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Cập nhật thất bại (${res.status}): ${text || res.statusText}`);
      }

      message.success("Cập nhật báo giá thành công!");
      await fetchDetail();
      onUpdated?.(quoteId);
    } catch (e) {
      message.error(e.message || "Cập nhật thất bại.");
    } finally {
      setSaving(false);
    }
  };

  // PATCH status theo API /api/quotes/{quoteId}/status (giữ nguyên logic cũ)
  const handlePatchStatus = async () => {
    if (!quoteId) return;
    const token = getTokenFromLocalStorage();
    if (!token) {
      message.error("Không tìm thấy token.");
      return;
    }
    if (!status || typeof status !== "string") {
      message.warning("Vui lòng chọn trạng thái hợp lệ.");
      return;
    }

    setPatching(true);
    try {
      const res = await fetch(`${API_DETAIL_URL}/${quoteId}/status`, {
        method: "PATCH",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Cập nhật trạng thái thất bại (${res.status}): ${text || res.statusText}`);
      }

      message.success("Đã cập nhật trạng thái thành công (PATCH)");
      await fetchDetail();
      onUpdated?.(quoteId);
    } catch (e) {
      message.error(e.message || "Cập nhật trạng thái thất bại.");
    } finally {
      setPatching(false);
    }
  };

  // optionsJson editor removed — not exposed in UI anymore

  // Các field đã thể hiện ở trên UI => loại khỏi bảng "Các trường khác"
  const displayedKeys = useMemo(
    () =>
      new Set([
        // header + summary
        "quoteId",
        "status",
        "customerName",
        "customerPhone",
        "brand",
        "modelName",
        "versionName",
        "color",
        "subtotal",
        "discountAmt",
        "totalPrice",
        // dealer
        "dealerName",
        "dealerId",
        "contactEmail",
        "contactPhone",
        // promo
        "promotionNames",
  // edit form sources
  "customerId",
  "vehicleVersionId",
        // meta
        "timestamp",
      ]),
    []
  );

  const otherFields = useMemo(() => {
    if (!detail) return [];
    return Object.entries(detail)
      .filter(([k]) => !displayedKeys.has(k))
      .map(([field, value]) => ({ field, value }))
      .sort((a, b) => a.field.localeCompare(b.field, "vi"));
  }, [detail, displayedKeys]);

  // Columns cho bảng "Các trường khác"
  const columnsOther = useMemo(
    () => [
      {
        title: "Trường",
        dataIndex: "field",
        sorter: (a, b) => a.field.localeCompare(b.field, "vi"),
        defaultSortOrder: "ascend",
        width: 240,
        render: (t) => <Text code>{t}</Text>,
      },
      {
        title: "Giá trị",
        dataIndex: "value",
        render: (v) => prettyValue(v),
      },
    ],
    []
  );

  const statusOptions = [
    { label: <Tag>draft</Tag>, value: "draft" },
    { label: <Tag color="green">confirmed</Tag>, value: "confirmed" },
    { label: <Tag color="red">canceled</Tag>, value: "cancelled" },
  ];

  return (
    <Modal open={open} onCancel={onClose} width={960} centered destroyOnClose footer={null} title={null}>
      <StickyHeader
        detail={detail}
        onReload={fetchDetail}
        onClose={onClose}
        onPatch={handlePatchStatus}
        onSave={handleSave}
        patching={patching}
        saving={saving}
      />

      {loading && (
        <>
          <Skeleton active paragraph={{ rows: 3 }} />
          <Divider />
          <Skeleton active paragraph={{ rows: 2 }} />
        </>
      )}

      {!loading && err && (
        <Alert
          type="error"
          showIcon
          message="Lỗi"
          description={
            <Space direction="vertical">
              <span>{err}</span>
              <Button icon={<ReloadOutlined />} onClick={fetchDetail} size="small">
                Thử lại
              </Button>
            </Space>
          }
          className="mb-3"
        />
      )}

      {!loading && !err && !detail && <Empty description="Không tìm thấy dữ liệu" />}

      {!loading && !err && detail && (
        <div className="w-full">
          {/* Top summary */}
          <Badge.Ribbon text={(detail.status || "DRAFT").toUpperCase()} color={ribbonColor(detail.status)}>
            <Card className="rounded-2xl shadow-sm mb-4" bodyStyle={{ padding: 16 }}>
              <Row gutter={[12, 12]} align="middle">
                <Col xs={24} md={16}>
                  <Descriptions column={2} size="small" labelStyle={{ width: 130 }}>
                    <Descriptions.Item label="Khách hàng">
                      <Text strong copyable>{detail.customerName || "—"}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="SĐT">
                      <Text strong copyable>{detail.customerPhone || "—"}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Hãng">{prettyValue(detail.brand)}</Descriptions.Item>
                    <Descriptions.Item label="Mẫu">{prettyValue(detail.modelName)}</Descriptions.Item>
                    <Descriptions.Item label="Phiên bản">{prettyValue(detail.versionName)}</Descriptions.Item>
                    <Descriptions.Item label="Màu">{prettyValue(detail.color)}</Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col xs={24} md={8}>
                  <div style={{ display: "grid", gap: 8 }}>
                    <Card size="small" bordered className="rounded-xl" bodyStyle={{ padding: 12 }}>
                      <Statistic title="Tạm tính" value={Number(detail.subtotal)} formatter={(v) => formatVND(Number(v))} />
                    </Card>
                    <Card size="small" bordered className="rounded-xl" bodyStyle={{ padding: 12 }}>
                      <Statistic title="Giảm giá" value={Number(detail.discountAmt)} formatter={(v) => formatVND(Number(v))} />
                    </Card>
                    <Card size="small" bordered className="rounded-xl" bodyStyle={{ padding: 12 }}>
                      <Statistic title={<Text strong>Tổng cộng</Text>} valueStyle={{ color: "#3f51b5" }} value={Number(detail.totalPrice)} formatter={(v) => formatVND(Number(v))} />
                    </Card>
                  </div>
                </Col>
              </Row>
            </Card>
          </Badge.Ribbon>

          <Row gutter={[16, 16]}>
            {/* Left: details */}
            <Col xs={24} md={16}>
              <Card className="rounded-2xl shadow-sm mb-4" title={<Title level={5} className="!mb-0">Đại lý & Thông tin</Title>} bodyStyle={{ padding: 16 }}>
                <Row gutter={[12, 12]}>
                  <Col xs={24}>
                    <Descriptions bordered size="small" column={2} labelStyle={{ width: 130 }}>
                      <Descriptions.Item label="Tên đại lý">{prettyValue(detail.dealerName)}</Descriptions.Item>
                      <Descriptions.Item label="Dealer ID">{prettyValue(detail.dealerId)}</Descriptions.Item>
                      <Descriptions.Item label="Email liên hệ"><Text copyable>{detail.contactEmail || "—"}</Text></Descriptions.Item>
                      <Descriptions.Item label="SĐT liên hệ"><Text copyable>{detail.contactPhone || "—"}</Text></Descriptions.Item>
                    </Descriptions>
                  </Col>
                  <Col xs={24}>
                    <Card size="small" bordered className="rounded-xl" title={<Text strong>Khuyến mãi</Text>} bodyStyle={{ padding: 12 }}>
                      {Array.isArray(detail.promotionNames) && detail.promotionNames.length > 0 ? (
                        <Space wrap>
                          {detail.promotionNames.map((name, i) => (
                            <Tag key={i}>{name}</Tag>
                          ))}
                        </Space>
                      ) : (
                        <Text type="secondary">—</Text>
                      )}
                    </Card>
                  </Col>
                </Row>
              </Card>

              {/* Other fields */}
              {otherFields.length > 0 && (
                <Card className="rounded-2xl shadow-sm" title={<Title level={5} className="!mb-0">Các trường khác</Title>} bodyStyle={{ padding: 12 }}>
                  <Table columns={columnsOther} dataSource={otherFields} pagination={false} rowKey={(r) => r.field} size="small" />
                </Card>
              )}
            </Col>

            {/* Right: stats & quick-edit */}
            <Col xs={24} md={8}>
              <Card className="rounded-2xl shadow-sm mb-4" title={<Title level={5} className="!mb-0">Chỉnh sửa nhanh</Title>} bodyStyle={{ padding: 12 }}>
                <Form layout="vertical" onFinish={handlePatchStatus}>
                  <Form.Item label="Trạng thái">
                    <Select value={status || undefined} placeholder="Chọn trạng thái" allowClear options={statusOptions} onChange={(v) => setStatus(v || "")} />
                  </Form.Item>
                  <Form.Item label="Giảm giá (VND)">
                    <InputNumber className="w-full" min={0} step={100000} value={discountAmt} onChange={(v) => setDiscountAmt(Number(v) || 0)} formatter={(v) => (v ? new Intl.NumberFormat("vi-VN").format(Number(v)) : "")} parser={(v) => (v ? v.replace(/\./g, "") : "")} />
                  </Form.Item>
                  <Space style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button onClick={onClose}>Hủy</Button>
                    <Button type="primary" htmlType="submit" loading={patching}>Cập nhật</Button>
                  </Space>
                </Form>
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </Modal>
  );
}
