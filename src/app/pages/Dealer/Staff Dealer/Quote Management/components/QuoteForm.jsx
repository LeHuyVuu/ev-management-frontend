import React, { useEffect, useMemo, useState } from "react";
import { User, Car, DollarSign } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * 🧩 CẤU HÌNH TOKEN
 * Dán token thật (CHỈ phần mã, KHÔNG có "Bearer ") vào RAW_TOKEN.
 * Code sẽ tự thêm "Bearer " và chống double.
 */
const RAW_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOiJhNzRlOWUwMy03YzRkLTQ0ZDAtOGY0Yy0wZjAxODRiN2U2ZjQiLCJSb2xlSWQiOiI0IiwiUm9sZU5hbWUiOiJEZWFsZXIgU3RhZmYiLCJEZWFsZXJJZCI6ImViODAyYjcxLTRhZTAtNGNiMy1iYzg1LThjNTZmNjdiZDc1NyIsIm5iZiI6MTc2MTIyODM5NywiZXhwIjoxNzY5MTc3MTk3LCJpYXQiOjE3NjEyMjgzOTcsImlzcyI6IkVWTSIsImF1ZCI6IlVzZXIifQ.Gfqss-eCGgIm43ZgMYcm53ivv-uE3ryqujkBrMCu01Q";

const AUTHZ = RAW_TOKEN.startsWith("Bearer ")
  ? RAW_TOKEN.trim()
  : `Bearer ${RAW_TOKEN.trim()}`;

const baseURL = "https://prn232.freeddns.org";

/** 🔧 Helper gọi API có kèm Authorization, log lỗi chi tiết */
async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${baseURL}${path}`;
  const res = await fetch(url, {
    method: options.method || "GET",
    headers: {
      Accept: "application/json",
      ...(options.headers || {}),
      Authorization: AUTHZ,
    },
    body: options.body,
  });

  if (!res.ok) {
    let bodyText = "";
    try {
      bodyText = await res.text();
    } catch {}
    console.error("API error:", {
      url,
      status: res.status,
      statusText: res.statusText,
      response: bodyText,
    });
    throw new Error(bodyText || `HTTP ${res.status} ${res.statusText}`);
  }
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export default function QuoteForm() {
  // ===== FORM STATES =====
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [creatingCustomer, setCreatingCustomer] = useState(false);

  // ===== VEHICLE VERSIONS =====
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [vehicleErr, setVehicleErr] = useState(null);

  const [brand, setBrand] = useState("");
  const [modelName, setModelName] = useState("");
  const [versionName, setVersionName] = useState("");
  const [color, setColor] = useState("");

  // ===== DISCOUNT =====
  const [discountAmt, setDiscountAmt] = useState(0);

  // ===== PROMOTIONS =====
  const [promotions, setPromotions] = useState([]);
  const [selectedPromotionIds, setSelectedPromotionIds] = useState([]);
  const [loadingPromos, setLoadingPromos] = useState(false);
  const [promosError, setPromosError] = useState(null);

  // -- Fetch promotions (no auth)
  useEffect(() => {
    const loadPromos = async () => {
      try {
        setLoadingPromos(true);
        setPromosError(null);
        const res = await fetch(`${baseURL}/financial-service/api/Promotion`, {
          method: "GET",
          headers: { Accept: "*/*" },
        });
        if (!res.ok) throw new Error(`Lỗi tải khuyến mãi ${res.status}`);
        const json = await res.json();
        setPromotions(json?.data?.items ?? []);
      } catch (e) {
        console.error(e);
        setPromosError("Không thể tải khuyến mãi. Vui lòng thử lại.");
      } finally {
        setLoadingPromos(false);
      }
    };
    loadPromos();
  }, []);

  const activePromos = useMemo(
    () => promotions.filter((p) => p.status === "active"),
    [promotions]
  );

  const togglePromotion = (id) => {
    setSelectedPromotionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // -- Fetch vehicle versions (with auth)
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setLoadingVehicles(true);
        setVehicleErr(null);

        const res = await fetch(
          `${baseURL}/brand-service/api/vehicle-versions/dealer?pageNumber=1&pageSize=100`,
          { headers: { Authorization: AUTHZ, Accept: "application/json" } }
        );

        const data = await res.json();
        if (data?.status === 200) {
          const options = (data?.data?.items || []).map((v) => ({
            value: v.vehicleVersionId,
            label: `${v.brand} - ${v.versionName} - ${v.color} - ${v.evType}`,
            raw: v,
          }));
          setVehicles(options);
        } else {
          setVehicleErr("Không tải được danh sách xe.");
          console.error("Vehicle fetch failed:", data);
        }
      } catch (err) {
        setVehicleErr("Lỗi khi tải danh sách xe.");
        console.error("Lỗi khi fetch vehicle:", err);
      } finally {
        setLoadingVehicles(false);
      }
    };

    loadVehicles();
  }, []);

  // -- Đồng bộ state brand/model/version/color
  useEffect(() => {
    if (!selectedVehicleId) return;
    const picked = vehicles.find((v) => v.value === selectedVehicleId)?.raw;
    if (picked) {
      setBrand(picked.brand || "");
      setModelName(picked.modelName || picked.model || "");
      setVersionName(picked.versionName || "");
      setColor(picked.color || "");
    }
  }, [selectedVehicleId, vehicles]);

  // ====== TẠO KHÁCH HÀNG ======
  const handleCreateCustomer = async () => {
    try {
      // Validation: Tên, SĐT, Email, Địa chỉ are required and must be reasonable
      const missing = [];
      if (!customerName || !customerName.trim()) missing.push("Tên");
      if (!customerPhone || !customerPhone.trim()) missing.push("Số điện thoại");
      if (!email || !email.trim()) missing.push("Email");
      if (!address || !address.trim()) missing.push("Địa chỉ");

      if (missing.length > 0) {
        toast.warn(`Vui lòng nhập: ${missing.join(", ")}`);
        return;
      }

      // Basic phone validation: digits only, length 9-12
      const phoneDigits = (customerPhone || "").toString().replace(/\D/g, "");
      if (phoneDigits.length !== 10) {
        toast.warn("Số điện thoại không hợp lệ (10 chữ số). Vui lòng kiểm tra lại.");
        return;
      }

      // Basic email validation
      const emailPattern = /^\S+@\S+\.\S+$/;
      if (!emailPattern.test(email)) {
        toast.warn("Email không hợp lệ. Vui lòng nhập địa chỉ email hợp lệ.");
        return;
      }
      setCreatingCustomer(true);

      const payload = {
        name: customerName,
        email,
        phone: customerPhone,
        address,
      };

      const data = await apiFetch("/customer-service/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const customer = data || payload;
      setCustomerName(customer.name || customerName);
      setEmail(customer.email || email);
      setCustomerPhone(customer.phone || customerPhone);
      setAddress(customer.address || address);

      toast.success("👤 Tạo khách hàng thành công!");
    } catch (err) {
      toast.error(`❌ Tạo khách hàng thất bại: ${err?.message || "Unknown error"}`);
    } finally {
      setCreatingCustomer(false);
    }
  };

  // ====== TẠO BÁO GIÁ ======
  const handleCreateQuote = async () => {
    try {
      if (!selectedVehicleId) {
        toast.warn("Vui lòng chọn một phiên bản xe.");
        return;
      }

      const payload = {
        vehicleVersionId: selectedVehicleId,
        brand,
        modelName,
        versionName,
        color,
        customerName: customerName || "Khách lẻ",
        customerPhone,
        promotionIds: selectedPromotionIds,
        discountAmt,
        status: "new",
      };

      await apiFetch("/customer-service/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      toast.success("🎉 Tạo báo giá thành công!");
    } catch (err) {
      toast.error(`❌ Tạo báo giá thất bại: ${err?.message || "Unknown error"}`);
    }
  };

  // ===== PREVIEW BRIDGE: phát sự kiện cho QuoteSummary =====
  // ===== PREVIEW BRIDGE: phát sự kiện cho QuoteSummary =====
function publishQuotePreview() {
  const picked = vehicles.find((v) => v.value === selectedVehicleId)?.raw;

  const preview = {
    // khách hàng
    customerName: customerName || "Khách lẻ",
    customerPhone: customerPhone || "",
    email: email || "",
    address: address || "",

    // xe
    vehicleVersionId: selectedVehicleId || (picked && picked.vehicleVersionId) || "",
    brand: (brand || (picked && picked.brand)) || "",
    modelName:
      (modelName || (picked && (picked.modelName || picked.model))) || "",
    versionName: (versionName || (picked && picked.versionName)) || "",
    color: (color || (picked && picked.color)) || "",
    evType: (picked && picked.evType) || "",
    horsePower: (picked && picked.horsePower) || null,
    imageUrl: (picked && picked.imageUrl) || "",
    stockQuantity: (picked && picked.stockQuantity) || null,

    // giá/khuyến mãi
    basePrice: Number((picked && picked.basePrice) || 0),
    promotions: promotions
      .filter((p) => selectedPromotionIds.includes(p.promotion_id))
      .map((p) => p.name),
    discountAmt: Number(discountAmt || 0),
  };

  if (typeof window !== "undefined" && window.dispatchEvent) {
    window.dispatchEvent(new CustomEvent("quote:preview", { detail: preview }));
  }
}


  // Gọi publish khi field thay đổi
  useEffect(() => {
    publishQuotePreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    customerName,
    customerPhone,
    email,
    address,
    selectedVehicleId,
    vehicles,
    brand,
    modelName,
    versionName,
    color,
    promotions,
    selectedPromotionIds,
    discountAmt,
  ]);

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={2500} newestOnTop />

      {/* ==== THÔNG TIN KHÁCH HÀNG ==== */}
      <div className="border rounded-xl p-4 bg-white shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <User className="text-blue-500" size={20} />
          <h3 className="font-semibold text-base">Thông tin Khách hàng</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Số điện thoại *"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm w-full"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm w-full"
          />
          <input
            type="text"
            placeholder="Tên khách hàng *"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm w-full"
          />
          <input
            type="text"
            placeholder="Địa chỉ"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm w-full"
          />
        </div>

        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={handleCreateCustomer}
            disabled={creatingCustomer}
            className={`text-sm rounded-md px-4 py-2 text-white ${
              creatingCustomer ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {creatingCustomer ? "Đang tạo..." : "+ Thêm Khách hàng Mới"}
          </button>
        </div>
      </div>

      {/* ==== CHỌN XE & TÙY CHỌN ==== */}
      <div className="border rounded-xl p-4 bg-white shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <Car className="text-blue-500" size={20} />
          <h3 className="font-semibold text-base">Chọn Xe và Tùy chọn</h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Phiên bản xe</label>
            <select
              className="border rounded-md px-3 py-2 text-sm w-full"
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              disabled={loadingVehicles}
            >
              <option value="">
                {loadingVehicles ? "Đang tải…" : "— Chọn xe —"}
              </option>
              {vehicles.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {vehicleErr && <p className="text-xs text-red-600 mt-1">{vehicleErr}</p>}
          </div>
        </div>
      </div>

      {/* ==== ÁP DỤNG KHUYẾN MÃI ==== */}
      <div className="border rounded-xl p-4 bg-white shadowsm">
        <div className="flex items-center space-x-2 mb-4">
          <DollarSign className="text-blue-500" size={20} />
          <h3 className="font-semibold text-base">Áp dụng Khuyến mãi</h3>
        </div>

        {loadingPromos && <p className="text-sm text-gray-500">Đang tải khuyến mãi…</p>}
        {promosError && <p className="text-sm text-red-600">{promosError}</p>}

        {!loadingPromos && !promosError && (
          <>
            {activePromos.length === 0 ? (
              <p className="text-sm text-gray-600">Hiện chưa có khuyến mãi đang hoạt động.</p>
            ) : (
              <ul className="space-y-3">
                {activePromos.map((p) => (
                  <li key={p.promotion_id} className="flex items-start space-x-3">
                    <input
                      id={p.promotion_id}
                      type="checkbox"
                      checked={selectedPromotionIds.includes(p.promotion_id)}
                      onChange={() => togglePromotion(p.promotion_id)}
                      className="mt-1"
                    />
                    <label htmlFor={p.promotion_id} className="flex-1 cursor-pointer">
                      <div className="font-medium text-sm">{p.name}</div>
                      <div className="text-xs text-gray-600">
                        {p.description || "Không có mô tả"}
                      </div>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {/* OPTIONAL: ô nhập giảm giá để xem thay đổi realtime */}
        {/* <div className="mt-4">
          <label className="block text-xs text-gray-600 mb-1">Giảm giá (VND)</label>
          <input
            type="number"
            value={discountAmt}
            onChange={(e) => setDiscountAmt(Number(e.target.value || 0))}
            className="border rounded-md px-3 py-2 text-sm w-full"
            min={0}
          />
        </div> */}
      </div>

      {/* ==== ACTIONS ==== */}
      <div className="flex justify-end space-x-3">
        <button className="border px-4 py-2 text-sm rounded-md hover:bg-gray-100">
          Hủy
        </button>
        <button
          onClick={handleCreateQuote}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm rounded-md shadow"
        >
          Xác nhận Báo giá
        </button>
      </div>
    </div>
  );
}
