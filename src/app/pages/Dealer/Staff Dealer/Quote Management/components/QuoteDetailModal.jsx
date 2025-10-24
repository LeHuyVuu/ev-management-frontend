// QuoteDetailModal.jsx
import React, { useEffect, useState, useCallback } from "react";
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
  Input,
  Statistic,
  message,
  Card,
  Row,
  Col,
  Tooltip,
  Collapse,
  Table,
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

/** Component hiển thị JSON thuần */
const JSONBlock = ({ data }) => (
  <Paragraph copyable>
    <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
      {JSON.stringify(data, null, 2)}
    </pre>
  </Paragraph>
);

export default function QuoteDetailModal({ open, quoteId, onClose, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [detail, setDetail] = useState(null);

  // form state để PUT/PATCH
  const [customerId, setCustomerId] = useState("");
  const [vehicleVersionId, setVehicleVersionId] = useState("");
  const [optionsJson, setOptionsJson] = useState("");
  const [discountAmt, setDiscountAmt] = useState(0);
  const [status, setStatus] = useState("");

  const [saving, setSaving] = useState(false);   // PUT
  const [patching, setPatching] = useState(false); // PATCH /status

  const syncFormFromDetail = (d) => {
    setCustomerId(d?.customerId || "");
    setVehicleVersionId(d?.vehicleVersionId || "");
    setOptionsJson(
      typeof d?.optionsJson === "string"
        ? d.optionsJson
        : d?.optionsJson
        ? JSON.stringify(d.optionsJson)
        : ""
    );
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

  // PATCH status theo API /api/quotes/{quoteId}/status
  const handlePatchStatus = async () => {
    if (!quoteId) return;
    const token = getTokenFromLocalStorage();
    if (!token) {
      message.error("Không tìm thấy token.");
      return;
    }
    if (!status || typeof status !== "string") {
      message.warning("Vui lòng nhập trạng thái hợp lệ.");
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

      message.success("Đã cập nhật trạng thái thành công (PATCH).");
      await fetchDetail();
      onUpdated?.(quoteId);
    } catch (e) {
      message.error(e.message || "Cập nhật trạng thái thất bại.");
    } finally {
      setPatching(false);
    }
  };

  const parsedOptions = (() => {
    try {
      if (Array.isArray(detail?.optionsJson)) return detail.optionsJson;
      if (typeof detail?.optionsJson === "string" && detail.optionsJson.trim()) {
        return JSON.parse(detail.optionsJson);
      }
      if (optionsJson && typeof optionsJson === "string") return JSON.parse(optionsJson);
    } catch (e) {
      // ignore parse error
    }
    return null;
  })();

  // Columns cho bảng "Tất cả trường"
  const columnsAll = React.useMemo(
    () => [
      {
        title: "Field",
        dataIndex: "field",
        sorter: (a, b) => a.field.localeCompare(b.field, "vi"),
        defaultSortOrder: "ascend",
        width: 220,
        render: (t) => <Text code>{t}</Text>,
      },
      {
        title: "Value",
        dataIndex: "value",
        render: (v) => prettyValue(v),
      },
    ],
    []
  );

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={920}
      centered
      destroyOnClose
      title={
        <Space align="center">
          <Title level={4} className="!mb-0">
            Chi tiết báo giá
          </Title>
          {!!detail?.status && <Tag color={statusColor(detail.status)}>{detail.status}</Tag>}
        </Space>
      }
      footer={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchDetail}>
            Tải lại
          </Button>
          <Button onClick={onClose}>Đóng</Button>
          <Button onClick={handlePatchStatus} loading={patching}>
            Cập nhật trạng thái (PATCH)
          </Button>
          <Button type="primary" onClick={handleSave} loading={saving}>
            Lưu thay đổi (PUT)
          </Button>
        </Space>
      }
    >
      {loading && (
        <>
          <Skeleton active paragraph={{ rows: 3 }} />
          <Divider />
          <Skeleton active paragraph={{ rows: 2 }} />
        </>
      )}

      {!loading && err && (
        <Alert type="error" showIcon message="Lỗi" description={err} className="mb-3" />
      )}

      {!loading && !err && !detail && (
        <Alert type="warning" showIcon message="Không tìm thấy dữ liệu." />
      )}

      {!loading && !err && detail && (
        <Space direction="vertical" className="w-full">
          {/* Hàng tóm tắt */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={14}>
              <Card className="rounded-2xl shadow-sm">
                <Title level={5}>Thông tin khách hàng & xe</Title>
                <Descriptions bordered size="small" column={2} labelStyle={{ width: 160 }}>
                  <Descriptions.Item label="Khách hàng">
                    <Text strong copyable>
                      {detail.customerName}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="SĐT">
                    <Text strong copyable>
                      {detail.customerPhone}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Hãng">{prettyValue(detail.brand)}</Descriptions.Item>
                  <Descriptions.Item label="Mẫu">{prettyValue(detail.modelName)}</Descriptions.Item>
                  <Descriptions.Item label="Phiên bản">
                    {prettyValue(detail.versionName)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Màu">{prettyValue(detail.color)}</Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col xs={24} lg={10}>
              <Card className="rounded-2xl shadow-sm">
                <Title level={5}>Tổng quan giá</Title>
                <Space size="large" wrap>
                  <Statistic
                    title="Tạm tính"
                    value={Number(detail.subtotal)}
                    formatter={(v) => formatVND(Number(v))}
                  />
                  <Statistic
                    title="Giảm giá"
                    value={Number(detail.discountAmt)}
                    formatter={(v) => formatVND(Number(v))}
                  />
                  <Statistic
                    title={<Text strong>Tổng cộng</Text>}
                    valueStyle={{ color: "#3f51b5" }}
                    value={Number(detail.totalPrice)}
                    formatter={(v) => formatVND(Number(v))}
                  />
                </Space>
              </Card>
            </Col>
          </Row>

          {/* ID & trạng thái + chỉnh nhanh */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={14}>
              <Card className="rounded-2xl shadow-sm">
                <Title level={5}>Định danh & Trạng thái</Title>
                <Descriptions bordered size="small" column={1} labelStyle={{ width: 200 }}>
                  <Descriptions.Item label="Quote ID">
                    <Space>
                      <Text copyable>{detail.quoteId || quoteId}</Text>
                      <Tooltip title="Sao chép">
                        <Button
                          type="text"
                          size="small"
                          icon={<CopyOutlined />}
                          onClick={() =>
                            navigator.clipboard.writeText(detail.quoteId || quoteId)
                          }
                        />
                      </Tooltip>
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Dealer ID">
                    {prettyValue(detail.dealerId)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Customer ID">
                    {prettyValue(detail.customerId)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Vehicle Version ID">
                    {prettyValue(detail.vehicleVersionId)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái hiện tại">
                    <Tag color={statusColor(detail.status)}>{detail.status}</Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col xs={24} lg={10}>
              <Card className="rounded-2xl shadow-sm">
                <Title level={5}>Chỉnh sửa nhanh</Title>
                <Form
                  layout="vertical"
                  onFinish={handlePatchStatus}
                  initialValues={{ status }}
                  onValuesChange={(changed) => {
                    if (Object.prototype.hasOwnProperty.call(changed, "status")) {
                      setStatus(changed.status || "");
                    }
                  }}
                >
                  <Form.Item label="Status" name="status">
                    <Input placeholder="draft | pending | confirmed | canceled" />
                  </Form.Item>

                  {/* Mở hai block dưới nếu muốn chỉnh thêm */}
                  {/* <Form.Item label="Discount Amount">
                    <Input
                      type="number"
                      value={discountAmt}
                      onChange={(e) => setDiscountAmt(e.target.value)}
                    />
                  </Form.Item>
                  <Form.Item label="Options JSON">
                    <Input.TextArea
                      rows={3}
                      value={optionsJson}
                      onChange={(e) => setOptionsJson(e.target.value)}
                      placeholder='["option-id-1", {"phu_kien":"Camera 360"}]'
                    />
                  </Form.Item> */}

                  <Space style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button onClick={onClose}>Hủy</Button>
                    <Button type="primary" htmlType="submit" loading={patching}>
                      Cập nhật trạng thái (PATCH)
                    </Button>
                  </Space>
                </Form>
              </Card>
            </Col>
          </Row>

          {/* Options & bảng tất cả trường */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={14}>
              <Card className="rounded-2xl shadow-sm">
                <Title level={5}>Tùy chọn (optionsJson)</Title>
                {parsedOptions ? (
                  Array.isArray(parsedOptions) ? (
                    <Space wrap>
                      {parsedOptions.map((op, idx) => (
                        <Tag key={idx}>{typeof op === "string" ? op : JSON.stringify(op)}</Tag>
                      ))}
                    </Space>
                  ) : (
                    <JSONBlock data={parsedOptions} />
                  )
                ) : (
                  prettyValue(detail.optionsJson)
                )}
              </Card>
            </Col>

            <Col xs={24} lg={10}>
              <Card className="rounded-2xl shadow-sm">
                <Title level={5}>Tất cả trường (sorted + pagination)</Title>
                <Table
                  size="small"
                  rowKey={(r) => r.field}
                  dataSource={Object.entries(detail)
                    .map(([k, v]) => ({ field: k, value: v }))
                    .sort((a, b) => a.field.localeCompare(b.field, "vi"))}
                  columns={columnsAll}
                  pagination={{
                    pageSize: 6,
                    showSizeChanger: true,
                    pageSizeOptions: [6, 10, 20, 50],
                    showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
                  }}
                />
              </Card>
            </Col>
          </Row>

          {/* Dữ liệu thô */}
          <Collapse
            bordered
            items={[
              {
                key: "raw",
                label: <Text strong>Dữ liệu thô từ API (JSON)</Text>,
                children: <JSONBlock data={detail} />,
              },
            ]}
          />

          <Divider className="!my-3" />
        </Space>
      )}
    </Modal>
  );
}
