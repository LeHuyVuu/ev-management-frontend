import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Grid,
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
  Alert,
  Tooltip,
  FloatButton,
} from "antd";
import { SearchOutlined, ReloadOutlined, ArrowLeftOutlined, ArrowRightOutlined, RobotOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { searchForecast, askForecast } from "../../context/forecast.api";

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;

function formatDateInput(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt)) return "";
  // yyyy-mm-dd
  return dt.toISOString().slice(0, 10);
}

export default function ForecastPage() {
  // filters (LOGIC PRESERVED)
  const [dealerId, setDealerId] = useState("");
  const [vehicleVersionId, setVehicleVersionId] = useState("");
  const [fromWeek, setFromWeek] = useState("");
  const [toWeek, setToWeek] = useState("");

  // paging (LOGIC PRESERVED)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // data (LOGIC PRESERVED)
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // ask AI (LOGIC PRESERVED)
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);
  const [aiBarOpen, setAiBarOpen] = useState(false);
  const [aiBarCollapsed, setAiBarCollapsed] = useState(false);

  // lấy danh sách dealer/version để fill dropdown từ data đã tải (tạm thời)
  const dealerOptions = useMemo(() => {
    const m = new Map();
    rows.forEach((r) => m.set(r.dealer_id, r.dealer_name));
    return Array.from(m.entries()).map(([id, name]) => ({ value: id, label: `${name} (${id})` }));
  }, [rows]);

  const versionOptions = useMemo(() => {
    const m = new Map();
    rows.forEach((r) => m.set(r.vehicle_version_id, r.version_name));
    return Array.from(m.entries()).map(([id, name]) => ({ value: id, label: `${name} (${id})` }));
  }, [rows]);

  async function loadData(p = 1) {
    try {
      setLoading(true);
      setErr("");
      const payload = {
        page: p,
        pageSize,
      };
      if (dealerId) payload.dealerId = dealerId;
      if (vehicleVersionId) payload.vehicleVersionId = vehicleVersionId;
      if (fromWeek) payload.fromWeek = fromWeek;
      if (toWeek) payload.toWeek = toWeek;

      const res = await searchForecast(payload);
      setRows(res.rows || []);
      setTotal(res.total || 0);
      setPage(res.page || p);
      setPageSize(res.pageSize || pageSize);
    } catch (e) {
      console.error(e);
      setErr(e.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onApplyFilter() {
    loadData(1);
  }

  function onClearFilter() {
    setDealerId("");
    setVehicleVersionId("");
    setFromWeek("");
    setToWeek("");
    setTimeout(() => loadData(1), 0);
  }

  function goPrev() {
    if (page > 1) loadData(page - 1);
  }
  function goNext() {
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    if (page < maxPage) loadData(page + 1);
  }

  async function onAsk() {
    if (!q.trim()) {
      setAnswer("Bạn hãy nhập câu hỏi.");
      return;
    }
    try {
      setAsking(true);
      setAnswer("");
      // gửi kèm rows hiện tại (tối đa ~100 items để payload nhẹ)
      const partialRows = rows.slice(0, 100);
      const res = await askForecast(q, partialRows);
      setAnswer(res.answer || "");
    } catch (e) {
      console.error(e);
      setAnswer(e.message || "Lỗi gọi AI");
    } finally {
      setAsking(false);
    }
  }

  const maxPage = Math.max(1, Math.ceil(total / pageSize));

  // Columns for Ant Table (presentation only; data/logic unchanged)
  const columns = [
    {
      title: "Dealer",
      dataIndex: "dealer_name",
      key: "dealer_name",
      render: (text, r) => (
        <div>
          <div>{r.dealer_name}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{r.dealer_id}</Text>
        </div>
      ),
    },
    {
      title: "Version",
      dataIndex: "version_name",
      key: "version_name",
      render: (text, r) => (
        <div>
          <div>{r.version_name}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{r.vehicle_version_id}</Text>
        </div>
      ),
    },
    {
      title: "Week Start",
      dataIndex: "week_start",
      key: "week_start",
      render: (v) => formatDateInput(v),
    },
    {
      title: "EMA",
      dataIndex: "baseline_ema",
      key: "baseline_ema",
      align: "right",
      render: (v) => Number(v).toLocaleString("vi-VN"),
    },
    {
      title: "Discount",
      dataIndex: "discount_rate_active",
      key: "discount_rate_active",
      align: "right",
      render: (v) => `${Number(v).toLocaleString("vi-VN", { maximumFractionDigits: 2 })}%`,
    },
    {
      title: "Has Promo",
      dataIndex: "has_promo",
      key: "has_promo",
      align: "center",
      render: (v) => (v ? <Tag color="green">✅</Tag> : <Tag>—</Tag>),
    },
    {
      title: "Forecast",
      dataIndex: "forecast_units",
      key: "forecast_units",
      align: "right",
      render: (v) => <Text strong>{Number(v).toLocaleString("vi-VN")}</Text>,
    },
  ];

  return (
    <Spin spinning={loading} tip="Đang tải dữ liệu...">
      <div style={{ padding: 16 }}>
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>Dự báo nhu cầu (Forecast)</Title>
            <Text type="secondary">Giao diện dùng Ant Design · Logic giữ nguyên</Text>
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
                      value={dealerId || undefined}
                      onChange={(v) => setDealerId(v || "")}
                      options={dealerOptions}
                      optionFilterProp="label"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12} lg={6}>
                  <Form.Item label="Version">
                    <Select
                      allowClear
                      showSearch
                      placeholder="-- tất cả --"
                      value={vehicleVersionId || undefined}
                      onChange={(v) => setVehicleVersionId(v || "")}
                      options={versionOptions}
                      optionFilterProp="label"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12} lg={6}>
                  <Form.Item label="Từ ngày (week_start)">
                    <DatePicker
                      style={{ width: "100%" }}
                      value={fromWeek ? dayjs(fromWeek) : null}
                      onChange={(d, dateString) => setFromWeek(dateString || "")}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12} lg={6}>
                  <Form.Item label="Đến ngày (week_start)">
                    <DatePicker
                      style={{ width: "100%" }}
                      value={toWeek ? dayjs(toWeek) : null}
                      onChange={(d, dateString) => setToWeek(dateString || "")}
                    />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Space>
                    <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>Áp dụng lọc</Button>
                    <Button onClick={onClearFilter} icon={<ReloadOutlined />}>Xóa lọc</Button>
                  </Space>
                </Col>
              </Row>
            </Form>
          </Card>

          {/* SUMMARY / STATUS */}
          <Row gutter={[12, 12]}>
            <Col xs={24} md={12} lg={8}>
              <Card size="small">
                <Statistic title="Tổng bản ghi" value={total} />
              </Card>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Card size="small">
                <Statistic title="Trang hiện tại" value={`${page}/${maxPage}`} />
              </Card>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Card size="small">
                <Statistic title="Số dòng / trang" value={pageSize} />
              </Card>
            </Col>
          </Row>

          {err && (
            <Alert type="error" message={err} showIcon />
          )}

          {/* TABLE */}
          <Card size="small" bodyStyle={{ padding: 0 }}>
            <Table
              dataSource={rows.map((r, idx) => ({ ...r, key: idx }))}
              columns={columns}
              pagination={false}
              size="middle"
              sticky
            />

            {/* PAGINATION (LOGIC PRESERVED) */}
            <div style={{ padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f0f0f0" }}>
              <Space>
                <Button onClick={goPrev} disabled={page <= 1} icon={<ArrowLeftOutlined />}>Trước</Button>
                <Button onClick={goNext} disabled={page >= maxPage} icon={<ArrowRightOutlined />} iconPosition="end">Sau</Button>
              </Space>

              <Space align="center">
                <Text>Số dòng/trang</Text>
                <Select
                  value={pageSize}
                  onChange={(v) => { setPageSize(v); setTimeout(() => loadData(1), 0); }}
                  options={[10, 20, 50, 100, 200].map((n) => ({ value: n, label: n }))}
                  style={{ width: 120 }}
                />
                <Pagination
                  simple
                  current={page}
                  pageSize={pageSize}
                  total={total}
                  onChange={(p) => loadData(p)}
                />
              </Space>
            </div>
          </Card>

          {/* ASK AI – Docked bottom bar (Thinkstack-like). LOGIC PRESERVED */}

          {/* Answer bubble (shows above the bar when there's an answer) */}
          {answer && (
            <div
            style={{
              position: "fixed",
              left: "50%",
              transform: "translateX(-50%)",
              bottom: aiBarCollapsed ? 72 : 88,
              width: "min(760px, 96vw)",
              zIndex: 1003,
            }}
            >
              <Card size="small" style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.18)", borderRadius: 12 }} extra={<Button type="text" onClick={() => setAnswer("")}>Đóng</Button>}>
                <Paragraph style={{ whiteSpace: "pre-wrap", margin: 0 }}>{answer}</Paragraph>
              </Card>
            </div>
          )}

          {/* Collapsed pill button */}
          {aiBarCollapsed && (
            <div style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 24, zIndex: 1002 }}>
              <Button
                type="primary"
                shape="round"
                size="large"
                icon={<RobotOutlined />}
                onClick={() => setAiBarCollapsed(false)}
                style={{ paddingInline: 20, boxShadow: "0 8px 28px rgba(0,0,0,0.18)" }}
              >
                Hỏi AI
              </Button>
            </div>
          )}

          {/* Fixed bottom bar */}
          <div
            style={{
              position: "fixed",
              left: "50%",
              transform: "translateX(-50%)",
              bottom: 24,
              width: "min(980px, 92vw)",
              zIndex: 1002,
            }}
          >
            <Card
              size="small"
              bodyStyle={{ padding: 8 }}
              style={{
                borderRadius: 20,
                boxShadow: "0 14px 40px rgba(0,0,0,0.22)",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.35)",
                background: "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(245,247,250,0.92))",
                backdropFilter: "saturate(120%) blur(8px)",
              }}
            >
              <Space align="center" size={8} style={{ width: "100%" }}>
                <div
                  style={{
                    height: 36,
                    width: 36,
                    borderRadius: 12,
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "inset 0 0 0 1px #f0f0f0",
                    flex: "0 0 auto",
                  }}
                >
                  <RobotOutlined />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <TextArea
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Hey! Tôi có thể giúp gì cho bạn? (Enter để gửi, Shift+Enter xuống dòng)"
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    bordered={false}
                    style={{ width: "100%", background: "transparent", paddingInline: 8 }}
                    onPressEnter={(e) => {
                      if (!e.shiftKey) {
                        e.preventDefault();
                        onAsk();
                      }
                    }}
                  />
                </div>

                <div style={{ flex: "0 0 auto" }}>
                  <Space align="center" size={6}>
                    <Button
                      type="text"
                      shape="circle"
                      title="Thu gọn"
                      icon={<MinusOutlined />}
                      onClick={() => setAiBarCollapsed(true)}
                    />
                    <Button type="primary" onClick={onAsk} loading={asking}>
                      Gửi
                    </Button>
                  </Space>
                </div>
              </Space>
            </Card>
          </div>
        </Space>
      </div>
    </Spin>
  );
}
