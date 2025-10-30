import React, { useEffect, useMemo, useState, useCallback } from "react";
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
  notification,
  Progress,
  Button,
  Space,
  Divider,
  Skeleton,
  Select,
} from "antd";

const { Title, Text } = Typography;
const { Dragger } = Upload;

// ===== Config =====
const API_SERVICE = "https://prn232.freeddns.org/customer-service";
const API_CONTRACT = `${API_SERVICE}/contracts`;
const API_CONTRACT_API = `${API_SERVICE}/api/contracts`;
const API_UPLOAD = "https://prn232.freeddns.org/utility-service/api/Upload";
const getToken = () => localStorage.getItem("token") ?? "";

// ===== Maps =====
export const viPayment = { cash: "Tiền mặt", installment: "Trả góp" };
export const viStatus = {
  draft: "draft",
  confirmed: "confirmed",
  approved: "approved",
};
const STATUS_OPTIONS = Object.keys(viStatus);

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

const ContractModalAnt = ({
  open,
  contract,
  onClose,
  onUpdated,
  reloadOnSuccess = false,
}) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusValue, setStatusValue] = useState();
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(""); // Lỗi validation/upload hiển thị trong modal

  // ---- Refetch detail (reusable) ----
  const refetchDetail = useCallback(async () => {
    const id = contract?.id;
    if (!id) return;
    try {
      const res = await fetch(`${API_CONTRACT}/${id}`, {
        headers: { accept: "*/*", Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const d = json?.data ?? null;
      setDetail(d);
      setStatusValue(d?.status);
    } catch (e) {
      // không override error nếu đang hiển thị UI khác
      console.error("Refetch detail failed:", e);
    }
  }, [contract?.id]);

  // Load detail when open
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
    return () => {
      ignore = true;
    };
  }, [open, contract?.id]);

  // Reset when closed
  useEffect(() => {
    if (!open) {
      setDetail(null);
      setError("");
      setLoading(false);
      setStatusValue(undefined);
      setUploadProgress(0);
      setUploading(false);
      setUploadError(""); // Reset lỗi upload
    }
  }, [open]);

  // Derived UI
  const ui = useMemo(() => {
    const d = detail ?? {};
    const car =
      [d.brand, d.vehicleName, d.versionName].filter(Boolean).join(" ") ||
      contract?.car ||
      "-";
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

  // Upload config
  const uploadProps = {
    multiple: false,
    showUploadList: false,
    customRequest: async ({ file, onSuccess, onError }) => {
      const allowed = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/octet-stream",
      ];
      if (!allowed.includes(file.type)) {
        const errMsg = "Định dạng file không hợp lệ. Vui lòng upload file PDF, Word, JPG hoặc PNG.";
        setUploadError(errMsg);
        message.error(errMsg);
        onError?.(new Error("Invalid format"));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        const errMsg = "Kích thước file không được vượt quá 10MB.";
        setUploadError(errMsg);
        message.error(errMsg);
        onError?.(new Error("File too large"));
        return;
      }

      try {
        setUploading(true);
        setUploadProgress(0);
        setUploadError(""); // Clear previous errors
        const loadingKey = `upload_${Date.now()}`;
        message.loading({
          content: "Đang tải file...",
          key: loadingKey,
          duration: 0,
        });

        // XHR to get progress
        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", API_UPLOAD);
          xhr.setRequestHeader("Accept", "*/*");
          xhr.setRequestHeader("Authorization", `Bearer ${getToken()}`);

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              setUploadProgress(Math.round((e.loaded / e.total) * 100));
            }
          };

          xhr.onload = async () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const uploadJson = JSON.parse(xhr.responseText);
                const fileUrl = uploadJson?.data;
                const id = contract?.id;
                if (!id) throw new Error("No contract id");
                if (!fileUrl) throw new Error("Thiếu fileUrl từ server");

                const updateRes = await fetch(
                  `${API_CONTRACT_API}/${id}/file`,
                  {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                      Accept: "*/*",
                      Authorization: `Bearer ${getToken()}`,
                    },
                    body: JSON.stringify({ fileUrl }),
                  }
                );
                if (!updateRes.ok)
                  throw new Error(`Update failed: ${updateRes.status}`);

                // >>> REFRESH + notify <<<
                await refetchDetail();
                message.success({
                  content: "Upload và cập nhật file thành công.",
                  key: loadingKey,
                  duration: 3,
                });
                notification.success({
                  message: "Upload thành công",
                  description:
                    "File đã được upload lên S3 và cập nhật vào hợp đồng.",
                  duration: 4,
                });
                setUploadProgress(100);
                onUpdated?.();
                if (reloadOnSuccess) {
                  setTimeout(() => window.location.reload(), 300);
                }

                onSuccess?.(uploadJson, file);
                resolve(null);
              } catch (err) {
                reject(err);
              }
            } else {
              reject(new Error(`Upload failed: ${xhr.status}`));
            }
          };

          xhr.onerror = () => reject(new Error("Network error during upload"));
          const formData = new FormData();
          formData.append("file", file);
          xhr.send(formData);
        });
      } catch (e) {
        const msg = e?.message || "Upload thất bại";
        setUploadError(msg); // Hiển thị lỗi trong modal
        message.error({ content: msg, duration: 5 });
        notification.error({
          message: "Lỗi upload",
          description: msg,
          duration: 6,
        });
        onError?.(e);
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
  };

  // Patch status
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
      if (!res.ok) throw new Error(`Status update failed: ${res.status}`);

      // >>> REFRESH + notify <<<
      await refetchDetail();
      message.success("Cập nhật trạng thái hợp đồng thành công.");
      notification.success({
        message: "Cập nhật trạng thái",
        description: "Trạng thái hợp đồng đã được cập nhật.",
        duration: 3,
      });
      onUpdated?.();
      if (reloadOnSuccess) {
        setTimeout(() => window.location.reload(), 300);
      }
    } catch (e) {
      const msg = e?.message || "Cập nhật thất bại";
      message.error(msg);
      notification.error({
        message: "Lỗi cập nhật",
        description: msg,
        duration: 6,
      });
    } finally {
      setUpdating(false);
    }
  };

  // ===== Render =====
  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <Space align="center">
          <Title level={4} style={{ margin: 0 }}>
            Chi tiết hợp đồng {ui.id}
          </Title>
          {!!ui.statusRaw && (
            <Tag color={statusTagColor(ui.statusRaw)}>{ui.status}</Tag>
          )}
        </Space>
      }
      width={900}
      footer={null}
      destroyOnClose
    >
      <Row gutter={24}>
        <Col xs={24} md={15}>
          {uploadError && (
            <Alert
              type="error"
              message="Lỗi tải file"
              description={uploadError}
              showIcon
              closable
              onClose={() => setUploadError("")}
              style={{ marginBottom: 16 }}
            />
          )}
          {error ? (
            <Alert type="error" message={error} showIcon />
          ) : ui.fileUrl ? (
            <Space direction="vertical" style={{ width: "100%" }} size="large">
              <div
                style={{
                  background: "#f6ffed",
                  border: "1px solid #95de64",
                  borderRadius: 12,
                  padding: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    flex: 1,
                  }}
                >
                  <span style={{ fontSize: 24 }}>✅</span>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, color: "#262626" }}>
                      File hợp đồng đã được lưu
                    </p>
                    <p
                      style={{
                        margin: "4px 0 0 0",
                        fontSize: 12,
                        color: "#595959",
                      }}
                    >
                      Bạn có thể xem hoặc cập nhật file
                    </p>
                  </div>
                </div>
                <Button 
                  type="primary" 
                  style={{ whiteSpace: "nowrap" }}
                  onClick={() => {
                    const fileUrl = ui.fileUrl;
                    if (fileUrl.toLowerCase().endsWith('.pdf')) {
                      // PDF → mở trực tiếp
                      window.open(fileUrl, '_blank', 'noopener,noreferrer');
                    } else if (fileUrl.toLowerCase().match(/\.(doc|docx|xls|xlsx|ppt|pptx)$/)) {
                      // Office files → dùng Office Web Viewer
                      const viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`;
                      window.open(viewerUrl, '_blank', 'noopener,noreferrer');
                    } else {
                      // Các file khác → mở trực tiếp
                      window.open(fileUrl, '_blank', 'noopener,noreferrer');
                    }
                  }}
                >
                  📄 Xem tài liệu
                </Button>
              </div>

              <div
                style={{
                  border: "2px dashed #faad14",
                  borderRadius: 12,
                  padding: 24,
                  textAlign: "center",
                  background:
                    "linear-gradient(135deg, rgba(250, 173, 20, 0.05) 0%, rgba(255, 245, 213, 0.5) 100%)",
                }}
              >
                {uploading && (
                  <div style={{ marginBottom: 12 }}>
                    <Progress
                      percent={uploadProgress}
                      status={uploadProgress < 100 ? "active" : "success"}
                    />
                  </div>
                )}
                <Dragger
                  {...uploadProps}
                  style={{ border: "none", background: "transparent", padding: 0 }}
                >
                  <p style={{ fontSize: 28, margin: "0 0 12px 0" }}>⬆️</p>
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#262626",
                      margin: "8px 0",
                    }}
                  >
                    Cập nhật file mới
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#8c8c8c",
                      margin: "4px 0 0 0",
                    }}
                  >
                    Kéo thả hoặc nhấp để chọn file
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: "#bfbfbf",
                      margin: "8px 0 0 0",
                    }}
                  >
                    PDF • DOCX • PNG/JPG • Max 10MB
                  </p>
                </Dragger>
              </div>
            </Space>
          ) : (
            <div
              style={{
                border: "2px dashed #1890ff",
                borderRadius: 12,
                padding: 48,
                textAlign: "center",
                background:
                  "linear-gradient(135deg, rgba(24, 144, 255, 0.05) 0%, rgba(230, 245, 255, 0.5) 100%)",
              }}
            >
              {uploading && (
                <div style={{ marginBottom: 12 }}>
                  <Progress
                    percent={uploadProgress}
                    status={uploadProgress < 100 ? "active" : "success"}
                  />
                </div>
              )}
              <Dragger
                {...uploadProps}
                style={{ border: "none", background: "transparent", padding: 0 }}
              >
                <p style={{ fontSize: 40, margin: "0 0 12px 0" }}>📁</p>
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#262626",
                    margin: "8px 0",
                  }}
                >
                  Tải lên file hợp đồng
                </p>
                <p style={{ fontSize: 13, color: "#8c8c8c", margin: "4px 0" }}>
                  Kéo thả file vào đây hoặc nhấp để chọn
                </p>
                <p style={{ fontSize: 12, color: "#bfbfbf", margin: "12px 0 0 0" }}>
                  Hỗ trợ: PDF, DOCX, PNG/JPG • Tối đa 10MB
                </p>
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
                <Descriptions.Item label="Mã hợp đồng">
                  {ui.id}
                </Descriptions.Item>
                <Descriptions.Item label="Khách hàng">
                  {ui.customer}
                </Descriptions.Item>
                <Descriptions.Item label="Mẫu xe">{ui.car}</Descriptions.Item>
                <Descriptions.Item label="Ngày ký">{ui.date}</Descriptions.Item>
                <Descriptions.Item label="Giá trị">
                  <Text strong>{ui.value}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Thanh toán">
                  {ui.payment}
                </Descriptions.Item>
                {ui.dealerName && (
                  <Descriptions.Item label="Đại lý">
                    {ui.dealerName}
                  </Descriptions.Item>
                )}
                {ui.dealerPhone && (
                  <Descriptions.Item label="SĐT Đại lý">
                    {ui.dealerPhone}
                  </Descriptions.Item>
                )}
                {ui.customerPhone && (
                  <Descriptions.Item label="SĐT KH">
                    {ui.customerPhone}
                  </Descriptions.Item>
                )}
                {ui.customerEmail && (
                  <Descriptions.Item label="Email KH">
                    {ui.customerEmail}
                  </Descriptions.Item>
                )}
              </Descriptions>

              <Divider />

              <Title level={5}>Cập nhật trạng thái</Title>
              <Space wrap>
                <Select
                  value={statusValue}
                  style={{ minWidth: 180 }}
                  onChange={setStatusValue}
                  options={STATUS_OPTIONS.map((s) => ({
                    value: s,
                    label: viStatus[s],
                  }))}
                />
                <Button type="primary" loading={updating} onClick={patchStatus}>
                  Cập nhật
                </Button>
              </Space>
            </>
          )}
        </Col>
      </Row>
    </Modal>
  );
};

export default ContractModalAnt;
