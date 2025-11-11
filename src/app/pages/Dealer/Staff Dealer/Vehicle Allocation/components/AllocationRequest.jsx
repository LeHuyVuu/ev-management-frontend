import React, { useEffect, useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";

// Read token at request-time (avoid stale module-level capture)
function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("jwt") ||
    null
  );
}

function getAuthHeaders() {
  const h = { accept: "*/*" };
  const t = getToken();
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

// Wait up to `timeoutMs` for a token to appear in localStorage (polling).
async function waitForToken(timeoutMs = 2000, intervalMs = 250) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const t = getToken();
    if (t) return t;
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return null;
}

export default function AllocationRequest() {
  const [versions, setVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(true);
  const [versionsError, setVersionsError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({
    vehicleVersionId: "",
    quantity: 1,
    expectedDelivery: "", // yyyy-mm-dd (tùy chọn)
  });

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setLoadingVersions(true);
        setVersionsError("");
        // Ensure token is available (sometimes token is set slightly after mount)
        const token = getToken() || (await waitForToken(2000, 250));
        const res = await fetch(
          "https://prn232.freeddns.org/brand-service/api/vehicle-versions/dealer-stock?pageNumber=1&pageSize=100",
          {
            headers: getAuthHeaders(),
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const items = json?.data?.items ?? json?.data ?? json ?? [];
        const mapped = (Array.isArray(items) ? items : []).map((v) => ({
          id: v.vehicleVersionId || v.id,
            label: `${v.brand} - ${v.versionName} - ${v.color} - ${v.evType}`,
        }));
        setVersions(mapped.filter((v) => v.id && v.label));
      } catch (err) {
        setVersionsError(err?.message || "Không thể tải danh sách mẫu xe.");
        toast.error(err?.message || "Không thể tải danh sách mẫu xe.");
      } finally {
        setLoadingVersions(false);
      }
      }
    fetchVersions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "quantity") {
      // Allow the user to clear the field while editing (empty string),
      // but coerce to a positive integer when a value is present.
      if (value === "") {
        setForm((p) => ({ ...p, quantity: "" }));
        return;
      }
      const parsed = parseInt(value, 10);
      const n = Number.isNaN(parsed) ? 1 : Math.max(1, parsed);
      setForm((p) => ({ ...p, quantity: n }));
      return;
    }
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleQuantityBlur = () => {
    setForm((p) => ({ ...p, quantity: p.quantity === "" ? 1 : p.quantity }));
  };

  const toISODateZ = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr + "T00:00:00Z");
    return d.toISOString();
  };

  const resetForm = () =>
    setForm({ vehicleVersionId: "", quantity: 1, expectedDelivery: "" });

  const canSubmit = useMemo(
    () => !!form.vehicleVersionId && Number(form.quantity) > 0 && !submitting,
    [form.vehicleVersionId, form.quantity, submitting]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSuccessMsg("");

    if (!canSubmit) {
      const msg = "Vui lòng chọn mẫu xe và số lượng hợp lệ.";
      setSubmitError(msg);
      toast.warn(msg);
      return;
    }

    // Lấy thời điểm thực (UTC) cho requestDate
    const nowIso = new Date().toISOString();

    const payload = {
      vehicleVersionId: form.vehicleVersionId,
      quantity: Number(form.quantity),
      requestDate: nowIso,
      expectedDelivery: form.expectedDelivery ? toISODateZ(form.expectedDelivery) : null,
      // Truyền cố định trạng thái: "received" (Đã tạo/nhận yêu cầu)
      status: "pending",
    };

    try {
      setSubmitting(true);
      const token = getToken() || (await waitForToken(2000, 250));
      const res = await fetch(
        "https://prn232.freeddns.org/order-service/api/VehicleAllocation",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = json?.message || `Tạo yêu cầu thất bại (HTTP ${res.status}).`;
        throw new Error(msg);
      }
      setSuccessMsg("Tạo yêu cầu thành công!");
      toast.success("Tạo yêu cầu thành công!");
      // báo cho list refetch (để item mới nằm dòng đầu)
      window.dispatchEvent(new Event("allocation:refresh"));
      resetForm();
      // Notify lists to refetch
      try {
        window.dispatchEvent(new CustomEvent("allocation:created", { detail: { payload } }));
      } catch (e) {
        // ignore
      }
    } catch (err) {
      const msg = err?.message || "Đã xảy ra lỗi khi tạo yêu cầu.";
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-2">Tạo yêu cầu mới</h2>
      <p className="text-sm text-gray-500 mb-6">
        Chọn mẫu xe và số lượng. Ngày tạo sẽ tự động lấy theo thời điểm hiện tại.
      </p>

      {versionsError && (
        <div className="mb-4 text-sm text-red-600">Lỗi tải mẫu xe: {versionsError}</div>
      )}
      {submitError && (
        <div className="mb-4 text-sm text-red-600">Lỗi gửi yêu cầu: {submitError}</div>
      )}
      {successMsg && <div className="mb-4 text-sm text-green-600">{successMsg}</div>}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mẫu xe */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Mẫu xe <span className="text-red-500">*</span>
            </label>
            <select
              name="vehicleVersionId"
              value={form.vehicleVersionId}
              onChange={handleChange}
              disabled={loadingVersions}
              className="w-full border border-gray-300 rounded-md px-3 py-2 disabled:bg-gray-100"
            >
              <option value="">
                {loadingVersions ? "Đang tải..." : "Chọn mẫu xe"}
              </option>
              {versions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          {/* Số lượng */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Số lượng <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              min={1}
              step={1}
              onBlur={handleQuantityBlur}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          {/* Ngày giao dự kiến (tùy chọn) */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Ngày mong muốn giao</label>
            <input
              type="date"
              name="expectedDelivery"
              value={form.expectedDelivery}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => resetForm()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100"
            disabled={submitting}
          >
            Đặt lại
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className={`px-4 py-2 rounded-md text-white ${
              canSubmit ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"
            }`}
          >
            {submitting ? "Đang tạo..." : "Tạo yêu cầu"}
          </button>
        </div>
      </form>

      {/* Toastify container */}
      <ToastContainer
        position="top-right"
        autoClose={2200}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </div>
  );
}
