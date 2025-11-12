import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Table, Tag, Space, Button, Select, Modal, Form, Flex, Typography, Skeleton, Input, DatePicker, InputNumber, Divider, Tooltip } from "antd";
import api from "../../../../../context/api.jsx";
import { ReloadOutlined, SearchOutlined, FilterOutlined, ClearOutlined, EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "antd/dist/reset.css";
// API base URLs from shared api config or env
const BASE_URL = api.order || import.meta.env.VITE_API_ORDER;
const IDENTITY_BASE_URL = api.identity || import.meta.env.VITE_API_IDENTITY;

// token helpers (try several common keys)
const TOKEN_KEYS = ["token", "accessToken", "jwt", "id_token"];
function getTokenFromLocalStorage() {
  for (const k of TOKEN_KEYS) {
    const v = window.localStorage.getItem(k);
    if (v) return v;
  }
  return null;
}
const STATUS_OPTIONS = ["pending", "shipping", "received", "cancelled", "rejected"];

const STATUS_META = {
  pending: { label: "Đang chờ", color: "gold" },
  shipping: { label: "Đang vận chuyển", color: "processing" },
  received: { label: "Đã nhận", color: "green" },
  cancelled: { label: "Đã hủy", color: "volcano" },
  rejected: { label: "Từ chối", color: "red" },
};

// Map possible backend status values to our unified UI statuses
const BACKEND_TO_UI_STATUS = {
  requested: "pending",
  approved: "pending",
  processing: "pending",
  in_transit: "shipping",
  shipping: "shipping",
  received: "received",
  delivered: "received",
  cancelled: "cancelled",
  canceled: "cancelled",
  rejected: "rejected",
};
// ======= Cho phép theo vai trò dealer =======
const FROM_DEALER_ALLOWED = ["shipping"];
const TO_DEALER_ALLOWED = ["received"];

function statusColor(status) {
  const s = (status || "").toLowerCase();
  return STATUS_META[s]?.color || "default";
}

const ContractTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [pendingStatus, setPendingStatus] = useState({}); // { [id]: status }
  // ===== Filter states (like DistributionOrders) =====
  const [q, setQ] = useState(""); // keyword
  const [fStatuses, setFStatuses] = useState([]);
  const [fDealers, setFDealers] = useState([]);
  const [fReqRange, setFReqRange] = useState([null, null]);
  const [fQtyMin, setFQtyMin] = useState(null);
  const [fQtyMax, setFQtyMax] = useState(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateModalRecord, setUpdateModalRecord] = useState(null);
  const [updateModalSelected, setUpdateModalSelected] = useState("");
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

  // ===== Helpers for filtering =====
  function includesText(hay = "", needle = "") {
    return String(hay).toLowerCase().includes(String(needle).toLowerCase());
  }

  function toTimestampOrInf(d) {
    if (!d) return Infinity;
    const t = new Date(d).getTime();
    return Number.isFinite(t) ? t : Infinity;
  }

  function inRangeDate(iso, start, end) {
    if (!iso) return false;
    const ts = new Date(iso).getTime();
    if (Number.isNaN(ts)) return false;
    const s = start
      ? typeof start.startOf === "function"
        ? start.startOf("day").valueOf()
        : dayjs(start).startOf("day").valueOf()
      : -Infinity;
    const e = end
      ? typeof end.endOf === "function"
        ? end.endOf("day").valueOf()
        : dayjs(end).endOf("day").valueOf()
      : Infinity;
    return ts >= s && ts <= e;
  }

  // derive dealer options from current page data
  const dealerOptions = useMemo(() => {
    const s = new Set();
    data.forEach((r) => {
      if (r.fromDealerName) s.add(r.fromDealerName);
      if (r.toDealerName) s.add(r.toDealerName);
    });
    return Array.from(s).map((d) => ({ label: d, value: d }));
  }, [data]);

  // filtered data (client-side filters applied to current page)
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // keyword: id, vehicle, dealer, status
      if (q) {
        const ok =
          includesText(row.vehicleTransferOrderId || row.key || "", q) ||
          includesText(row.vehicleName, q) ||
          includesText(row.fromDealerName, q) ||
          includesText(row.toDealerName, q) ||
          includesText(row.status, q);
        if (!ok) return false;
      }
      if (fStatuses.length > 0 && !fStatuses.includes(row.status)) return false;
      if (fDealers.length > 0) {
        const dealer = row.toDealerName || row.fromDealerName || "";
        if (!fDealers.includes(dealer)) return false;
      }
      if (fQtyMin != null && Number(row.quantity) < Number(fQtyMin)) return false;
      if (fQtyMax != null && Number(row.quantity) > Number(fQtyMax)) return false;
          if ((fReqRange[0] || fReqRange[1]) && !inRangeDate(row.requestDate, fReqRange[0], fReqRange[1])) return false;
      return true;
    });
      }, [data, q, fStatuses, fDealers, fQtyMin, fQtyMax, fReqRange]);

  const clearFilters = () => {
    setQ("");
    setFStatuses([]);
  setFDealers([]);
  setFReqRange([null, null]);
    setFQtyMin(null);
    setFQtyMax(null);
  };

  const columns = useMemo(
    () => [
      {
        title: "Từ Đại lý",
        dataIndex: "fromDealerName",
        key: "fromDealerName",
        width: 160,
        ellipsis: true,
      },
      {
        title: "Đến Đại lý",
        dataIndex: "toDealerName",
        key: "toDealerName",
        width: 160,
        ellipsis: true,
      },
      {
        title: "Tên xe",
        dataIndex: "vehicleName",
        key: "vehicleName",
        width: 240,
        responsive: ["md"],
        ellipsis: true,
      },
      {
        title: "Số lượng",
        dataIndex: "quantity",
        key: "quantity",
        width: 80,
        align: "center",
      },
      {
        title: "Ngày giao yêu cầu",
        dataIndex: "requestDate",
        key: "requestDate",
        width: 140,
      },
      {
          title: "Status",
        dataIndex: "status",
        key: "status",
        width: 140,
        render: (value) => (
          <Tag color={statusColor(value)} style={{ textTransform: "capitalize" }}>
            {STATUS_META[(value || "").toLowerCase()]?.label || value}
          </Tag>
        ),
      },
      {
        title: "Actions",
        key: "actions",
        width: 160,
        render: (_, record) => {
          const id = record.vehicleTransferOrderId;

          // Status allowed theo dealer hiện tại & record
          const allowed = getAllowedStatusesForRow(record);

          // We'll open a modal to update (UI like DistributionOrders) — keep internal logic in updateStatus
          return (
            <Space>
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => {
                  // determine default selected value
                  const defaultSelected = (pendingStatus[id] ?? record.status);
                  const sel = allowed.includes(defaultSelected) ? defaultSelected : allowed[0];
                  setUpdateModalRecord(record);
                  setUpdateModalSelected(sel);
                  setUpdateModalOpen(true);
                }}
              >
                Cập nhật
              </Button>
            </Space>
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

      {/* ===== Filter Bar (client-side filters for current page) ===== */}
      <div
        style={{
          background: "#fafafa",
          border: "1px solid #f0f0f0",
          borderRadius: 10,
          padding: 12,
          marginBottom: 12,
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }} size={8}>
          <Space wrap style={{ width: "100%", justifyContent: "space-between" }}>
            <Space wrap>
              <Input
                allowClear
                style={{ width: 320 }}
                prefix={<SearchOutlined />}
                placeholder="Tìm (ID / Xe / Đại lý / Trạng thái)"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <Select
                allowClear
                mode="multiple"
                style={{ minWidth: 220 }}
                placeholder="Trạng thái"
                value={fStatuses}
                onChange={setFStatuses}
                options={STATUS_OPTIONS.map((s) => ({ value: s, label: STATUS_META[s]?.label || s }))}
                maxTagCount="responsive"
                suffixIcon={<FilterOutlined />}
              />
              <Select
                allowClear
                mode="multiple"
                style={{ minWidth: 240 }}
                placeholder="Gửi đến Đại lý"
                value={fDealers}
                onChange={setFDealers}
                options={dealerOptions}
                maxTagCount="responsive"
                suffixIcon={<FilterOutlined />}
              />
            </Space>
            <Space>
              <Tooltip title="Xóa toàn bộ bộ lọc">
                <Button icon={<ClearOutlined />} onClick={clearFilters}>
                  Xóa lọc
                </Button>
              </Tooltip>
            </Space>
          </Space>

          <Divider style={{ margin: "8px 0" }} />

          <Space wrap>
            <Space direction="vertical" size={2}>
              <Typography.Text type="secondary">Khoảng ngày yêu cầu</Typography.Text>
              <DatePicker.RangePicker
                value={[fReqRange[0], fReqRange[1]]}
                onChange={(vals) => setFReqRange(vals || [null, null])}
                allowEmpty={[true, true]}
                style={{ width: 280 }}
              />
            </Space>

            {/* Delivery date filter removed per request */}

            <Space direction="vertical" size={2}>
                <Typography.Text type="secondary">Số lượng (từ / đến)</Typography.Text>
              <Space>
                <InputNumber
                  min={0}
                  placeholder="Từ"
                  value={fQtyMin}
                  onChange={setFQtyMin}
                  style={{ width: 120 }}
                />
                <InputNumber
                  min={0}
                  placeholder="Đến"
                  value={fQtyMax}
                  onChange={setFQtyMax}
                  style={{ width: 120 }}
                />
              </Space>
            </Space>
          </Space>
        </Space>
      </div>

      {loading && data.length === 0 ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : (
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          size="middle"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
          }}
          onChange={handleTableChange}
          rowKey={(r) => r.vehicleTransferOrderId}
          scroll={{ x: 1000 }}
        />
      )}

        {/* Update Modal (UI similar to DistributionOrders) */}
        <Modal
          title="Cập nhật trạng thái hợp đồng"
          open={updateModalOpen}
          onCancel={() => setUpdateModalOpen(false)}
          onOk={() => {
            if (!updateModalRecord) return setUpdateModalOpen(false);
            const id = updateModalRecord.vehicleTransferOrderId;
            setUpdateModalOpen(false);
            updateStatus(id, updateModalSelected);
            setUpdateModalRecord(null);
            setUpdateModalSelected("");
          }}
          okText="Cập nhật"
          cancelText="Hủy"
          confirmLoading={updatingId && updateModalRecord && updatingId === updateModalRecord.vehicleTransferOrderId}
          destroyOnClose
        >
          {updateModalRecord && (
            <div>
              <p><strong>ID:</strong> {updateModalRecord.vehicleTransferOrderId}</p>
              <p><strong>Xe:</strong> {updateModalRecord.vehicleName}</p>
              <p><strong>Đại lý:</strong> {updateModalRecord.toDealerName || updateModalRecord.fromDealerName}</p>
              <Form layout="vertical">
                <Form.Item label="Trạng thái">
                  <Select
                    value={updateModalSelected}
                    onChange={(v) => setUpdateModalSelected(v)}
                    options={getAllowedStatusesForRow(updateModalRecord).map((s) => ({ value: s, label: STATUS_META[s]?.label || s }))}
                  />
                </Form.Item>
              </Form>
            </div>
          )}
        </Modal>

      <ToastContainer position="top-right" autoClose={2500} newestOnTop pauseOnHover theme="colored" />
    </div>
  );
};

export default ContractTable;
