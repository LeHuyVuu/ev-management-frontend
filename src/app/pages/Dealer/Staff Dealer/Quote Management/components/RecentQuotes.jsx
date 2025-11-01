// RecentQuotes.jsx (Ant Design Table with client-side sorting & pagination)
import React, { useEffect, useState } from "react";
import { Table, Typography, Tag, Space, Button, Alert, message } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined, FolderOpenOutlined } from "@ant-design/icons";
import QuoteDetailModal from "./QuoteDetailModal";
import { getMockQuotes } from "../../../../../context/mock/quotes.mock";

const { Text, Title } = Typography;

const API_URL = "https://prn232.freeddns.org/customer-service/api/quotes/dealers";

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
  if (!Number.isFinite(num)) return n || "";
  return new Intl.NumberFormat("vi-VN").format(num) + " VND";
}

export default function RecentQuotes() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Modal state
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Pagination state (client-side)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, showSizeChanger: true });

  useEffect(() => {
    (async function load() {
      try {
        const token = getTokenFromLocalStorage();
        if (!token) {
          setErr("Không tìm thấy token trong localStorage.");
          // Fallback to mock data
          const mockQuotes = getMockQuotes();
          const rows = mockQuotes.map((q, idx) => ({
            key: q.id || idx,
            quoteId: q.id,
            customerName: q.customerName,
            brand: q.vehicleName?.split(" ")[0] || "N/A",
            vehicleName: q.vehicleName,
            versionName: "",
            totalPrice: Number(q.amount) || 0,
            status: q.status,
            createdAt: q.createdDate || null,
          }));
          setData(rows);
          setLoading(false);
          return;
        }
        const res = await fetch(API_URL, {
          method: "GET",
          headers: { accept: "*/*", Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`API lỗi (${res.status}): ${text || res.statusText}`);
        }
        const json = await res.json();
        const rows = Array.isArray(json?.data)
          ? json.data.map((q, idx) => ({
              key: q.quoteId || idx,
              quoteId: q.quoteId,
              customerName: q.customerName,
              brand: q.brand,
              vehicleName: q.vehicleName,
              versionName: q.versionName,
              totalPrice: Number(q.totalPrice) || 0,
              status: q.status,
              createdAt: q.createdAt || q.timestamp || null,
            }))
          : [];
        // If no data from API, use mock data
        if (rows.length === 0) {
          const mockQuotes = getMockQuotes();
          const mockRows = mockQuotes.map((q, idx) => ({
            key: q.id || idx,
            quoteId: q.id,
            customerName: q.customerName,
            brand: q.vehicleName?.split(" ")[0] || "N/A",
            vehicleName: q.vehicleName,
            versionName: "",
            totalPrice: Number(q.amount) || 0,
            status: q.status,
            createdAt: q.createdDate || null,
          }));
          setData(mockRows);
        } else {
          setData(rows);
        }
      } catch (e) {
        // On error, use mock data as fallback
        console.warn("API failed, using mock data:", e.message);
        const mockQuotes = getMockQuotes();
        const rows = mockQuotes.map((q, idx) => ({
          key: q.id || idx,
          quoteId: q.id,
          customerName: q.customerName,
          brand: q.vehicleName?.split(" ")[0] || "N/A",
          vehicleName: q.vehicleName,
          versionName: "",
          totalPrice: Number(q.amount) || 0,
          status: q.status,
          createdAt: q.createdDate || null,
        }));
        setData(rows);
        setErr(e.message || "Đã xảy ra lỗi khi tải dữ liệu. Sử dụng dữ liệu mẫu.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm(`Bạn có chắc muốn xoá báo giá #${id}?`)) {
      setData((prev) => prev.filter((q) => q.quoteId !== id));
      // TODO: Gọi API xoá nếu backend hỗ trợ
      message.success(`Đã xoá tạm thời báo giá #${id} khỏi danh sách.`);
    }
  };

  const columns = [
    {
      title: "Báo giá",
      dataIndex: "quoteId",
      key: "quoteId",
      sorter: (a, b) => (a.quoteId || "").localeCompare(b.quoteId || ""),
      render: (id) => (
        <Space>
          <FolderOpenOutlined />
          <Text copyable>#{id}</Text>
        </Space>
      ),
      width: 160,
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      sorter: (a, b) => (a.customerName || "").localeCompare(b.customerName || ""),
      render: (v) => <Text strong>{v}</Text>,
    },
    {
      title: "Xe",
      key: "car",
      render: (_, r) => (
        <span>
          {[
            r.brand,
            r.vehicleName, // có thể là modelName tuỳ API
            r.versionName,
          ]
            .filter(Boolean)
            .join(" ")}
        </span>
      ),
      sorter: (a, b) =>
        ([a.brand, a.vehicleName, a.versionName].filter(Boolean).join(" ") || "").localeCompare(
          [b.brand, b.vehicleName, b.versionName].filter(Boolean).join(" ") || ""
        ),
      responsive: ["md"],
    },
    {
      title: "Tổng cộng",
      dataIndex: "totalPrice",
      key: "totalPrice",
      align: "right",
      sorter: (a, b) => a.totalPrice - b.totalPrice,
      render: (n) => <Text style={{ color: "#3f51b5" }}>{formatVND(n)}</Text>,
      width: 160,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "draft", value: "draft" },
        { text: "pending", value: "pending" },
        { text: "confirmed", value: "confirmed" },
        { text: "canceled", value: "canceled" },
        { text: "approved", value: "approved" },
        { text: "rejected", value: "rejected" },
      ],
      onFilter: (value, record) => (record.status || "").toLowerCase() === String(value),
      render: (s) => <Tag>{s || "—"}</Tag>,
      width: 140,
      responsive: ["lg"],
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, r) => (
        <Space>
          <Button size="small" onClick={() => { setSelectedId(r.quoteId); setOpenDetail(true); }} icon={<EyeOutlined />}>
            Xem
          </Button>
          <Button size="small" onClick={() => message.info(`Sửa báo giá #${r.quoteId}`)} icon={<EditOutlined />}>Sửa</Button>
          <Button size="small" danger onClick={() => handleDelete(r.quoteId)} icon={<DeleteOutlined />}>Xoá</Button>
        </Space>
      ),
      width: 220,
    },
  ];

  const handleTableChange = (pager, filters, sorter) => {
    setPagination({ ...pagination, current: pager.current, pageSize: pager.pageSize });
  };

  return (
    <div style={{ width: "100%", padding: 16 }}>
      <Title level={3} style={{ marginBottom: 16 }}>Báo giá Gần đây</Title>

      {err && <Alert type="warning" showIcon message="Lưu ý" description={err} style={{ marginBottom: 12 }} />}

      <Table
        loading={loading}
        columns={columns}
        dataSource={data}
        onChange={handleTableChange}
        pagination={{
          ...pagination,
          showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
        }}
        rowKey={(r) => r.quoteId}
      />

      <QuoteDetailModal
        open={openDetail}
        quoteId={selectedId}
        onClose={() => setOpenDetail(false)}
        onUpdated={() => {
          // Optionally re-fetch list
        }}
      />
    </div>
  );
}
