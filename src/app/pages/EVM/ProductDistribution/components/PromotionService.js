const BASE_URL = "https://prn232.freeddns.org/financial-service/api/Promotion";

export async function getPromotions(params) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}?${query}`, { headers: { Accept: "*/*" } });
  return await res.json();
}

export async function createPromotion(body) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "*/*" },
    body: JSON.stringify(body),
  });
  return await res.json();
}

export async function updatePromotion(id, body) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "*/*" },
    body: JSON.stringify(body),
  });
  return await res.json();
}

export async function deletePromotion(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE", headers: { Accept: "*/*" } });
  if (!res.ok) throw new Error("Delete failed");
  return await res.json();
}
