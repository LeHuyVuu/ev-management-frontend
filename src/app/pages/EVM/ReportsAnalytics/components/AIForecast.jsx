// AIForecast.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { Select, Switch } from "antd";

ChartJS.register(
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

// ===== Helpers =====
// (GIỮ NGUYÊN) Base cũ — nhưng giờ mình thêm toggle để chọn Domain/Localhost
const BASE = "https://prn232.freeddns.org"; // "" = same-origin

// [ADD] Lấy trạng thái toggle base url từ localStorage
function getInitialUseDomain() {
  try {
    const v = localStorage.getItem("aifc.useDomain");
    return v === "1";
  } catch {
    return true; // mặc định domain như code cũ
  }
}

// [ADD] (tuỳ chọn) clear SW + caches để giảm dính bundle cũ khi đổi toggle
async function nukeSwAndCaches() {
  try {
    if (navigator?.serviceWorker?.getRegistrations) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
    if (window?.caches?.keys) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
    console.log("[AIForecast] cleared service workers & caches");
  } catch (e) {
    console.warn("[AIForecast] cannot clear SW/caches:", e);
  }
}

// [ADD] Tiện ích ghép URL tuyệt đối từ base + path + query
function abs(BASE_URL, path, queryObj) {
  const root = String(BASE_URL || "").replace(/\/+$/, "");
  const p = String(path || "").replace(/^\/+/, "");
  let url = `${root}/${p}`;
  if (queryObj) {
    const qs = new URLSearchParams();
    Object.entries(queryObj).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).length > 0) {
        qs.append(k, String(v));
      }
    });
    url += `?${qs.toString()}`;
  }
  return url;
}

function toQS(obj) {
  const qs = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).length > 0) {
      qs.append(k, String(v));
    }
  });
  return qs.toString();
}

function fmtDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? "" : dt.toISOString().slice(0, 10);
}

// Build vertical gradient without deps
function makeVGradient(ctx, area, from, to) {
  const g = ctx.createLinearGradient(0, area.top, 0, area.bottom);
  g.addColorStop(0, from);
  g.addColorStop(1, to);
  return g;
}

const nf = new Intl.NumberFormat("vi-VN");

const AIForecast = () => {
  // [ADD] Toggle Base URL
  const [useDomain, setUseDomain] = useState(getInitialUseDomain);
  const BASE_URL = useMemo(
    () => (useDomain ? "https://prn232.freeddns.org" : "https://localhost:7050"),
    [useDomain]
  );
  const onToggleBase = async (checked) => {
    setUseDomain(checked);
    try {
      localStorage.setItem("aifc.useDomain", checked ? "1" : "0");
    } catch { }
    // (tuỳ chọn) clear SW/caches để hạn chế “bản cũ” trong trình duyệt
    await nukeSwAndCaches();
    // Reload dữ liệu với BASE_URL mới
    await loadAll(checked ? "https://prn232.freeddns.org" : "https://localhost:7050");
    // Đồng thời reload options (vehicles, dealers)
    await loadOptions(checked ? "https://prn232.freeddns.org" : "https://localhost:7050");
  };

  // Filters
  const [vehicleVersionId, setVehicleVersionId] = useState("");
  const [dealerId, setDealerId] = useState("");
  const [horizon, setHorizon] = useState(8);

  // Options
  const [vehicleOptions, setVehicleOptions] = useState([]);
  const [dealerOptions, setDealerOptions] = useState([]);
  const [optLoading, setOptLoading] = useState(false);
  const [optErr, setOptErr] = useState("");

  // Data states
  const [weeklyTotal, setWeeklyTotal] = useState([]); // [{week_start, demand}]
  const [allocate, setAllocate] = useState([]); // [{dealer_id, vehicle_version_id, quantity}]
  const [debugRows, setDebugRows] = useState([]); // payloads from debug-all
  const [totalPairs, setTotalPairs] = useState(0);

  // Paging for debug-all
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Loading & error
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // ===== Heuristic recommendations (fallback) =====
  const recommendations = useMemo(() => {
    try {
      const messages = [];
      if (weeklyTotal?.length > 0) {
        const sum = weeklyTotal.reduce((s, r) => s + Number(r?.demand || 0), 0);
        const avg = sum / weeklyTotal.length;
        const last4 = weeklyTotal.slice(-4);
        const last4Avg =
          last4.length > 0
            ? last4.reduce((s, r) => s + Number(r?.demand || 0), 0) / last4.length
            : avg;

        if (last4Avg > avg * 1.12) {
          messages.push(
            "Nhu cầu 4 tuần gần đây tăng mạnh so với trung bình → cân nhắc tăng sản xuất/điều chuyển thêm."
          );
        } else if (last4Avg < avg * 0.88) {
          messages.push(
            "Nhu cầu 4 tuần gần đây giảm so với trung bình → xem xét giảm sản xuất hoặc đẩy khuyến mãi."
          );
        } else {
          messages.push(
            "Nhu cầu ổn định quanh mức trung bình → duy trì kế hoạch hiện tại, theo dõi thêm."
          );
        }
      }

      if (allocate?.length > 0) {
        const totalAlloc = allocate.reduce((s, r) => s + Number(r.quantity || 0), 0);
        const high = allocate
          .filter((x) => x.quantity >= Math.max(2, totalAlloc * 0.15))
          .slice(0, 3);
        if (high.length > 0) {
          const ids = high.map((h) => h.dealer_id).join(", ");
          messages.push(
            `Các dealer có phân bổ lớn: ${ids}. Hãy đảm bảo năng lực nhận xe & tồn kho phù hợp.`
          );
        }
      }

      if (debugRows?.length > 0) {
        const shorts = debugRows.filter((r) => r.seriesLength < r.requiredWeeks);
        if (shorts.length > 0) {
          messages.push(
            `Có ${shorts.length} cặp Dealer × Version có lịch sử ngắn (< requiredWeeks). Nên bơm thêm dữ liệu/giảm horizon để dự báo ổn định.`
          );
        }
      }

      if (messages.length === 0) {
        messages.push("Chưa đủ dữ liệu để tạo gợi ý. Vui lòng chọn phiên bản xe hoặc nạp dữ liệu.");
      }
      return messages;
    } catch {
      return ["Không tạo được khuyến nghị do lỗi dữ liệu."];
    }
  }, [weeklyTotal, allocate, debugRows]);

  // ===== fetch dropdown options on mount =====
  async function loadOptions(baseOverride) {
    const base = baseOverride || BASE_URL;
    setOptErr("");
    setOptLoading(true);
    try {
      const [vRes, dRes] = await Promise.all([
        // (ĐỔI sang dùng BASE_URL hiện tại)
        fetch(abs("https://prn232.freeddns.org", "/brand-service/api/vehicle-versions"), {
          headers: { accept: "application/json" },
          mode: "cors",
          cache: "no-store",
        }),
        fetch(abs("https://prn232.freeddns.org", "/dealer-service/api/Dealers"), {
          headers: { accept: "application/json" },
          mode: "cors",
          cache: "no-store",
        }),
      ]);

      if (!vRes.ok) throw new Error(`Vehicle versions: ${vRes.statusText}`);
      if (!dRes.ok) throw new Error(`Dealers: ${dRes.statusText}`);

      const vJson = await vRes.json();
      const dJson = await dRes.json();

      const vItems = Array.isArray(vJson?.data?.items) ? vJson.data.items : [];
      const dItems = Array.isArray(dJson?.data?.items) ? dJson.data.items : [];

      setVehicleOptions(
        vItems.map((it) => ({
          id: it.vehicleVersionId,
          label: [it.brand, it.modelName, it.versionName, it.color, it.evType]
            .filter(Boolean)
            .join(" • "),
        }))
      );

      setDealerOptions(
        dItems.map((it) => ({
          id: it.dealerId,
          label: `${it.dealerCode} • ${it.name} - ${it.region} `.trim(),
        }))
      );
    } catch (e) {
      setOptErr(e?.message || "Không tải được danh sách dropdown");
    } finally {
      setOptLoading(false);
    }
  }

  useEffect(() => {
    loadOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [BASE_URL]);

  // ===== Fetchers (GIỮ NGUYÊN chức năng – chỉ đổi sang BASE_URL) =====
  async function fetchWeeklyTotal(baseOverride) {
    const base = baseOverride || BASE_URL;
    if (!vehicleVersionId) {
      setWeeklyTotal([]);
      return;
    }
    const qs = toQS({ vehicleVersionId, horizon });
    const url = abs(base, "/utility-service/api/forecast/weekly-total", null) + `?${qs}`;
    const res = await fetch(url, { headers: { accept: "application/json" }, cache: "no-store" });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    setWeeklyTotal(Array.isArray(json) ? json : []);
  }

  async function fetchAllocate(baseOverride) {
    const base = baseOverride || BASE_URL;
    if (!vehicleVersionId) {
      setAllocate([]);
      return;
    }
    const qs = toQS({ vehicleVersionId, horizon, holdback: 0.1 });
    const url = abs(base, "/utility-service/api/forecast/allocate", null) + `?${qs}`;
    const res = await fetch(url, { headers: { accept: "application/json" }, cache: "no-store" });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    setAllocate(Array.isArray(json) ? json : []);
  }

  async function fetchDebugAll(baseOverride) {
    const base = baseOverride || BASE_URL;
    const qs = toQS({
      page,
      pageSize,
      horizon,
      dealerId,
      vehicleVersionId,
    });
    const url = abs(base, "/utility-service/api/forecast/debug-all", null) + `?${qs}`;
    const res = await fetch(url, { headers: { accept: "application/json" }, cache: "no-store" });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    setDebugRows(Array.isArray(json?.data) ? json.data : []);
    setTotalPairs(Number(json?.totalPairs || 0));
  }

  async function loadAll(baseOverride) {
    const base = baseOverride || BASE_URL;
    setErr("");
    setLoading(true);
    try {
      await Promise.all([fetchWeeklyTotal(base), fetchAllocate(base), fetchDebugAll(base)]);
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, BASE_URL]);

  // ===== Charts (GIỮ NGUYÊN) =====
  const lineData = useMemo(() => {
    const labels = weeklyTotal.map((x) => x.week_start);
    const values = weeklyTotal.map((x) => Number(x.demand || 0));

    const dataset = {
      label: "Forecast Demand",
      data: values,
      borderWidth: 2,
      borderColor: "#2563eb",
      backgroundColor: (ctx) => {
        const { chart } = ctx;
        const { ctx: c, chartArea } = chart;
        if (!chartArea) return "rgba(37, 99, 235, 0.15)";
        return makeVGradient(c, chartArea, "rgba(37,99,235,0.25)", "rgba(37,99,235,0.02)");
      },
      fill: true,
      tension: 0.35,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBorderWidth: 0,
      pointBackgroundColor: "#2563eb",
      cubicInterpolationMode: "monotone",
      borderCapStyle: "round",
      borderJoinStyle: "round",
    };

    return { labels, datasets: [dataset] };
  }, [weeklyTotal]);

  const lineOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: true, position: "top", labels: { usePointStyle: true } },
        tooltip: {
          callbacks: {
            title: (items) => (items?.[0]?.label ? `Tuần bắt đầu: ${items[0].label}` : ""),
            label: (ctx) => `Nhu cầu: ${nf.format(ctx.parsed.y ?? 0)}`,
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, autoSkipPadding: 16 } },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(0,0,0,0.06)", borderDash: [4, 4] },
          ticks: { callback: (v) => nf.format(v) },
        },
      },
      animation: { duration: 700, easing: "easeOutQuart" },
    }),
    []
  );

  const barData = useMemo(() => {
    const labels = allocate.map((x) => String(x.dealer_id).slice(0, 8));
    const values = allocate.map((x) => Number(x.quantity || 0));
    return {
      labels,
      datasets: [
        {
          label: "Allocated Quantity",
          data: values,
          borderWidth: 1,
          borderColor: "#0ea5e9",
          backgroundColor: (ctx) => {
            const { chart } = ctx;
            const { ctx: c, chartArea } = chart;
            if (!chartArea) return "rgba(14,165,233,0.25)";
            return makeVGradient(
              c,
              chartArea,
              "rgba(14,165,233,0.35)",
              "rgba(14,165,233,0.08)"
            );
          },
          borderSkipped: false,
          borderRadius: 8,
          maxBarThickness: 36,
          categoryPercentage: 0.6,
          barPercentage: 0.9,
        },
      ],
    };
  }, [allocate]);

  const barOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: "top", labels: { usePointStyle: true } },
        tooltip: {
          callbacks: {
            title: (items) => (items?.[0]?.label ? `Dealer: ${items[0].label}` : ""),
            label: (ctx) => `Phân bổ: ${nf.format(ctx.parsed.y ?? 0)}`,
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { autoSkip: true, autoSkipPadding: 12 } },
        y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.06)" }, ticks: { callback: (v) => nf.format(v) } },
      },
      animation: { duration: 650, easing: "easeOutCubic" },
    }),
    []
  );

  const pageCount = Math.max(1, Math.ceil(totalPairs / pageSize));

  // ===== GROQ streaming (manual trigger by Apply button) =====
  const [aiReco, setAiReco] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiErr, setAiErr] = useState("");

  // typing effect
  const TYPING_DELAY_MS = 16;
  const bufferRef = useRef("");
  const typerTimerRef = useRef(null);
  const scrollBoxRef = useRef(null);

  const startTyper = () => {
    if (typerTimerRef.current) return;
    typerTimerRef.current = setInterval(() => {
      const buf = bufferRef.current;
      if (buf.length === 0) {
        if (!aiLoading) {
          clearInterval(typerTimerRef.current);
          typerTimerRef.current = null;
        }
        return;
      }
      const step = 2;
      const chunk = buf.slice(0, step);
      bufferRef.current = buf.slice(step);
      setAiReco((prev) => prev + chunk);
    }, TYPING_DELAY_MS);
  };

  useEffect(() => {
    if (scrollBoxRef.current) {
      scrollBoxRef.current.scrollTop = scrollBoxRef.current.scrollHeight;
    }
  }, [aiReco]);

  const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
  const PRIMARY_MODEL = import.meta.env.VITE_GROQ_MODEL || "llama-3.3-70b-versatile";
  const FALLBACK_MODEL = import.meta.env.VITE_GROQ_FALLBACK_MODEL || "llama-3.2-11b-text-preview";

  function* parseSSE(textChunk) {
    const parts = textChunk.split("\n\n");
    for (const part of parts) {
      const line = part.trim();
      if (!line.startsWith("data:")) continue;
      yield line.slice(5).trim();
    }
  }

  async function streamGroqOnce(model) {
    if (!GROQ_API_KEY) {
      throw new Error("Thiếu VITE_GROQ_API_KEY trong biến môi trường.");
    }

    const payloadSummary = {
      meta: { horizon, vehicleVersionId, dealerId },
      weeklyTotal: weeklyTotal?.slice(-26),
      allocate: allocate?.slice(0, 50),
      debugRows: debugRows?.slice(0, 50)?.map((r) => ({
        dealerId: r.dealerId,
        vehicleVersionId: r.vehicleVersionId,
        seriesLength: r.seriesLength,
        requiredWeeks: r.requiredWeeks,
        lastHistoryWeek: r.lastHistoryWeek,
      })),
    };

    const body = {
      model,
      stream: true,
      temperature: 0.8,
      messages: [
        {
          role: "system",
          content:
            "Bạn là chuyên gia dự báo thị trường ô tô Việt Nam, hiểu xu hướng bán hàng, phân bổ xe và tâm lý người mua. Hãy nói với giọng thân thiện, tự nhiên, hơi dí dỏm nhưng vẫn sắc bén và chuyên nghiệp. Trả lời ngắn gọn tối đa 3 câu, mỗi câu rõ ràng, mạch lạc, không ký tự đặc biệt, không định dạng. Ưu tiên diễn đạt logic và dễ hiểu như đang nói chuyện thật.",
        },
        {
          role: "user",
          content:
            "Dựa trên dữ liệu sau, hãy dự báo xu hướng xe. Viết 1 câu về xu hướng hiện tại, 1 câu về dự đoán 1–2 tuần tới, 1 câu kết luận nhẹ nhàng, vui vẻ, tự nhiên. Không liệt kê, không giải thích dài dòng. Dữ liệu: " +
            JSON.stringify(payloadSummary),
        },
      ],
    };

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok || !res.body) {
      const txt = await res.text().catch(() => "");
      const message = `Groq HTTP ${res.status}: ${txt || "No body"}`;
      throw new Error(message);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });

      for (const data of parseSSE(chunk)) {
        if (data === "[DONE]") {
          break;
        }
        try {
          const json = JSON.parse(data);
          const delta =
            (json && json.choices && json.choices[0] && json.choices[0].delta && json.choices[0].delta.content) ||
            (json && json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content) ||
            "";
          if (delta) {
            bufferRef.current += delta;
            startTyper();
          }
        } catch {
          // ignore
        }
      }
    }
  }

  async function streamGroqAuto() {
    try {
      setAiErr("");
      setAiReco("");
      bufferRef.current = "";
      setAiLoading(true);

      try {
        await streamGroqOnce(PRIMARY_MODEL);
      } catch (e) {
        const msg = (e && e.message) || "";
        const shouldFallback =
          msg.includes("model_decommissioned") ||
          msg.includes("decommissioned") ||
          msg.includes("HTTP 400") ||
          msg.includes("invalid_request_error");
        if (shouldFallback) {
          bufferRef.current += (bufferRef.current ? "\n\n" : "") + "(Đổi sang model dự phòng...) ";
          startTyper();
          await streamGroqOnce(FALLBACK_MODEL);
        } else {
          throw e;
        }
      }
    } catch (e) {
      setAiErr(e?.message || "Streaming error");
    } finally {
      const guard = setInterval(() => {
        if (bufferRef.current.length === 0) {
          clearInterval(guard);
          setAiLoading(false);
          if (typerTimerRef.current) {
            clearInterval(typerTimerRef.current);
            typerTimerRef.current = null;
          }
        }
      }, 120);
    }
  }

  // ❌ BỎ auto-trigger: không gọi Groq trong useEffect nữa
  // (đã xóa useEffect auto-generate)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Forecast & Analysis</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {/* Vehicle Version (AntD Select) */}
        <div className="col-span-2">
          <label className="block text-sm text-gray-600 mb-1">Vehicle Version</label>
          <Select
            className="w-full"
            showSearch
            allowClear
            placeholder={optLoading ? "Đang tải danh sách..." : "— Chọn phiên bản —"}
            value={vehicleVersionId || undefined}
            onChange={(val) => setVehicleVersionId(val || "")}
            options={vehicleOptions.map((v) => ({ value: v.id, label: v.label }))}
            loading={optLoading}
            disabled={optLoading}
            optionFilterProp="label"
            filterOption={(input, option) =>
              ((option?.label ?? "") + "").toLowerCase().includes(input.toLowerCase())
            }
          />
          {optErr && <div className="text-xs text-red-600 mt-1">{optErr}</div>}
        </div>

        {/* Dealer (AntD Select) */}
        <div className="col-span-2">
          <label className="block text-sm text-gray-600 mb-1">Dealer (optional)</label>
          <Select
            className="w-full"
            showSearch
            allowClear
            placeholder={optLoading ? "Đang tải danh sách..." : "— Tất cả dealer —"}
            value={dealerId || undefined}
            onChange={(val) => setDealerId(val || "")}
            options={dealerOptions.map((d) => ({ value: d.id, label: d.label }))}
            loading={optLoading}
            disabled={optLoading}
            optionFilterProp="label"
            filterOption={(input, option) =>
              ((option?.label ?? "") + "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </div>

        {/* Horizon (weeks) */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Horizon (weeks)</label>
          <input
            type="number"
            min={1}
            max={26}
            className="w-full border rounded-md px-3 py-2"
            value={horizon}
            onChange={(e) => setHorizon(Number(e.target.value || 8))}
          />
        </div>

        {/* [ADD] Base URL Toggle trong khu Filter */}
        <div className="md:col-span-5 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Base URL:</span>
            <Switch
              checkedChildren="Domain"
              unCheckedChildren="Localhost"
              checked={useDomain}
              onChange={onToggleBase}
            />
            <span className="text-xs text-gray-500">
              {useDomain ? "https://prn232.freeddns.org" : "https://localhost:7050"}
            </span>
          </div>

          <div className="flex gap-3 ml-auto">
            <button
              onClick={async () => {
                setPage(1);
                await loadAll();
                if (vehicleVersionId) {
                  await streamGroqAuto(); // ✅ chỉ gọi Groq khi bấm "Áp dụng / Tải dữ liệu"
                }
              }}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Áp dụng / Tải dữ liệu
            </button>
            <button
              onClick={async () => {
                setVehicleVersionId("");
                setDealerId("");
                setHorizon(8);
                setPage(1);
                setPageSize(10);
                await loadAll();
                // Không gọi Groq khi reset
                setAiReco("");
                bufferRef.current = "";
                setAiErr("");
              }}
              className="px-4 py-2 rounded-md border"
            >
              Xóa lọc
            </button>
            {err && (
              <span className="text-red-600 text-sm flex items-center" title={err}>
                {err}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 border border-gray-200 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Demand Forecast (Weekly Total)</h3>
           
          </div>
          <div className="h-64">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Allocation Plan (By Dealer)</h3>
            <span className="text-sm text-gray-500">holdback=10% • horizon={horizon}</span>
          </div>
          <div className="h-64">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* AI Recommendations + Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* AI Recommendations (Groq triggered by Apply) */}
        <div className="p-4 border border-transparent rounded-xl bg-gradient-to-br from-indigo-50 to-white shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
            <div
              className={
                "text-xs px-2 py-1 rounded-full " +
                (aiLoading
                  ? "bg-blue-100 text-blue-700"
                  : aiReco
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-100 text-gray-600")
              }
              title={aiErr || ""}
            >
              {aiLoading ? "Đang tạo" : aiReco ? "Đã tạo" : "Sẵn sàng"}
            </div>
          </div>

          <div className="rounded-xl border border-indigo-100 bg-white/70 backdrop-blur-sm p-3 shadow-inner min-h-[160px]">
            {aiErr ? (
              <div className="text-xs text-red-600">{aiErr}</div>
            ) : aiReco ? (
              <div
                ref={scrollBoxRef}
                className="max-h-64 overflow-auto text-sm leading-6 text-gray-800 whitespace-pre-wrap transition-all duration-300"
              >
                {aiReco}
                {aiLoading && <span className="inline-block w-2 ml-1 animate-pulse align-baseline">▍</span>}
              </div>
            ) : (
              <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm">
                {recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(aiReco || recommendations.join("\n")).catch(() => { });
              }}
              className="text-xs px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50"
            >
              Copy
            </button>
            <button
              type="button"
              onClick={() => {
                setAiReco("");
                bufferRef.current = "";
              }}
              className="text-xs px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-4 border border-gray-200 rounded-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded bg-gray-50">
              <div className="text-gray-500">Weeks Loaded</div>
              <div className="text-xl font-semibold">{weeklyTotal.length}</div>
            </div>
            <div className="p-3 rounded bg-gray-50">
              <div className="text-gray-500">Dealers Allocated</div>
              <div className="text-xl font-semibold">{allocate.length}</div>
            </div>
            <div className="p-3 rounded bg-gray-50">
              <div className="text-gray-500">Debug Pairs (page)</div>
              <div className="text-xl font-semibold">{debugRows.length}</div>
            </div>
            <div className="p-3 rounded bg-gray-50">
              <div className="text-gray-500">Total Pairs</div>
              <div className="text-xl font-semibold">{totalPairs}</div>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="p-4 border border-gray-200 rounded-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">ML Debug – Pairs (debug-all)</h3>
        </div>

        <div className="flex items-center gap-2 text-sm mb-3">
          <span>Trang:</span>
          <button
            className="px-2 py-1 border rounded disabled:opacity-50"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ◀
          </button>
          <span>
            {page}/{pageCount}
          </span>
          <button
            className="px-2 py-1 border rounded disabled:opacity-50"
            disabled={page >= pageCount || loading}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
          >
            ▶
          </button>

          <Select
            className="min-w-[120px]"
            value={pageSize}
            onChange={(val) => {
              setPageSize(Number(val));
              setPage(1);
            }}
            options={[10, 20, 50, 100].map((n) => ({ value: n, label: `${n}/trang` }))}
          />
        </div>

        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-2 border">Dealer</th>
                <th className="p-2 border">Vehicle Version</th>
                <th className="p-2 border text-right">Series</th>
                <th className="p-2 border">Last Week</th>
                <th className="p-2 border text-right">Horizon</th>
                <th className="p-2 border">ML Params</th>
                <th className="p-2 border">Preview InputSeries</th>
              </tr>
            </thead>
            <tbody>
              {debugRows.map((r, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="p-2 border align-top">
                    <div className="font-medium">{r.dealerName || "—"}</div>
                    <div className="text-gray-500 text-xs">{r.dealerId}</div>
                  </td>
                  <td className="p-2 border align-top">
                    <div className="font-medium">{r.vehicleLabel || "—"}</div>
                    <div className="text-gray-500 text-xs">{r.vehicleVersionId}</div>
                  </td>
                  <td className="p-2 border align-top text-right">{r.seriesLength}</td>
                  <td className="p-2 border align-top">{fmtDate(r.lastHistoryWeek)}</td>
                  <td className="p-2 border align-top text-right">{r.horizon}</td>
                  <td className="p-2 border align-top">
                    <div className="text-xs">
                      windowSize: <code>{r.windowSize}</code>
                      <br />
                      trainSize: <code>{r.trainSize}</code>
                      <br />
                      requiredWeeks: <code>{r.requiredWeeks}</code>
                    </div>
                  </td>
                  <td className="p-2 border align-top">
                    {Array.isArray(r.inputSeries) && r.inputSeries.length > 0 ? (
                      <div className="text-xs leading-5">
                        {r.inputSeries.slice(0, 6).map((it, i) => (
                          <div key={i}>
                            <code>{fmtDate(it.weekStart)}</code> × <b>{it.orders}</b>
                          </div>
                        ))}
                        {r.inputSeries.length > 6 && (
                          <div className="text-gray-500">… và {r.inputSeries.length - 6} tuần nữa</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {debugRows.length === 0 && (
                <tr>
                  <td className="p-4 border text-center text-gray-500" colSpan={7}>
                    Không có dữ liệu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {loading && <div className="text-sm text-gray-500 mt-2">Đang tải dữ liệu…</div>}
      </div> */}
    </div>
  );
};

export default AIForecast;
