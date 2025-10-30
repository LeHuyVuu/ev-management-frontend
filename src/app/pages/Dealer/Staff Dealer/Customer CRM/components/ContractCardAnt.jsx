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
  Skeleton,
  Select,
} from "antd";

const { Title, Text } = Typography;
const { Dragger } = Upload;

// ===== Config =====
const API_SERVICE = "https://localhost:1223/customer-service";
const API_CONTRACT = `${API_SERVICE}/contracts`;
const API_CONTRACT_API = `${API_SERVICE}/api/contracts`;
const API_UPLOAD = "https://prn232.freeddns.org/utility-service/api/Upload";
const getToken = () => localStorage.getItem("token") ?? "";

export const viPayment = { cash: "Tiền mặt", installment: "Trả góp" };
export const viStatus = { draft: "draft", confirmed: "confirmed", approved: "approved" };
const STATUS_OPTIONS = Object.keys(viStatus);

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
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusValue, setStatusValue] = useState();
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);

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
      } catch (e) {
        if (!ignore) setError(e?.message || "Không tải được chi tiết hợp đồng");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    if (open) fetchDetail();
    return () => (ignore = true);
  }, [open, contract?.id]);

  useEffect(() => {
    if (!open) {
      setDetail(null);
      setError("");
      setLoading(false);
      setStatusValue(undefined);
    }
  }, [open]);

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

  const uploadProps = {
    multiple: false,
    showUploadList: false,
    beforeUpload: (file) => {
      const upload = async () => {
        try {
          setUploading(true);
          const formData = new FormData();
          formData.append("file", file);
          const uploadRes = await fetch(API_UPLOAD, {
            method: "POST",
            headers: { Accept: "*/*", Authorization: `Bearer ${getToken()}` },
            body: formData,
          });
          if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.status}`);
          const uploadJson = await uploadRes.json();
          const fileUrl = uploadJson.data;
          const id = contract?.id;
          if (!id) throw new Error("No contract id");
          const updateRes = await fetch(`${API_CONTRACT_API}/${id}/file`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Accept: "*/*", Authorization: `Bearer ${getToken()}` },
            body: JSON.stringify({ fileUrl }),
          });
          if (!updateRes.ok) throw new Error(`Update failed: ${updateRes.status}`);
          // reload detail
          const detailRes = await fetch(`${API_CONTRACT}/${id}`, { headers: { accept: "*/*", Authorization: `Bearer ${getToken()}` } });
          if (detailRes.ok) {
            const js = await detailRes.json();
            setDetail(js?.data ?? null);
          }
          message.success("Đã lưu file hợp đồng thành công.");
        } catch (e) {
          console.error(e);
          message.error(e?.message || "Upload thất bại");
        } finally {
          setUploading(false);
        }
      };
      upload();
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
        headers: { "Content-Type": "application/json", Accept: "*/*", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ status: statusValue }),
      });
      if (!res.ok) throw new Error(`Status update failed: ${res.status}`);
      setDetail((prev) => ({ ...(prev || {}), status: statusValue }));
      message.success("Cập nhật trạng thái hợp đồng thành công.");
    } catch (e) {
      console.error(e);
      message.error(e?.message || "Cập nhật thất bại");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={1000} destroyOnClose title={<Space align="center"><Title level={4} style={{ margin: 0 }}>Chi tiết hợp đồng {ui.id}</Title>{!!ui.status && <Tag color={statusTagColor(ui.statusRaw)}>{ui.status}</Tag>}</Space>}>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={15}>
          <Title level={5} style={{ marginTop: 0 }}>Nội dung hợp đồng</Title>

          {loading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : error ? (
            <Alert type="error" message={error} showIcon />
          ) : ui.fileUrl && ui.fileUrl !== "Contract don't have file" ? (
            <Space direction="vertical" style={{ width: "100%" }} size="large">
              <Alert message="✅ File hợp đồng đã được lưu" type="success" showIcon />
              <a href={ui.fileUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                <Button type="primary" size="large" block>
                  Xem tài liệu
                </Button>
              </a>
            </Space>
          ) : (
            <div style={{ border: "2px dashed #1890ff", borderRadius: 12, padding: 48, textAlign: "center", background: "rgba(24, 144, 255, 0.02)" }}>
              <Dragger {...uploadProps} style={{ border: "none", background: "transparent", padding: 0 }}>
                <p style={{ fontSize: 32, margin: "0 0 12px 0" }}>PDF</p>
                <p style={{ fontSize: 16, fontWeight: 600, color: "#000", margin: "8px 0" }}>Tải lên file hợp đồng</p>
                <p style={{ fontSize: 13, color: "#666", margin: "4px 0" }}>Kéo thả file vào đây hoặc click để chọn</p>
                <p style={{ fontSize: 12, color: "#999", margin: "8px 0 0 0" }}>Hỗ trợ: PDF, Text, DOCX • Tối đa 50MB</p>
              </Dragger>
            </div>
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
                <Descriptions.Item label="Giá trị"><Text strong>{ui.value}</Text></Descriptions.Item>
                <Descriptions.Item label="Thanh toán">{ui.payment}</Descriptions.Item>
                {ui.dealerName && <Descriptions.Item label="Đại lý">{ui.dealerName}</Descriptions.Item>}
                {ui.dealerPhone && <Descriptions.Item label="SĐT Đại lý">{ui.dealerPhone}</Descriptions.Item>}
                {ui.customerPhone && <Descriptions.Item label="SĐT KH">{ui.customerPhone}</Descriptions.Item>}
                {ui.customerEmail && <Descriptions.Item label="Email KH">{ui.customerEmail}</Descriptions.Item>}
              </Descriptions>

              <Divider />

              <Title level={5}>Cập nhật trạng thái</Title>
              <Space wrap>
                <Select value={statusValue} style={{ minWidth: 180 }} onChange={setStatusValue} options={STATUS_OPTIONS.map((s) => ({ value: s, label: viStatus[s] }))} />
                <Button type="primary" loading={updating} onClick={patchStatus}>Cập nhật</Button>
              </Space>
            </>
          )}
        </Col>
      </Row>
    </Modal>
  );
};

export default ContractModalAnt;

