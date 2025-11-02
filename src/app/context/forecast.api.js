// Gọi API backend (đặt proxy hoặc cùng domain để tránh CORS).
// Nếu backend chạy khác origin, chỉnh BASE thành https://localhost:7050
const BASE = "https://localhost:7050"; // để trống = gọi cùng origin (frontend phục vụ bởi reverse proxy)

/**
 * Lấy dữ liệu debug-all (tất cả series ML). Không truyền param => backend trả tất cả (có phân trang).
 * params hỗ trợ: page, pageSize, horizon, dealerId, vehicleVersionId, search
 * Trả về dạng chuẩn hoá: { total, page, pageSize, rows }
 */
export async function searchForecast(params) {
  const qs = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).length > 0) {
        qs.append(k, String(v));
      }
    });
  }

  // đổi sang debug-all
  const url = `${BASE}/utility-service/api/forecast/debug-all?${qs.toString()}`;
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  const json = await res.json();

  // Chuẩn hoá về shape quen thuộc cho UI: { total, page, pageSize, rows }
  // Backend debug-all trả: { page, pageSize, totalPairs, generatedAt, data: [...] }
  const rows = Array.isArray(json?.data) ? json.data : [];
  return {
    total: json?.totalPairs ?? json?.total ?? rows.length,
    page: json?.page ?? Number(params?.page ?? 1),
    pageSize: json?.pageSize ?? Number(params?.pageSize ?? 20),
    rows,
  };
}

/**
 * Hỏi AI (tuỳ app bạn xử lý). Không đổi.
 * Có thể gửi kèm 1 phần rows để LLM tham chiếu.
 */
export async function askForecast(question, rows) {
  const body = { question: question || "" };
  if (Array.isArray(rows) && rows.length > 0) {
    body.forecast = rows;
  }

  const res = await fetch(`${BASE}/utility-service/api/forecast/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json(); // { answer }
}
