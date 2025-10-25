// Gọi API backend (đặt proxy hoặc cùng domain để tránh CORS).
// Nếu backend chạy khác origin, chỉnh BASE thành https://localhost:7050
const BASE = "https://prn232.freeddns.org"; // để trống = gọi cùng origin (frontend phục vụ bởi reverse proxy)

export async function searchForecast(params) {
  const qs = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).length > 0) {
        qs.append(k, String(v));
      }
    });
  }

  const url = `${BASE}/utility-service/api/forecast/search?${qs.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json(); // { total, page, pageSize, rows }
}

export async function askForecast(question, rows) {
  const body = {
    question: question || "",
  };
  if (Array.isArray(rows) && rows.length > 0) {
    body.forecast = rows; // optional: gửi kèm 1 phần dữ liệu hiển thị để LLM tham chiếu
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
