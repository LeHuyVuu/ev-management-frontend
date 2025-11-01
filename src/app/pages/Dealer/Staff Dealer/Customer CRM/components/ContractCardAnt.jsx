import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Typography,
  Descriptions,
  Tag,
  Row,
  Col,
  Alert,
  Upload,
  message,
  Button,
  Space,
  Divider,
  Input,
  Skeleton,
  Select,
} from "antd";

const { Title, Text } = Typography;
const { Dragger } = Upload;

// ===== Config (GIỮ LOGIC CŨ) =====
const API_SERVICE = "https://prn232.freeddns.org/customer-service"; // base
const API_CONTRACT = `${API_SERVICE}/contracts`; // GET detail (đang chạy ổn không có /api)
const API_CONTRACT_API = `${API_SERVICE}/api/contracts`; // PATCH status (cần /api)
const getToken = () => localStorage.getItem("token") ?? "";

// ===== Maps =====
export const viPayment = {
  cash: "Tiền mặt",
  installment: "Trả góp",
};

export const viStatus = {
  draft: "draft",
  approved: "approved",
};

const STATUS_OPTIONS = Object.keys(viStatus); // only: draft, confirmed, approved

// ===== Helpers =====
function formatVND(amount) {
  if (amount == null || isNaN(Number(amount))) return "-";
  try {
    return new Intl.NumberFormat("vi-VN").format(Number(amount)) + " VND";
  } catch {
    return `${amount} VND`;
  }
}

function formatDateISOToVN(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso ?? "-";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function statusTagColor(raw) {
  switch (raw) {
    case "draft":
      return "default";
    case "confirmed":
      return "gold";
    case "approved":
      return "green";
    default:
      return "default";
  }
}

const ContractModalAnt = ({ open, contract, onClose }) => {
  const [fileContent, setFileContent] = useState("");
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // PATCH status
  const [statusValue, setStatusValue] = useState();
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function fetchDetail() {
      const id = contract?.id;
      if (!id) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_CONTRACT}/${id}`, {
          headers: { accept: "*/*", Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const d = json?.data ?? null;
        if (!ignore) {
          setDetail(d);
          setStatusValue(d?.status);
        }

        const fileUrl = d?.fileUrl;
        if (fileUrl && typeof fileUrl === "string" && fileUrl.toLowerCase().endsWith(".pdf")) {
          if (!ignore) setFileContent(fileUrl);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Không tải được chi tiết hợp đồng";
        if (!ignore) setError(msg);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    if (open) fetchDetail();
    return () => {
      ignore = true;
    };
  }, [open, contract?.id]);

  useEffect(() => {
    if (contract?.content) {
      setFileContent(contract.content);
    } else if (!open) {
      setFileContent("");
      setDetail(null);
      setError("");
      setLoading(false);
      setStatusValue(undefined);
      setUpdating(false);
    }
  }, [open, contract?.content]);

  const ui = useMemo(() => {
    const d = detail ?? {};
    const car = [d.brand, d.vehicleName, d.versionName].filter(Boolean).join(" ") || contract?.car || "-";

    return {
      id: contract?.id ?? "-",
      customer: d.customerName || contract?.customer || "-",
      car,
      date: formatDateISOToVN(d.signedDate),
      status: viStatus[d.status] || d.status || "-",
      statusRaw: d.status,
      value: formatVND(d.totalValue ?? d.totalAmount ?? null),
      payment: viPayment[d.paymentMethod] || d.paymentMethod || "-",
      dealerName: d.dealerName,
      dealerPhone: d.dealerPhone,
      customerPhone: d.customerPhone,
      customerEmail: d.customerEmail,
      fileUrl: d.fileUrl,
    };
  }, [detail, contract]);

  const isPDFData = typeof fileContent === "string" && (fileContent.startsWith("data:application/pdf") || fileContent.toLowerCase().endsWith(".pdf"));

  const uploadProps = {
    multiple: false,
    showUploadList: false,
    beforeUpload: (file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev?.target?.result;
        if (typeof result === "string") {
          setFileContent(result);
          message.success("Đã tải nội dung file lên vùng xem.");
        }
      };
      if (file.type === "application/pdf") reader.readAsDataURL(file);
      else if (file.type.startsWith("text/")) reader.readAsText(file);
      else message.warning("Chỉ hỗ trợ PDF hoặc text.");
      return false;
    },
  };

  const patchStatus = async () => {
    const id = contract?.id;
    if (!id || !statusValue) return message.warning("Chọn trạng thái trước.");
    try {
      setUpdating(true);
      const res = await fetch(`${API_CONTRACT_API}/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status: statusValue }),
      });
      if (!res.ok) {
        let serverMsg = "";
        try { const j = await res.json(); serverMsg = j?.message || ""; } catch {}
        if (serverMsg) throw new Error(serverMsg);
        const text = await res.text();
        throw new Error(`${res.status} ${res.statusText}: ${text}`);
      }
      message.success("Cập nhật trạng thái hợp đồng thành công.");
      setDetail((prev) => ({ ...(prev || {}), status: statusValue }));
    } catch (e) {
      console.error(e);
      message.error(e?.message || "Cập nhật trạng thái thất bại.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000}
      destroyOnClose
      title={
        <Space align="center">
          <Title level={4} style={{ margin: 0 }}>
            Chi tiết hợp đồng {ui.id}
          </Title>
          {!!ui.status && <Tag color={statusTagColor(ui.statusRaw)}>{ui.status}</Tag>}
        </Space>
      }
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} md={15}>
          <Title level={5} style={{ marginTop: 0 }}>
            Nội dung hợp đồng
          </Title>

          {loading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : error ? (
            <Alert type="error" message={error} showIcon />
          ) : fileContent ? (
            <div style={{ border: "1px solid #f0f0f0", borderRadius: 8, height: 420, overflow: "hidden" }}>
              {isPDFData ? (
                <iframe src={fileContent} title="PDF Preview" style={{ width: "100%", height: "100%", border: "none" }} />
              ) : (
                <pre style={{ margin: 0, padding: 12, height: "100%", overflow: "auto", background: "#fafafa" }}>{fileContent}</pre>
              )}
            </div>
          ) : ui.fileUrl && ui.fileUrl !== "Contract don't have file" ? (
            <a href={ui.fileUrl} target="_blank" rel="noreferrer">
              Mở tệp hợp đồng
            </a>
          ) : (
            <Dragger {...uploadProps} style={{ padding: 16 }}>
              <p className="ant-upload-drag-icon">📄</p>
              <p className="ant-upload-text">Kéo thả file hợp đồng (PDF/Text) vào đây để xem nội dung</p>
              <p className="ant-upload-hint">File sẽ không được tải lên server</p>
            </Dragger>
          )}
        </Col>

        <Col xs={24} md={9}>
          {loading ? (
            <Skeleton active paragraph={{ rows: 10 }} />
          ) : (
            <>
              <Title level={5}>Thông tin hợp đồng</Title>
              <Descriptions size="small" column={1} bordered>
                <Descriptions.Item label="Mã hợp đồng">{ui.id}</Descriptions.Item>
                <Descriptions.Item label="Khách hàng">{ui.customer}</Descriptions.Item>
                <Descriptions.Item label="Mẫu xe">{ui.car}</Descriptions.Item>
                <Descriptions.Item label="Ngày ký">{ui.date}</Descriptions.Item>
                <Descriptions.Item label="Giá trị">
                  <Text strong>{ui.value}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Thanh toán">{ui.payment}</Descriptions.Item>
                {ui.dealerName && <Descriptions.Item label="Đại lý">{ui.dealerName}</Descriptions.Item>}
                {ui.dealerPhone && <Descriptions.Item label="SĐT Đại lý">{ui.dealerPhone}</Descriptions.Item>}
                {ui.customerPhone && <Descriptions.Item label="SĐT KH">{ui.customerPhone}</Descriptions.Item>}
                {ui.customerEmail && <Descriptions.Item label="Email KH">{ui.customerEmail}</Descriptions.Item>}
              </Descriptions>

              <Divider />

              <Title level={5}>Cập nhật trạng thái</Title>
              <Space wrap>
                <Select
                  value={statusValue}
                  style={{ minWidth: 180 }}
                  onChange={setStatusValue}
                  options={STATUS_OPTIONS.map((s) => ({ value: s, label: viStatus[s] }))}
                />
                <Button type="primary" loading={updating} onClick={patchStatus}>
                  Cập nhật
                </Button>
              </Space>

              <Divider />

              <Title level={5}>Ghi chú nội bộ</Title>
              <Input.TextArea placeholder="Thêm ghi chú về hợp đồng này..." rows={3} allowClear />
            </>
          )}
        </Col>
      </Row>
    </Modal>
  );
};

export default ContractModalAnt;
