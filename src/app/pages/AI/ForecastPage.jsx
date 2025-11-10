// src/pages/DebugAllPage.jsx
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Pagination,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

/** =========================
 *  Helpers + API calls (INLINE)
 *  ========================= */
// Nếu frontend reverse-proxy chung domain với backend => để rỗng "" và dùng đường dẫn tương đối.
// Nếu backend khác origin (VD: https://localhost:7050) => set BASE = "https://localhost:7050"
const BASE = "https://localhost:7050"; // dùng tương đối: /utility-service/api/forecast/debug-all

function formatDateISO(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt)) return "";
  return dt.toISOString().slice(0, 10);
}

/** Gọi API debug-all (không tạo file api riêng). */
async function getDebugAllInline(params = {}) {
  const qs = new URLSearchParams();
  qs.set("page", String(params.page ?? 1));
  qs.set("pageSize", String(params.pageSize ?? 20));
  qs.set("horizon", String(params.horizon ?? 8));
  if (params.dealerId) qs.set("dealerId", String(params.dealerId));
  if (params.vehicleVersionId) qs.set("vehicleVersionId", String(params.vehicleVersionId));
  if (params.search && String(params.search).trim().length > 0) {
    qs.set("search", String(params.search).trim());
  }
  const url = `${BASE}/utility-service/api/forecast/debug-all?${qs.toString()}`;
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

/** Lặp qua toàn bộ trang của API pageNumber/pageSize (để lấy danh sách Dealers / Versions). */
async function fetchAllPagesInline(baseUrl, pageSize = 100) {
  const items = [];
  let pageNumber = 1;
  while (true) {
    const url = `${baseUrl}?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status} khi gọi ${url}`);
    const json = await res.json();
    const data = json?.data;
    if (!data?.items) break;
    items.push(...data.items);
    const totalPages = data.totalPages ?? 1;
    if (pageNumber >= totalPages) break;
    pageNumber += 1;
  }
  return items;
}

/** =========================
 *  UI COMPONENT (SINGLE FILE)
 *  ========================= */
export default function DebugAllPage() {
  // ===== Filters =====
  const [dealerId, setDealerId] = useState("");
  const [vehicleVersionId, setVehicleVersionId] = useState("");
  const [searchText, setSearchText] = useState("");
  // Dự phòng (nếu backend sau này hỗ trợ)
  const [fromWeek, setFromWeek] = useState("");
  const [toWeek, setToWeek] = useState("");

  // ===== Paging =====
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // ===== Data =====
  const [rows, setRows] = useState([]);
  const [totalPairs, setTotalPairs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // ===== Options =====
  const [dealerOptions, setDealerOptions] = useState([]);
  const [versionOptions, setVersionOptions] = useState([]);
  const [loadingDealerOpt, setLoadingDealerOpt] = useState(false);
  const [loadingVersionOpt, setLoadingVersionOpt] = useState(false);
  const [optError, setOptError] = useState("");

  // ===== Load dealers & versions =====
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoadingDealerOpt(true);
        const dealers = await fetchAllPagesInline(
          "https://prn232.freeddns.org/dealer-service/api/Dealers",
          100
        );
        if (!mounted) return;
        setDealerOptions(
          dealers.map((d) => ({
            value: d.dealerId,
            label: `${d.name} (${d.dealerCode}) ${d.dealerId}`,
            raw: d,
          }))
        );
      } catch (e) {
        if (mounted) setOptError((prev) => prev || e.message || "Lỗi tải danh sách Dealer");
      } finally {
        if (mounted) setLoadingDealerOpt(false);
      }
    })();

    (async () => {
      try {
        setLoadingVersionOpt(true);
        const versions = await fetchAllPagesInline(
          "https://prn232.freeddns.org/brand-service/api/vehicle-versions",
          100
        );
        if (!mounted) return;
        setVersionOptions(
          versions.map((v) => ({
            value: v.vehicleVersionId,
            label: `${v.brand} ${v.modelName} - ${v.versionName}${
              v.color ? ` · ${v.color}` : ""
            } - ${v.vehicleVersionId}`,
            raw: v,
          }))
        );
      } catch (e) {
        if (mounted) setOptError((prev) => prev || e.message || "Lỗi tải danh sách Version");
      } finally {
        if (mounted) setLoadingVersionOpt(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // ===== Load debug-all data =====
  async function loadData(p = 1) {
    try {
      setLoading(true);
      setErr("");

      const resp = await getDebugAllInline({
        page: p,
        pageSize,
        horizon: 8, // có thể cho user chỉnh nếu muốn
        dealerId: dealerId || undefined,
        vehicleVersionId: vehicleVersionId || undefined,
        search: searchText || undefined,
      });

      setRows(Array.isArray(resp?.data) ? resp.data : []);
      setTotalPairs(resp?.totalPairs ?? 0);
      setPage(resp?.page ?? p);
      setPageSize(resp?.pageSize ?? pageSize);
    } catch (e) {
      setErr(e.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maxPage = Math.max(1, Math.ceil(totalPairs / pageSize));

  function onApplyFilter() {
    loadData(1);
  }
  function onClearFilter() {
    setDealerId("");
    setVehicleVersionId("");
    setSearchText("");
    setFromWeek("");
    setToWeek("");
    setTimeout(() => loadData(1), 0);
  }
  function goPrev() {
    if (page > 1) loadData(page - 1);
  }
  function goNext() {
    if (page < maxPage) loadData(page + 1);
  }

  // ===== Columns =====
  const columns = [
    {
      title: "Dealer",
      key: "dealer",
      render: (_, r) => (
        <div>
          <div>{r.dealerName || <Text type="secondary">—</Text>}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {r.dealerId}
          </Text>
        </div>
      ),
    },
    {
      title: "Vehicle Version",
      key: "vehicle",
      render: (_, r) => (
        <div>
          <div>{r.vehicleLabel || <Text type="secondary">—</Text>}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {r.vehicleVersionId}
          </Text>
        </div>
      ),
    },
    {
      title: "Series (weeks)",
      dataIndex: "seriesLength",
      key: "seriesLength",
      align: "right",
      width: 120,
      render: (v) => <Text strong>{Number(v || 0).toLocaleString("vi-VN")}</Text>,
    },
    {
      title: "Last History Week",
      dataIndex: "lastHistoryWeek",
      key: "lastHistoryWeek",
      width: 140,
      render: (v) => formatDateISO(v),
    },
    {
      title: "Horizon",
      dataIndex: "horizon",
      key: "horizon",
      align: "right",
      width: 90,
    },
    {
      title: "ML Params",
      key: "mlparams",
      width: 240,
      render: (_, r) => (
        <div style={{ lineHeight: 1.3 }}>
          <div>
            windowSize: <Text code>{r.windowSize}</Text>
          </div>
          <div>
            trainSize: <Text code>{r.trainSize}</Text>
          </div>
          <div>
            requiredWeeks: <Text code>{r.requiredWeeks}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Preview InputSeries",
      key: "preview",
      render: (_, r) => {
        const xs = Array.isArray(r.inputSeries) ? r.inputSeries.slice(0, 6) : [];
        if (!xs.length) return <Text type="secondary">—</Text>;
        return (
          <div style={{ lineHeight: 1.3 }}>
            {xs.map((it, i) => (
              <div key={i}>
                <Text code>{formatDateISO(it.weekStart)}</Text>{" "}
                <Text>x</Text>{" "}
                <Text strong>{it.orders}</Text>
              </div>
            ))}
            {r.inputSeries.length > 6 && (
              <Text type="secondary">… và {r.inputSeries.length - 6} tuần nữa</Text>
            )}
          </div>
        );
      },
    },
    {
      title: "Future Weeks",
      dataIndex: "futureWeeks",
      key: "futureWeeks",
      render: (v) => {
        const xs = Array.isArray(v) ? v.slice(0, 4) : [];
        if (!xs.length) return <Text type="secondary">—</Text>;
        return (
          <div style={{ lineHeight: 1.3 }}>
            {xs.map((d, i) => (
              <div key={i}>
                <Text code>{formatDateISO(d)}</Text>
              </div>
            ))}
            {Array.isArray(v) && v.length > 4 && (
              <Text type="secondary">… và {v.length - 4} tuần nữa</Text>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Spin spinning={loading} tip="Đang tải dữ liệu...">
      <div style={{ padding: 16 }}>
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              ML Debug – Tất cả dữ liệu học (debug-all)
            </Title>
            <Text type="secondary">
              Hiển thị chuỗi tuần đã fill 0 và tham số mô hình cho mọi cặp Dealer × Vehicle Version.
            </Text>
          </div>

          {/* FILTERS */}
          <Card size="small" bodyStyle={{ paddingBottom: 4 }}>
            <Form layout="vertical" onFinish={onApplyFilter}>
              <Row gutter={[12, 8]} align="bottom">
                <Col xs={24} md={12} lg={6}>
                  <Form.Item label="Dealer">
                    <Select
                      allowClear
                      showSearch
                      placeholder="-- tất cả --"
                      options={dealerOptions}
                      optionFilterProp="label"
                      value={dealerId || undefined}
                      onChange={(v) => setDealerId(v || "")}
                      loading={loadingDealerOpt}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12} lg={6}>
                  <Form.Item label="Vehicle Version">
                    <Select
                      allowClear
                      showSearch
                      placeholder="-- tất cả --"
                      options={versionOptions}
                      optionFilterProp="label"
                      value={vehicleVersionId || undefined}
                      onChange={(v) => setVehicleVersionId(v || "")}
                      loading={loadingVersionOpt}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12} lg={6}>
                  <Form.Item label="Search (dealer/brand/model/version)">
                    <Input
                      allowClear
                      placeholder="VD: VF9, Saigon..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12} lg={6}>
                  <Form.Item label=" " colon={false}>
                    <Space>
                      <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                        Áp dụng lọc
                      </Button>
                      <Button onClick={onClearFilter} icon={<ReloadOutlined />}>
                        Xóa lọc
                      </Button>
                    </Space>
                  </Form.Item>
                </Col>

                {/* Dự phòng (hiện backend chưa dùng 2 param này) */}
                <Col xs={24} md={12} lg={6}>
                  <Form.Item label="Từ ngày (dự phòng)">
                    <DatePicker
                      style={{ width: "100%" }}
                      value={fromWeek ? dayjs(fromWeek) : null}
                      onChange={(d, dateString) => setFromWeek(dateString || "")}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12} lg={6}>
                  <Form.Item label="Đến ngày (dự phòng)">
                    <DatePicker
                      style={{ width: "100%" }}
                      value={toWeek ? dayjs(toWeek) : null}
                      onChange={(d, dateString) => setToWeek(dateString || "")}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>

            {optError && (
              <Alert
                style={{ marginTop: 8 }}
                type="warning"
                showIcon
                message="Không tải được danh sách Dealer/Version"
                description={optError}
              />
            )}
          </Card>

          {/* SUMMARY */}
          <Row gutter={[12, 12]}>
            <Col xs={24} md={12} lg={8}>
              <Card size="small">
                <Statistic title="Tổng cặp Dealer × Version" value={totalPairs} />
              </Card>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Card size="small">
                <Statistic title="Trang hiện tại" value={`${page}/${Math.max(1, Math.ceil(totalPairs / pageSize))}`} />
              </Card>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Card size="small">
                <Statistic title="Số dòng / trang" value={pageSize} />
              </Card>
            </Col>
          </Row>

          {err && <Alert type="error" message={err} showIcon />}

          {/* TABLE */}
          <Card size="small" bodyStyle={{ padding: 0 }}>
            <Table
              dataSource={(rows || []).map((r, idx) => ({
                ...r,
                key: `${r.dealerId}-${r.vehicleVersionId}-${idx}`,
              }))}
              columns={columns}
              pagination={false}
              size="middle"
              sticky
              expandable={{
                expandedRowRender: (r) => (
                  <div style={{ paddingLeft: 8 }}>
                    <div style={{ marginBottom: 4 }}>
                      <Text strong>InputSeries (tất cả tuần):</Text>
                    </div>
                    {Array.isArray(r.inputSeries) && r.inputSeries.length > 0 ? (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
                          gap: 6,
                        }}
                      >
                        {r.inputSeries.map((it, i) => (
                          <Tag key={i} style={{ marginInlineEnd: 0 }}>
                            {formatDateISO(it.weekStart)} — {it.orders}
                          </Tag>
                        ))}
                      </div>
                    ) : (
                      <Text type="secondary">Không có chuỗi lịch sử</Text>
                    )}
                  </div>
                ),
              }}
            />

            {/* PAGINATION */}
            <div
              style={{
                padding: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid #f0f0f0",
              }}
            >
              <Space>
                <Button onClick={goPrev} disabled={page <= 1} icon={<ArrowLeftOutlined />}>
                  Trước
                </Button>
                <Button onClick={goNext} disabled={page >= maxPage} icon={<ArrowRightOutlined />} iconPosition="end">
                  Sau
                </Button>
              </Space>

              <Space align="center">
                <Text>Số dòng/trang</Text>
                <Select
                  value={pageSize}
                  onChange={(v) => {
                    setPageSize(v);
                    setTimeout(() => loadData(1), 0);
                  }}
                  options={[10, 20, 50, 100, 200].map((n) => ({ value: n, label: n }))}
                  style={{ width: 120 }}
                />
                <Pagination simple current={page} pageSize={pageSize} total={totalPairs} onChange={(p) => loadData(p)} />
              </Space>
            </div>
          </Card>
        </Space>
      </div>
    </Spin>
  );
}
