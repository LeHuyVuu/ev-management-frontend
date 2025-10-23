import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Typography,
  Descriptions,
  Tag,
  Row,
  Col,
  Spin,
  Alert,
  Upload,
  message,
  Button,
  Space,
  Divider,
  Input,
  Skeleton, // <-- NEW
} from "antd";

const { Title, Text } = Typography;
const { Dragger } = Upload;

// ===== Config (GIỮ LOGIC CŨ) =====
const API_ROOT = "https://prn232.freeddns.org/customer-service/contracts";
const TOKEN = localStorage.getItem("token") ?? "";

// ===== Maps =====
export const viPayment = {
  cash: "Tiền mặt",
  installment: "Trả góp",
} as const;

export const viStatus = {
  approved: "Đã duyệt",
  completed: "Hoàn thành",
  funded: "Đã tài trợ",
  pending: "Chờ xử lý",
} as const;

type PaymentKey = keyof typeof viPayment;
type StatusKey = keyof typeof viStatus;

// ===== Types =====
export type ContractCardInput = {
  id?: string;
  customer?: string;
  car?: string;
  content?: string;
};

type ContractDetail = {
  id?: string;
  customerName?: string;
  brand?: string;
  vehicleName?: string;
  versionName?: string;
  signedDate?: string;
  status?: StatusKey | string;
  totalValue?: number;
  totalAmount?: number;
  paymentMethod?: PaymentKey | string;
  dealerName?: string;
  dealerPhone?: string;
  customerPhone?: string;
  customerEmail?: string;
  fileUrl?: string;
};

type ContractDetailResponse = {
  status?: number;
  message?: string;
  data?: ContractDetail | null;
};

type Props = {
  open: boolean;
  contract: ContractCardInput | null;
  onClose: () => void;
};

// ===== Helpers =====
function formatVND(amount: number | string | null | undefined): string {
  if (amount == null || isNaN(Number(amount))) return "-";
  try {
    return new Intl.NumberFormat("vi-VN").format(Number(amount)) + " VND";
  } catch {
    return `${amount} VND`;
  }
}

function formatDateISOToVN(iso?: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso ?? "-";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function statusTagColor(raw?: string): string {
  switch (raw) {
    case "approved":
      return "green";
    case "pending":
      return "gold";
    case "funded":
      return "blue";
    case "completed":
      return "cyan";
    default:
      return "default";
  }
}

const ContractModalAnt: React.FC<Props> = ({ open, contract, onClose }) => {
  const [fileContent, setFileContent] = useState<string>("");
  const [detail, setDetail] = useState<ContractDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Tải chi tiết hợp đồng
  useEffect(() => {
    let ignore = false;
    async function fetchDetail() {
      const id = contract?.id;
      if (!id) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_ROOT}/${id}`, {
          headers: { accept: "*/*", Authorization: `Bearer ${TOKEN}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as ContractDetailResponse;
        const d = json?.data ?? null;
        if (!ignore) setDetail(d);

        const fileUrl = d?.fileUrl;
        if (
          fileUrl &&
          typeof fileUrl === "string" &&
          fileUrl.toLowerCase().endsWith(".pdf")
        ) {
          if (!ignore) setFileContent(fileUrl);
        }
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Không tải được chi tiết hợp đồng";
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

  // Load sẵn nội dung nếu có
  useEffect(() => {
    if (contract?.content) {
      setFileContent(contract.content);
    } else if (!open) {
      setFileContent("");
      setDetail(null);
      setError("");
      setLoading(false);
    }
  }, [open, contract?.content]);

  const ui = useMemo(() => {
    const d = detail ?? {};
    const car =
      [d.brand, d.vehicleName, d.versionName].filter(Boolean).join(" ") ||
      contract?.car ||
      "-";

    const statusKey = (d.status ?? "") as StatusKey;
    const paymentKey = (d.paymentMethod ?? "") as PaymentKey;

    return {
      id: contract?.id ?? "-",
      customer: d.customerName || contract?.customer || "-",
      car,
      date: formatDateISOToVN(d.signedDate),
      status: viStatus[statusKey] || (d.status as string) || "-",
      statusRaw: d.status as string | undefined,
      value: formatVND(d.totalValue ?? d.totalAmount ?? null),
      payment: viPayment[paymentKey] || (d.paymentMethod as string) || "-",
      dealerName: d.dealerName,
      dealerPhone: d.dealerPhone,
      customerPhone: d.customerPhone,
      customerEmail: d.customerEmail,
      fileUrl: d.fileUrl,
    };
  }, [detail, contract]);

  const isPDFData =
    typeof fileContent === "string" &&
    (fileContent.startsWith("data:application/pdf") ||
      fileContent.toLowerCase().endsWith(".pdf"));

  // Drag & drop file
  const uploadProps = {
    multiple: false,
    showUploadList: false,
    beforeUpload: (file: File) => {
      const reader = new FileReader();
      reader.onload = (ev: ProgressEvent<FileReader>) => {
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

  // ===== Skeleton UI (NEW) =====
  const PreviewSkeleton = () => (
    <div>
      <Skeleton active paragraph={{ rows: 1 }} title={false} />
      <div
        style={{
          border: "1px solid #f0f0f0",
          borderRadius: 8,
          height: 420,
          overflow: "hidden",
          marginTop: 8,
        }}
      >
        <Skeleton.Image
          active
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      <div style={{ marginTop: 12 }}>
        <Skeleton active paragraph={{ rows: 2 }} title={false} />
      </div>
    </div>
  );

  const InfoSkeleton = () => (
    <div>
      <Skeleton active title={{ width: 180 }} paragraph={false} />
      <div style={{ marginTop: 8 }}>
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <Skeleton.Input active style={{ width: "100%", height: 28 }} />
          </div>
        ))}
      </div>
      <Divider />
      <Skeleton active title={{ width: 180 }} paragraph={{ rows: 1 }} />
      <Space style={{ width: "100%" }}>
        <Skeleton.Button active style={{ width: 120, height: 32 }} />
        <Skeleton.Button active danger style={{ width: 90, height: 32 }} />
        <Skeleton.Button active style={{ width: 140, height: 32 }} />
      </Space>
      <Divider />
      <Skeleton active title={{ width: 160 }} paragraph={{ rows: 2 }} />
    </div>
  );

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
        {/* Nội dung hợp đồng */}
        <Col xs={24} md={15}>
          <Title level={5} style={{ marginTop: 0 }}>
            Nội dung hợp đồng
          </Title>

          {/* Khi loading: hiển thị Skeleton thay vì Spin để mượt hơn */}
          {loading && <PreviewSkeleton />}

          {!loading && !!error && <Alert type="error" message={error} showIcon />}

          {!loading && !error && (
            <>
              {fileContent ? (
                <div
                  style={{
                    border: "1px solid #f0f0f0",
                    borderRadius: 8,
                    height: 420,
                    overflow: "hidden",
                  }}
                >
                  {isPDFData ? (
                    <iframe
                      src={fileContent}
                      title="PDF Preview"
                      style={{ width: "100%", height: "100%", border: "none" }}
                    />
                  ) : (
                    <pre
                      style={{
                        margin: 0,
                        padding: 12,
                        height: "100%",
                        overflow: "auto",
                        background: "#fafafa",
                      }}
                    >
                      {fileContent}
                    </pre>
                  )}
                </div>
              ) : ui.fileUrl && ui.fileUrl !== "Contract don't have file" ? (
                <a href={ui.fileUrl} target="_blank" rel="noreferrer">
                  Mở tệp hợp đồng
                </a>
              ) : (
                <Dragger {...uploadProps} style={{ padding: 16 }}>
                  <p className="ant-upload-drag-icon">📄</p>
                  <p className="ant-upload-text">
                    Kéo thả file hợp đồng (PDF/Text) vào đây để xem nội dung
                  </p>
                  <p className="ant-upload-hint">File sẽ không được tải lên server</p>
                </Dragger>
              )}
            </>
          )}
        </Col>

        {/* Sidebar */}
        <Col xs={24} md={9}>
          {loading ? (
            <InfoSkeleton />
          ) : (
            <>
              <Title level={5} style={{ marginTop: 0 }}>
                Thông tin hợp đồng
              </Title>
              <Descriptions size="small" column={1} bordered>
                <Descriptions.Item label="Mã hợp đồng">{ui.id}</Descriptions.Item>
                <Descriptions.Item label="Khách hàng">{ui.customer}</Descriptions.Item>
                <Descriptions.Item label="Mẫu xe">{ui.car}</Descriptions.Item>
                <Descriptions.Item label="Ngày ký">{ui.date}</Descriptions.Item>
                <Descriptions.Item label="Giá trị">
                  <Text strong>{ui.value}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Thanh toán">{ui.payment}</Descriptions.Item>
                {ui.dealerName && (
                  <Descriptions.Item label="Đại lý">{ui.dealerName}</Descriptions.Item>
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

              <Title level={5} style={{ marginTop: 0 }}>
                Hành động hợp đồng
              </Title>
              <Space wrap>
                <Button type="primary">Duyệt hợp đồng</Button>
                <Button danger>Từ chối</Button>
                <Button>Gửi Khách hàng</Button>
              </Space>

              <Divider />

              <Title level={5} style={{ marginTop: 0 }}>
                Ghi chú nội bộ
              </Title>
              <Input.TextArea
                placeholder="Thêm ghi chú về hợp đồng này..."
                rows={3}
                allowClear
              />
            </>
          )}
        </Col>
      </Row>

      {/* Nếu vẫn muốn hiển thị trạng thái tải tổng thể ở góc: giữ Spin nhỏ kèm theo */}
      {/* {loading && <Spin style={{ position: 'absolute', right: 24, bottom: 24 }} />} */}
    </Modal>
  );
};

export default ContractModalAnt;
