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
  cash: "Thanh toán qua tiền mặt",
  bank_transfer: "Thanh toán qua thẻ/ngân hàng",
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

// Parse installment query string
function parseInstallmentMethod(paymentMethod) {
  if (!paymentMethod || typeof paymentMethod !== "string") {
    return { type: paymentMethod || "-", display: paymentMethod || "-" };
  }

  if (paymentMethod.includes("installment")) {
    // Parse query params từ string như "installment?v=1&m=12&pct=10"
    const params = new URLSearchParams(paymentMethod.split("?")[1] || "");
    const percent = params.get("pct");
    const months = params.get("m");
    
    if (months && percent) {
      return {
        type: "installment",
        display: `Trả góp ${percent}% mỗi tháng trong vòng ${months} tháng`,
      };
    }
    
    return {
      type: "installment",
      display: "Trả góp",
    };
  }

  return { type: paymentMethod, display: viPayment[paymentMethod] || paymentMethod };
}

// Get progress color based on percentage
function getProgressColor(percent) {
  if (percent >= 100) return "#52c41a"; // green
  if (percent === 0) return "#faad14"; // yellow (chưa trả)
  return "#d9d9d9"; // gray (neutral)
}

// Get progress color class
function getProgressColorClass(percent) {
  if (percent >= 100) return "bg-green-50"; // green
  if (percent === 0) return "bg-yellow-50"; // yellow
  return ""; // no color
}

// Get progress circle color based on percentage
function getProgressCircleColor(percent) {
  if (percent >= 75) return "#6BCB77"; // Xanh lá (75-100%)
  if (percent >= 50) return "#FFD93D"; // Vàng (50-75%)
  if (percent >= 25) return "#FFA500"; // Cam (25-50%)
  return "#FF6B6B"; // Đỏ (0-25%)
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

  // Payment modal states
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // Payment method modal states
  const [paymentMethodModalOpen, setPaymentMethodModalOpen] = useState(false);
  const [paymentMethodLoading, setPaymentMethodLoading] = useState(false);
  const [paymentMethodSuccess, setPaymentMethodSuccess] = useState("");
  const [isChangingPaymentMethod, setIsChangingPaymentMethod] = useState(false);

  // Installment form states
  const [installmentModalOpen, setInstallmentModalOpen] = useState(false);
  const [installmentMonths, setInstallmentMonths] = useState("");
  const [installmentAdvance, setInstallmentAdvance] = useState("");
  const [installmentLoading, setInstallmentLoading] = useState(false);
  const [installmentError, setInstallmentError] = useState("");

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
      const d = json?.data ?? json ?? null;
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
    
    // Parse payment method
    const paymentParsed = parseInstallmentMethod(d.paymentMethod);
    
    // Get progress
    const progressPercent = parseFloat(d.progressPercent) || 0;

    return {
      id: contract?.id ?? "-",
      customer: d.customerName || contract?.customer || "-",
      car,
      date: formatDateISOToVN(d.signedDate),
      status: viStatus[d.status] || d.status || "-",
      statusRaw: d.status,
      value: formatVND(d.totalValue ?? d.totalAmount ?? null),
      amountPaid: formatVND(d.amountPaid ?? null),
      payment: paymentParsed.display,
      paymentType: paymentParsed.type,
      progressPercent,
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
      notification.success({
        message: "Cập nhật thành công",
        description: `Trạng thái: ${viStatus[statusValue] || statusValue}`,
      });
      setDetail((prev) => ({ ...(prev || {}), status: statusValue }));
    } catch (e) {
      console.error(e);
      message.error(e?.message || "Cập nhật trạng thái thất bại.");
    } finally {
      setUpdating(false);
    }
  };

  const handlePayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      setPaymentError("Nhập số tiền cần thanh toán (> 0)");
      return;
    }

    const totalValue = parseFloat(detail?.totalValue || detail?.totalAmount || 0);
    const amountPaid = parseFloat(detail?.amountPaid || 0);
    const remaining = totalValue - amountPaid;

    if (amount > remaining) {
      setPaymentError(`Số tiền thanh toán không được vượt quá: ${formatVND(remaining)}`);
      return;
    }

    try {
      setPaymentLoading(true);
      setPaymentError("");

      // Extract payment method - only send the base type (e.g., "installment")
      const paymentMethod = detail?.paymentMethod || "installment";
      const basePaymentMethod = paymentMethod.split("?")[0]; // Remove query params

      // Calculate total amount paid: current amountPaid + new payment
      const totalNewAmountPaid = amountPaid + amount;

      const res = await fetch(`${API_CONTRACT_API}/${contract?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          paymentMethod: basePaymentMethod,
          newAmountPaid: totalNewAmountPaid,
        }),
      });

      let data = null;
      const contentType = res.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        try {
          data = await res.json();
        } catch (e) {
          console.warn("Failed to parse JSON response:", e);
          data = {};
        }
      } else {
        const text = await res.text();
        console.warn("Response is not JSON:", text);
        data = {};
      }

      if (!res.ok) {
        const errorMsg = data?.message || `HTTP ${res.status}`;
        setPaymentError(errorMsg);
        message.error(errorMsg);
        return;
      }

      message.success("Thanh toán thành công");
      notification.success({
        message: "Cập nhật thanh toán",
        description: `Đã ghi nhận thanh toán ${formatVND(amount)}`,
      });

      // Clear modal
      setPaymentModalOpen(false);
      setPaymentAmount("");
      setPaymentError("");

      // Refetch detail
      await refetchDetail();

      // Call parent callback
      if (onUpdated) {
        onUpdated();
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Thanh toán thất bại";
      setPaymentError(errorMsg);
      message.error(errorMsg);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleSelectPaymentMethod = async (method) => {
    // Nếu chọn installment, mở modal installment thay vì gửi API ngay
    if (method === "installment") {
      setInstallmentMonths("");
      setInstallmentAdvance("");
      setInstallmentError("");
      setPaymentMethodModalOpen(false);
      setInstallmentModalOpen(true);
      return;
    }

    // Nếu chọn cash hoặc bank_transfer, gửi API ngay
    try {
      setPaymentMethodLoading(true);
      const res = await fetch(`${API_CONTRACT_API}/${contract?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          paymentMethod: method,
        }),
      });

      let data = null;
      const contentType = res.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        try {
          data = await res.json();
        } catch (e) {
          console.warn("Failed to parse JSON response:", e);
          data = {};
        }
      } else {
        const text = await res.text();
        console.warn("Response is not JSON:", text);
        data = {};
      }

      if (!res.ok) {
        const errorMsg = data?.message || `HTTP ${res.status}`;
        message.error(errorMsg);
        return;
      }

      setPaymentMethodSuccess(`Đã đổi thành công: ${viPayment[method] || method}`);
      message.success("Đổi phương thức thanh toán thành công");
      
      // Close modal sau 1.5s
      setTimeout(() => {
        setPaymentMethodModalOpen(false);
        setPaymentMethodSuccess("");
      }, 1500);

      // Refetch detail
      await refetchDetail();

      // Call parent callback
      if (onUpdated) {
        onUpdated();
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Cập nhật phương thức thanh toán thất bại";
      message.error(errorMsg);
    } finally {
      setPaymentMethodLoading(false);
    }
  };

  const handleSubmitInstallment = async () => {
    const months = parseInt(installmentMonths);
    const advance = parseFloat(installmentAdvance) || 0;

    if (!months || months <= 0) {
      setInstallmentError("Nhập số tháng (> 0)");
      return;
    }

    const pct = Math.round((100 / months) * 100) / 100; // Tính % trung bình
    const totalValue = parseFloat(detail?.totalValue || detail?.totalAmount || 0);
    const minAdvance = (pct / 100) * totalValue; // Tính số tiền tối thiểu

    if (advance < minAdvance) {
      setInstallmentError(`Số tiền trả trước tối thiểu phải là ${formatVND(minAdvance)} (${pct}% của giá trị hợp đồng)`);
      return;
    }

    try {
      setInstallmentLoading(true);
      setInstallmentError("");

      const res = await fetch(`${API_CONTRACT_API}/${contract?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          paymentMethod: "installment",
          months,
          pct,
          newAmountPaid: advance,
        }),
      });

      let data = null;
      const contentType = res.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        try {
          data = await res.json();
        } catch (e) {
          console.warn("Failed to parse JSON response:", e);
          data = {};
        }
      } else {
        const text = await res.text();
        console.warn("Response is not JSON:", text);
        data = {};
      }

      if (!res.ok) {
        const errorMsg = data?.message || `HTTP ${res.status}`;
        setInstallmentError(errorMsg);
        message.error(errorMsg);
        return;
      }

      message.success("Cập nhật phương thức trả góp thành công");
      notification.success({
        message: "Cấu hình trả góp thành công",
        description: `${months} tháng - ${pct}% mỗi tháng - Trả trước ${formatVND(advance)}`,
      });
      
      // Close modal
      setTimeout(() => {
        setInstallmentModalOpen(false);
        setInstallmentMonths("");
        setInstallmentAdvance("");
        setInstallmentError("");
      }, 1500);

      // Refetch detail
      await refetchDetail();

      // Call parent callback
      if (onUpdated) {
        onUpdated();
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Cập nhật thất bại";
      setInstallmentError(errorMsg);
      message.error(errorMsg);
    } finally {
      setInstallmentLoading(false);
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
      className={getProgressColorClass(ui.progressPercent)}
      style={{ borderRadius: 8 }}
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
                <Descriptions.Item label="Đã thanh toán">
                  <Text strong>{ui.amountPaid}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Thanh toán">
                  <div>
                    {detail?.paymentMethod && detail?.paymentMethod !== "Not selected yet" && !detail?.paymentMethod?.includes("installment") && (
                      <>
                        <div style={{ marginBottom: 8 }}>{ui.payment}</div>
                        <Button 
                          type="primary"
                          size="small"
                          style={{
                            background: "#1890ff",
                            fontSize: 12,
                            fontWeight: "500"
                          }}
                          onClick={() => {
                            setIsChangingPaymentMethod(true);
                            setPaymentMethodModalOpen(true);
                          }}
                        >
                          Thay đổi phương thức thanh toán
                        </Button>
                      </>
                    )}
                    {!detail?.paymentMethod || detail?.paymentMethod === "Not selected yet" && (
                      <Button 
                        type="primary"
                        size="small"
                        style={{
                          background: "#1890ff",
                          fontSize: 12,
                          fontWeight: "500"
                        }}
                        onClick={() => setPaymentMethodModalOpen(true)}
                      >
                        Lựa chọn phương thức thanh toán
                      </Button>
                    )}
                    {detail?.paymentMethod?.includes("installment") && (
                      <div>{ui.payment}</div>
                    )}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Tiến độ thanh toán">
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      position: "relative",
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      background: `conic-gradient(
                        ${getProgressCircleColor(ui.progressPercent)} 0deg ${Math.min(ui.progressPercent, 100) * 3.6}deg,
                        #f0f0f0 ${Math.min(ui.progressPercent, 100) * 3.6}deg 360deg
                      )`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                    }}>
                      <div style={{
                        width: 52,
                        height: 52,
                        borderRadius: "50%",
                        background: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: "bold",
                        color: getProgressCircleColor(ui.progressPercent),
                        flexDirection: "column"
                      }}>
                        <div>{ui.progressPercent.toFixed(0)}%</div>
                      </div>
                    </div>
                    <Button 
                      type="default"
                      style={{
                        background: "#52C96B",
                        color: "white",
                        border: "none",
                        fontWeight: "500",
                        boxShadow: "0 2px 6px rgba(82, 201, 107, 0.3)",
                        fontSize: 14,
                        paddingLeft: 20,
                        paddingRight: 20
                      }}
                      onClick={() => setPaymentModalOpen(true)}
                    >
                      Thanh toán
                    </Button>
                  </div>
                </Descriptions.Item>
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

      {/* Payment Modal */}
      <Modal
        title="💳 Thanh toán hợp đồng"
        open={paymentModalOpen}
        onOk={handlePayment}
        onCancel={() => {
          setPaymentModalOpen(false);
          setPaymentAmount("");
          setPaymentError("");
        }}
        confirmLoading={paymentLoading}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <Space direction="vertical" style={{ width: "100%" }} size={16}>
          {/* Display current info */}
          <div style={{ background: "#f5f5f5", padding: 12, borderRadius: 6 }}>
            <div style={{ marginBottom: 8 }}>
              <Text>Giá trị hợp đồng: <Text strong>{ui.value}</Text></Text>
            </div>
            <div style={{ marginBottom: 8 }}>
              <Text>Đã thanh toán: <Text strong>{ui.amountPaid}</Text></Text>
            </div>
            <div>
              <Text>Còn lại: <Text strong>{formatVND(Math.max(0, parseFloat(detail?.totalValue || detail?.totalAmount || 0) - parseFloat(detail?.amountPaid || 0)))}</Text></Text>
            </div>
          </div>

          {/* Error Alert */}
          {paymentError && (
            <Alert
              type="error"
              message="Lỗi thanh toán"
              description={paymentError}
              showIcon
              closable
              onClose={() => setPaymentError("")}
            />
          )}

          {/* Payment Input */}
          <div>
            <Text strong>Số tiền cần thanh toán (VND)</Text>
            <Input
              type="number"
              placeholder="Nhập số tiền"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              min="0"
              step="1000"
              style={{ marginTop: 6 }}
              disabled={paymentLoading}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !paymentLoading) {
                  handlePayment();
                }
              }}
            />
          </div>
        </Space>
      </Modal>

      {/* Payment Method Modal */}
      <Modal
        title="Lựa chọn phương thức thanh toán"
        open={paymentMethodModalOpen}
        onCancel={() => {
          setPaymentMethodModalOpen(false);
          setPaymentMethodSuccess("");
          setIsChangingPaymentMethod(false);
        }}
        footer={null}
        width={400}
      >
        <Space direction="vertical" style={{ width: "100%" }} size={12}>
          {paymentMethodSuccess && (
            <Alert
              type="success"
              message={paymentMethodSuccess}
              showIcon
              closable
              onClose={() => setPaymentMethodSuccess("")}
            />
          )}
          
          <Button
            block
            size="large"
            style={{
              background: "#f5f5f5",
              color: "#000",
              border: "1px solid #d9d9d9",
              borderRadius: 6,
              fontWeight: "500",
              fontSize: 14
            }}
            onClick={() => handleSelectPaymentMethod("cash")}
            loading={paymentMethodLoading}
          >
            Thanh toán tiền mặt
          </Button>

          <Button
            block
            size="large"
            style={{
              background: "#f5f5f5",
              color: "#000",
              border: "1px solid #d9d9d9",
              borderRadius: 6,
              fontWeight: "500",
              fontSize: 14
            }}
            onClick={() => handleSelectPaymentMethod("bank_transfer")}
            loading={paymentMethodLoading}
          >
            Thanh toán ngân hàng / thẻ
          </Button>

          {!isChangingPaymentMethod && (
            <Button
              block
              size="large"
              style={{
                background: "#f5f5f5",
                color: "#000",
                border: "1px solid #d9d9d9",
                borderRadius: 6,
                fontWeight: "500",
                fontSize: 14
              }}
              onClick={() => handleSelectPaymentMethod("installment")}
              loading={paymentMethodLoading}
            >
              Thanh toán trả góp
            </Button>
          )}
        </Space>
      </Modal>

      {/* Installment Modal */}
      <Modal
        title="Cấu hình thanh toán trả góp"
        open={installmentModalOpen}
        onOk={handleSubmitInstallment}
        onCancel={() => {
          setInstallmentModalOpen(false);
          setInstallmentMonths("");
          setInstallmentAdvance("");
          setInstallmentError("");
        }}
        confirmLoading={installmentLoading}
        okText="Xác nhận"
        cancelText="Hủy"
        width={450}
      >
        <Space direction="vertical" style={{ width: "100%" }} size={16}>
          {installmentError && (
            <Alert
              type="error"
              message="Lỗi"
              description={installmentError}
              showIcon
              closable
              onClose={() => setInstallmentError("")}
            />
          )}

          {/* Months Input */}
          <div>
            <Text strong>Trả trong vòng tháng</Text>
            <Input
              type="number"
              placeholder="Nhập số tháng"
              value={installmentMonths}
              onChange={(e) => setInstallmentMonths(e.target.value)}
              min="1"
              style={{ marginTop: 6 }}
              disabled={installmentLoading}
            />
          </div>

          {/* Auto-calculated percentage */}
          <div>
            <Text strong>Trung bình phần trăm cần trả mỗi tháng</Text>
            <div style={{
              marginTop: 6,
              padding: "10px 12px",
              background: "#f0f5ff",
              borderRadius: 4,
              border: "1px solid #b3d8ff",
              fontSize: 14,
              fontWeight: "500",
              color: "#1890ff"
            }}>
              {installmentMonths && parseInt(installmentMonths) > 0
                ? `${(Math.round((100 / parseInt(installmentMonths)) * 100) / 100).toFixed(2)}%`
                : "Nhập số tháng để tính toán"}
            </div>
          </div>

          {/* Advance Payment */}
          <div>
            <Text strong>Có thể trả trước</Text>
            <Input
              type="number"
              placeholder="Nhập số tiền (VND)"
              value={installmentAdvance}
              onChange={(e) => setInstallmentAdvance(e.target.value)}
              min="0"
              step="1000"
              style={{ marginTop: 6 }}
              disabled={installmentLoading}
            />
            {installmentAdvance && (
              <Text type="secondary" style={{ fontSize: 12, marginTop: 6, display: "block" }}>
                {formatVND(parseFloat(installmentAdvance))}
              </Text>
            )}
          </div>
        </Space>
      </Modal>
    </Modal>
  );
};

export default ContractModalAnt;
