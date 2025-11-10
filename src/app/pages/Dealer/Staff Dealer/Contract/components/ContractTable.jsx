import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Table, Tag, Space, Button, Select, Flex, Typography, Skeleton } from "antd";
import api from "../../../../../context/api.jsx";
import { ReloadOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "antd/dist/reset.css";

// ======= Config =======
const BASE_URL = api.order || import.meta.env.VITE_API_ORDER;
const IDENTITY_BASE_URL = api.identity || import.meta.env.VITE_API_IDENTITY;
const TOKEN_KEYS = ["token", "accessToken", "jwt", "id_token"]; // we'll try these in order

// Tập status tổng
const STATUS_OPTIONS = [
  "requested",
  "approved",
  "in_transit",
  "received",
  "cancelled",
];

// ======= Cho phép theo vai trò dealer =======
// Nếu dealer hiện tại == fromDealerId -> chỉ cho các status dưới đây
const FROM_DEALER_ALLOWED = [
  "received",
  // TODO: thêm các status khác nếu cần
];

// Nếu dealer hiện tại == toDealerId -> chỉ cho các status dưới đây
const TO_DEALER_ALLOWED = [
  "in_transit",
  // TODO: thêm các status khác nếu cần
];

function getTokenFromLocalStorage() {
  for (const k of TOKEN_KEYS) {
    const v = window.localStorage.getItem(k);
    if (v) return v;
  }
  return null;
}

function statusColor(status) {
  switch ((status || "").toLowerCase()) {
    case "requested":
      return "geekblue";
    case "approved":
      return "purple";
    case "in_transit":
      return "gold";
    case "received":
      return "green";
    case "cancelled":
    case "canceled":
      return "red";
    default:
      return "default";
  }
}

const ContractTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [pendingStatus, setPendingStatus] = useState({}); // { [id]: status }
  const [currentDealerId, setCurrentDealerId] = useState(null); // NEW: dealerId từ /User/me
  const abortRef = useRef(null);

  const token = useMemo(() => getTokenFromLocalStorage(), []);

  // NEW: gọi API get me để lấy dealerId
  const fetchMe = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${IDENTITY_BASE_URL}/api/User/me`, {
        method: "GET",
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${res.statusText}: ${text}`);
      }
      const json = await res.json();
      const dealerId = json?.data?.dealerId || json?.dealerId;
      if (dealerId) {
        setCurrentDealerId(String(dealerId).toLowerCase());
      } else {
        toast.warn("Không lấy được dealerId từ API /User/me.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi lấy thông tin người dùng: " + err.message);
    }
  }, [token]);

  const fetchOrders = useCallback(async (page = 1, pageSize = 10) => {
    if (!token) {
      toast.error("Không tìm thấy token trong LocalStorage.");
      setLoading(false);
      return;
    }
    setLoading(true);

    // cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const url = `${BASE_URL}/api/VehicleTransferOrder?pageNumber=${page}&pageSize=${pageSize}`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${res.statusText}: ${text}`);
      }

      const json = await res.json();
      const items = json?.data?.items ?? [];
      const total = json?.data?.totalItems ?? 0;

      setData(
        items.map((it) => ({
          key: it.vehicleTransferOrderId,
          ...it,
        }))
      );
      setPagination((p) => ({ ...p, current: page, pageSize, total }));
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error(err);
        toast.error("Lỗi tải dữ liệu: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // Lấy đồng thời: thông tin user (dealerId) và danh sách đơn
    fetchMe();
    fetchOrders(1, pagination.pageSize);
    return () => abortRef.current?.abort();
  }, [fetchMe, fetchOrders]);

  const handleTableChange = (pag) => {
    fetchOrders(pag.current, pag.pageSize);
  };

  const updateStatus = async (id, newStatus) => {
    if (!id || !newStatus) return;
    if (!token) {
      toast.error("Không tìm thấy token trong LocalStorage.");
      return;
    }

    try {
      setUpdatingId(id);

      // optimistic UI: update row right away
      setData((prev) => prev.map((r) => (r.vehicleTransferOrderId === id ? { ...r, status: newStatus } : r)));

      const res = await fetch(`${BASE_URL}/api/VehicleTransferOrder/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newStatus), // API expects a raw JSON string, e.g. "received"
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${res.statusText}: ${text}`);
      }

      toast.success("Cập nhật trạng thái thành công.");
      setPendingStatus((m) => ({ ...m, [id]: undefined }));
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thất bại: " + err.message);
      // revert optimistic update by refetching current page
      fetchOrders(pagination.current, pagination.pageSize);
    } finally {
      setUpdatingId(null);
    }
  };

  // Helper: tính các status được phép theo từng dòng + dealer hiện tại
  const getAllowedStatusesForRow = useCallback(
    (row) => {
      // Nếu chưa có dealerId thì không lọc
      if (!currentDealerId) return STATUS_OPTIONS;

      const fromId = (row?.fromDealerId ?? row?.fromDealerID ?? "").toString().toLowerCase();
      const toId = (row?.toDealerId ?? row?.toDealerID ?? "").toString().toLowerCase();

      if (fromId && fromId === currentDealerId) {
        return FROM_DEALER_ALLOWED;
      }
      if (toId && toId === currentDealerId) {
        return TO_DEALER_ALLOWED;
      }
      // Nếu không trùng cả hai thì không giới hạn
      return STATUS_OPTIONS;
    },
    [currentDealerId]
  );

  const columns = useMemo(
    () => [
      {
        title: "From Dealer",
        dataIndex: "fromDealerName",
        key: "fromDealerName",
      },
      {
        title: "To Dealer",
        dataIndex: "toDealerName",
        key: "toDealerName",
      },
      {
        title: "Vehicle",
        dataIndex: "vehicleName",
        key: "vehicleName",
        responsive: ["md"],
      },
      {
        title: "Qty",
        dataIndex: "quantity",
        key: "quantity",
        width: 80,
        align: "center",
      },
      {
        title: "Request Date",
        dataIndex: "requestDate",
        key: "requestDate",
        width: 140,
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (value) => <Tag color={statusColor(value)} style={{ textTransform: "capitalize" }}>{value}</Tag>,
      },
      {
        title: "Actions",
        key: "actions",
        width: 320,
        render: (_, record) => {
          const id = record.vehicleTransferOrderId;

          // Status allowed theo dealer hiện tại & record
          const allowed = getAllowedStatusesForRow(record);

          // Giá trị đang chọn (pending) hoặc status hiện tại
          let selected = pendingStatus[id] ?? record.status;

          // Nếu selected không nằm trong allowed, fallback về:
          if (!allowed.includes(selected)) {
            // ưu tiên giữ nguyên record.status nếu hợp lệ
            if (allowed.includes(record.status)) {
              selected = record.status;
            } else {
              // nếu không, lấy phần tử đầu tiên của allowed
              selected = allowed[0];
            }
            // đồng bộ lại pending để UI hiển thị đúng
            setPendingStatus((m) => ({ ...m, [id]: selected }));
          }

          return (
            <Space.Compact block>
              <Select
                value={selected}
                onChange={(val) => setPendingStatus((m) => ({ ...m, [id]: val }))}
                options={allowed.map((s) => ({ value: s, label: s.replaceAll("_", " ") }))}
                style={{ minWidth: 180 }}
              />
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={updatingId === id}
                onClick={() => updateStatus(id, pendingStatus[id] ?? selected)}
              >
                Update
              </Button>
            </Space.Compact>
          );
        },
      },
    ],
    [pendingStatus, updatingId, getAllowedStatusesForRow]
  );

  return (
    <div className="p-4">
      <Flex align="center" justify="space-between" style={{ marginBottom: 12 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          Vehicle Transfer Orders
        </Typography.Title>
        <Button icon={<ReloadOutlined />} onClick={() => fetchOrders(pagination.current, pagination.pageSize)}>
          Refresh
        </Button>
      </Flex>

      {loading && data.length === 0 ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : (
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
          }}
          onChange={handleTableChange}
          rowKey={(r) => r.vehicleTransferOrderId}
        />
      )}

      <ToastContainer position="top-right" autoClose={2500} newestOnTop pauseOnHover theme="colored" />
    </div>
  );
};

export default ContractTable;
