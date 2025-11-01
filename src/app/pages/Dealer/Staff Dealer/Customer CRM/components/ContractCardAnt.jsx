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
  Progress,
  notification,
} from "antd";
import { UploadOutlined, FileTextOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Dragger } = Upload;

// ===== Config (GIỮ LOGIC CŨ) =====
const API_SERVICE = "https://prn232.freeddns.org/customer-service"; // base
const API_CONTRACT = `${API_SERVICE}/contracts`; // GET detail (đang chạy ổn không có /api)
const API_CONTRACT_API = `${API_SERVICE}/api/contracts`; // PATCH status (cần /api)
const API_UPLOAD = "https://prn232.freeddns.org/utility-service/api/Upload"; // Upload file
const getToken = () => localStorage.getItem("token") ?? "";

// ===== Maps =====
export const viPayment = {
  cash: "Tiền mặt",
  installment: "Trả góp",
};

export const viStatus = {
  draft: "draft",
  confirmed: "confirmed",
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

const ContractModalAnt = ({ open, contract, onClose, onUpdated }) => {
  const [fileContent, setFileContent] = useState("");
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Upload states
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");

  // PATCH status
  const [statusValue, setStatusValue] = useState();
  const [updating, setUpdating] = useState(false);

  // Reusable fetch detail function
  const refetchDetail = async () => {
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
      setDetail(d);
      setStatusValue(d?.status);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Không tải được chi tiết hợp đồng";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      refetchDetail();
    }
  }, [open, contract?.id]);

  useEffect(() => {
    if (!open) {
      setFileContent("");
      setDetail(null);
      setError("");
      setLoading(false);
      setStatusValue(undefined);
      setUpdating(false);
      setUploading(false);
      setUploadProgress(0);
      setUploadError("");
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

  const isPDFData = typeof fileContent === "string" && (fileContent.startsWith("data:application/pdf") || fileContent.toLowerCase().endsWith(".pdf"));

  const uploadProps = {
    multiple: false,
    showUploadList: false,
    accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
    customRequest: async ({ file, onSuccess, onError }) => {
      setUploadError("");
      setUploadProgress(0);

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
      ];
      if (!allowedTypes.includes(file.type)) {
        const errorMsg = "Chỉ hỗ trợ file: PDF, Word, JPG, PNG";
        setUploadError(errorMsg);
        message.error(errorMsg);
        onError?.(new Error(errorMsg));
        return;
      }

      // Validate file size (10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        const errorMsg = "File không được vượt quá 10MB";
        setUploadError(errorMsg);
        message.error(errorMsg);
        onError?.(new Error(errorMsg));
        return;
      }

      try {
        setUploading(true);

        // Step 1: Upload to utility-service
        const formData = new FormData();
        formData.append("file", file);

        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(percent);
          }
        });

        const uploadPromise = new Promise((resolve, reject) => {
          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
              } catch {
                reject(new Error("Invalid JSON response"));
              }
            } else {
              reject(new Error(`Upload failed: ${xhr.status}`));
            }
          });
          xhr.addEventListener("error", () => reject(new Error("Network error")));
          xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));

          xhr.open("POST", API_UPLOAD);
          xhr.setRequestHeader("Authorization", `Bearer ${getToken()}`);
          xhr.send(formData);
        });

        const uploadResult = await uploadPromise;
        const fileUrl = uploadResult?.data;

        if (!fileUrl) {
          throw new Error("Không nhận được URL file từ server");
        }

        // Step 2: Update contract with fileUrl
        const contractId = contract?.id;
        if (!contractId) {
          throw new Error("Không tìm thấy ID hợp đồng");
        }

        const patchRes = await fetch(`${API_CONTRACT_API}/${contractId}/file`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ fileUrl }),
        });

        if (!patchRes.ok) {
          let serverMsg = "";
          try {
            const j = await patchRes.json();
            serverMsg = j?.message || "";
          } catch {}
          throw new Error(serverMsg || `HTTP ${patchRes.status}`);
        }

        // Success
        message.success("Tải file lên thành công");
        notification.success({
          message: "Cập nhật hợp đồng",
          description: "File hợp đồng đã được cập nhật thành công",
        });

        // Refetch detail
        await refetchDetail();

        // Call parent callback
        if (onUpdated) {
          onUpdated();
        }

        onSuccess?.(uploadResult);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Upload thất bại";
        setUploadError(errorMsg);
        message.error(errorMsg);
        notification.error({
          message: "Lỗi upload",
          description: errorMsg,
        });
        onError?.(err);
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
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
            Quản lý file hợp đồng
          </Title>

          {loading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : error ? (
            <Alert type="error" message={error} showIcon />
          ) : (
            <Space direction="vertical" style={{ width: "100%" }} size={16}>
              {/* Khu vực xem file (nếu có) */}
              {ui.fileUrl && ui.fileUrl !== "Contract don't have file" && (
                <div style={{ padding: "12px", background: "#e6f7ff", border: "1px solid #91d5ff", borderRadius: 6 }}>
                  <div style={{ marginBottom: 10 }}>
                    <Text>📄 <strong>File hiện tại:</strong> {ui.fileUrl.split("/").pop()}</Text>
                  </div>
                  <Space size="small">
                    <Button 
                      type="primary" 
                      size="small"
                      onClick={() => {
                        const url = ui.fileUrl;
                        const ext = url.split(".").pop()?.toLowerCase();
                        if (["docx", "doc", "xlsx", "xls", "pptx", "ppt"].includes(ext || "")) {
                          window.open(`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`, "_blank");
                        } else {
                          window.open(url, "_blank");
                        }
                      }}
                    >
                      Xem file
                    </Button>
                  </Space>
                </div>
              )}

              {/* Tiêu đề khu upload */}
              <div>
                <Text strong style={{ fontSize: 13 }}>📤 Cập nhật file hợp đồng</Text>
              </div>

              {/* Error Alert */}
              {uploadError && (
                <Alert
                  type="error"
                  message="Lỗi upload"
                  description={uploadError}
                  showIcon
                  closable
                  onClose={() => setUploadError("")}
                />
              )}

              {/* Progress */}
              {uploading && (
                <div>
                  <Progress percent={uploadProgress} status="active" />
                  <Text type="secondary" style={{ fontSize: 12 }}>Đang tải: {uploadProgress}%</Text>
                </div>
              )}

              {/* Upload Dragger */}
              <Dragger {...uploadProps} disabled={uploading} style={{ padding: 20, backgroundColor: uploading ? "#f5f5f5" : "#fafafa" }}>
                <p style={{ marginBottom: 8, fontSize: 40, color: uploading ? "#bfbfbf" : "#1890ff" }}>
                  ⬆️
                </p>
                <p style={{ marginBottom: 4, fontSize: 14, fontWeight: "500" }}>
                  Kéo thả file vào đây
                </p>
                <p style={{ marginBottom: 0, fontSize: 12, color: "#8c8c8c" }}>
                  hoặc <span style={{ color: "#1890ff", cursor: "pointer" }}>click để chọn file</span>
                </p>
                <p style={{ marginTop: 10, fontSize: 11, color: "#8c8c8c" }}>
                  Hỗ trợ: PDF, Word, JPG, PNG (Tối đa 10MB)
                </p>
              </Dragger>
            </Space>
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
            </>
          )}
        </Col>
      </Row>
    </Modal>
  );
};

export default ContractModalAnt;
