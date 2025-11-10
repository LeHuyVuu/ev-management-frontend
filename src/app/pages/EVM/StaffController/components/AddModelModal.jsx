import React, { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const VEHICLE_API = "https://prn232.freeddns.org/brand-service/api/vehicles";
const VERSION_API =
  "https://prn232.freeddns.org/brand-service/api/vehicle-versions";
const UPLOAD_API = "https://prn232.freeddns.org/utility-service/api/Upload";

const evTypes = [
  { value: "Battery Electric", label: "Battery Electric" },
  { value: "Plug-in Hybrid", label: "Plug-in Hybrid" },
  { value: "Hybrid", label: "Hybrid" },
  { value: "Fuel Cell", label: "Fuel Cell" },
  { value: "Crossover", label: "Crossover" },
  { value: "SUV", label: "SUV" },
  { value: "Sedan", label: "Sedan" },
  { value: "Hatchback", label: "Hatchback" },
];

const numberOnly = (v) => (v === "" || isNaN(Number(v)) ? "" : Number(v));

export default function AddModelModal({
  isOpen,
  mode = "create",
  initialData,
  onClose,
  onSaved,
}) {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [vehicleLoading, setVehicleLoading] = useState(false);

  // Inline create-vehicle form state
  const [showCreateVehicle, setShowCreateVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    brand: "",
    modelName: "",
    description: "",
  });

  // Version form state
  const [form, setForm] = useState({
    vehicleId: initialData?.vehicleId || "",
    versionName: initialData?.versionName || "",
    color: initialData?.color || "",
    evType: initialData?.evType || evTypes[0].value,
    horsePower: initialData?.horsePower ?? "",
    basePrice: initialData?.basePrice ?? "",
    imageUrl: initialData?.imageUrl || "",
    stockQuantity: initialData?.stockQuantity ?? "",
  });

  // Upload state (NEW)
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [localPreview, setLocalPreview] = useState("");

  // Reset when opening/closing or initialData changes
  useEffect(() => {
    if (isOpen) {
      setForm({
        vehicleId: initialData?.vehicleId || "",
        versionName: initialData?.versionName || "",
        color: initialData?.color || "",
        evType: initialData?.evType || evTypes[0].value,
        horsePower: initialData?.horsePower ?? "",
        basePrice: initialData?.basePrice ?? "",
        imageUrl: initialData?.imageUrl || "",
        stockQuantity: initialData?.stockQuantity ?? "",
      });
      setLocalPreview("");
      setUploadProgress(0);
      setUploading(false);
      fetchVehicles();
    }
  }, [isOpen, initialData]);

  async function fetchVehicles() {
    setVehicleLoading(true);
    try {
      const res = await fetch(VEHICLE_API);
      const json = await res.json();
      if (json.status === 200 && Array.isArray(json.data)) {
        setVehicles(json.data);
      } else {
        throw new Error(json.message || "Không tải được danh sách xe");
      }
    } catch (err) {
      toast.error(err.message || "Lỗi tải danh sách xe");
      setVehicles([]);
    } finally {
      setVehicleLoading(false);
    }
  }

  function extractApiErrorMessage(resp, fallback = "Yêu cầu thất bại") {
  if (!resp || typeof resp !== "object") return fallback;
  // Một số BE trả Message (viết hoa), số khác message/title, hoặc mảng lỗi
  if (typeof resp.Message === "string" && resp.Message.trim()) return resp.Message;
  if (typeof resp.message === "string" && resp.message.trim()) return resp.message;
  if (typeof resp.title === "string" && resp.title.trim()) return resp.title;
  if (Array.isArray(resp.errors) && resp.errors.length) {
    const first = resp.errors[0];
    if (typeof first === "string" && first.trim()) return first;
    if (typeof first?.message === "string" && first.message.trim()) return first.message;
  }
  if (typeof resp.error === "string" && resp.error.trim()) return resp.error;
  return fallback;
}


  async function handleCreateVehicle(e) {
  e.preventDefault();
  if (!newVehicle.brand || !newVehicle.modelName) {
    toast.error("Vui lòng nhập Brand và Model name");
    return;
  }

  const promise = (async () => {
    const res = await fetch(VEHICLE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newVehicle),
    });

    // Thử parse JSON an toàn
    let json;
    try {
      json = await res.json();
    } catch {
      json = null;
    }

    // Coi như “giống Add Vehicle Version”: kiểm tra status và ném Error với message từ BE
    if (!res.ok || (json && json.status !== 200)) {
      const msg = extractApiErrorMessage(json, `Tạo model thất bại (${res.status})`);
      throw new Error(msg);
    }

    // Thành công
    await fetchVehicles();

    const created = json?.data || null;
    const found =
      created && created.vehicleId
        ? created
        : vehicles.find(
            (x) =>
              x.brand === newVehicle.brand &&
              x.modelName === newVehicle.modelName
          );

    if (found) {
      setForm((f) => ({ ...f, vehicleId: found.vehicleId }));
    }

    // Chỉ đóng khung "Create Vehicle"
    setShowCreateVehicle(false);
    setNewVehicle({ brand: "", modelName: "", description: "" });

    return "Vehicle created";
  })();

  toast.promise(promise, {
    loading: "Đang tạo model...",
    success: "Đã tạo model mới!",
    error: (e) => e.message || "Tạo model thất bại",
  });
}



  function closeAndReset() {
    if (loading) return;
    setShowCreateVehicle(false);
    setNewVehicle({ brand: "", modelName: "", description: "" });
    onClose?.();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.vehicleId) return toast.error("Hãy chọn Model");
    if (!form.versionName) return toast.error("Nhập Version name");
    if (!form.basePrice) return toast.error("Nhập giá cơ bản");
    if (!form.versionName || !form.color || !form.evType)
      return toast.error("Điền đủ thông tin bắt buộc");
    if (!form.horsePower || !form.basePrice || form.stockQuantity === "")
      return toast.error("Các số liệu đều bắt buộc");
    if (!form.imageUrl) return toast.error("Tải ảnh lên trước khi lưu");

    const payload = {
      versionName: form.versionName,
      color: form.color,
      evType: form.evType,
      horsePower: Number(form.horsePower || 0),
      basePrice: Number(form.basePrice || 0),
      imageUrl: form.imageUrl,
      stockQuantity: Number(form.stockQuantity || 0),
    };

    setLoading(true);
    const promise = (async () => {
      const url =
        mode === "edit"
          ? `${VERSION_API}/${initialData.versionId}`
          : `${VERSION_API}/${form.vehicleId}`;
      const method = mode === "edit" ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.status !== 200) throw new Error(json.Message || "Lưu thất bại");
      console.log("error response:", res.data);
      return json;
    })();

    toast
      .promise(promise, {
        loading: mode === "edit" ? "Đang cập nhật..." : "Đang tạo phiên bản...",
        success: () => (mode === "edit" ? "Cập nhật thành công" : "Tạo thành công"),
        error: (e) => e.message || "Lưu thất bại",
      })
      .then(() => {
        onSaved?.();
        closeAndReset();
      })
      .finally(() => setLoading(false));
  }

  // ===== Image Upload helpers (NEW) =====
  function extractUploadUrl(resp) {
    // Try a few common response shapes
    if (!resp) return "";
    if (typeof resp === "string") return resp;
    if (resp.data) {
      if (typeof resp.data === "string") return resp.data;
      if (typeof resp.data?.url === "string") return resp.data.url;
      if (typeof resp.data?.Location === "string") return resp.data.Location;
    }
    if (typeof resp.url === "string") return resp.url;
    return "";
  }

  function validateFile(file) {
    const MAX_MB = 8; // adjust if backend allows larger
    const okTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!okTypes.includes(file.type)) {
      throw new Error("Chỉ chấp nhận JPEG, PNG, WEBP, GIF");
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      throw new Error(`Kích thước tối đa ${MAX_MB}MB`);
    }
  }

  async function uploadImage(file) {
    try {
      validateFile(file);
    } catch (e) {
      toast.error(e.message);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // Create a manual XHR to track upload progress
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    const promise = new Promise((resolve, reject) => {
      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) {
          const pct = Math.round((evt.loaded / evt.total) * 100);
          setUploadProgress(pct);
        }
      };
      xhr.onerror = () => reject(new Error("Upload lỗi, vui lòng thử lại"));
      xhr.onload = () => {
        try {
          const json = JSON.parse(xhr.responseText || "{}");
          if (xhr.status !== 200 && xhr.status !== 201) {
            const msg = json?.message || json?.title || `Upload thất bại (${xhr.status})`;
            reject(new Error(msg));
            return;
          }
          const url = extractUploadUrl(json);
          if (!url) {
            resolve(json); // still resolve but we'll check later
          } else {
            resolve({ url, raw: json });
          }
        } catch (err) {
          // If backend returns plain text URL
          if (xhr.status >= 200 && xhr.status < 300 && typeof xhr.responseText === "string") {
            resolve({ url: xhr.responseText });
          } else {
            reject(new Error("Không đọc được phản hồi từ máy chủ"));
          }
        }
      };
      xhr.open("POST", UPLOAD_API);
      xhr.setRequestHeader("accept", "*/*");
      // Content-Type for multipart set automatically by XHR
      xhr.send(formData);
    });

    toast
      .promise(promise, {
        loading: "Đang tải ảnh...",
        success: "Upload thành công",
        error: (e) => e.message || "Upload thất bại",
      })
      .then((res) => {
        const url = res?.url || extractUploadUrl(res) || "";
        if (!url) {
          toast("Máy chủ đã nhận file nhưng không trả về URL. Hãy nhập URL thủ công nếu có.");
          return;
        }
        setForm((f) => ({ ...f, imageUrl: url }));
      })
      .finally(() => setUploading(false));
  }

  function onFileInputChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalPreview(URL.createObjectURL(file));
    uploadImage(file);
  }

  function handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setLocalPreview(URL.createObjectURL(file));
    uploadImage(file);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/50"
        onClick={closeAndReset}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[99vh] overflow-y-auto bg-white rounded-2xl shadow-xl border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 bg-blue-600 text-white">
          <h3 className="text-lg font-semibold">
            {mode === "edit" ? "Edit Vehicle Version" : "Add Vehicle Version"}
          </h3>
          <button
            onClick={closeAndReset}
            className="p-2 hover:bg-white/10 rounded-lg"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* VEHICLE PICKER */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <select
                value={form.vehicleId}
                onChange={(e) =>
                  setForm({ ...form, vehicleId: e.target.value })
                }
                className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="" disabled>
                  Select Model
                </option>
                {vehicles.map((v) => (
                  <option key={v.vehicleId} value={v.vehicleId}>
                    {v.brand} {v.modelName}
                  </option>
                ))}
              </select>

              {/* vẫn giữ nút tạo vehicle mới */}
              <button
                type="button"
                onClick={() => setShowCreateVehicle((s) => !s)}
                className="px-4 py-1 rounded-lg border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"
              >
                {showCreateVehicle ? "Close" : "＋ New Model"}
              </button>
            </div>
          </div>

          {/* Inline CREATE VEHICLE */}
          {showCreateVehicle && (
            <div className="md:col-span-2 border rounded-xl p-4 bg-gray-50">
              <h4 className="font-semibold text-gray-800 mb-3">
                Add new Model
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1 focus:ring-blue-500 focus:border-blue-500"
                    value={newVehicle.brand}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, brand: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Model name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1 focus:ring-blue-500 focus:border-blue-500"
                    value={newVehicle.modelName}
                    onChange={(e) =>
                      setNewVehicle({
                        ...newVehicle,
                        modelName: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1 focus:ring-blue-500 focus:border-blue-500"
                    value={newVehicle.description}
                    onChange={(e) =>
                      setNewVehicle({
                        ...newVehicle,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleCreateVehicle}
                  className="px-4 py-1 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                >
                  Create & select
                </button>
              </div>
            </div>
          )}

          {/* VERSION FIELDS */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Version name <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1 focus:ring-blue-500 focus:border-blue-500"
              value={form.versionName}
              onChange={(e) =>
                setForm({ ...form, versionName: e.target.value })
              }
              placeholder="VD: Eco, Plus, Premium..."
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Color <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1 focus:ring-blue-500 focus:border-blue-500"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              placeholder="VD: Trắng, Đen, Bạc..."
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              EV Type <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1 focus:ring-blue-500 focus:border-blue-500"
              value={form.evType}
              onChange={(e) => setForm({ ...form, evType: e.target.value })}
            >
              {evTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Horse Power <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1 focus:ring-blue-500 focus:border-blue-500"
              value={form.horsePower}
              onChange={(e) =>
                setForm({ ...form, horsePower: numberOnly(e.target.value) })
              }
              min={0}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Base Price (₫) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1 focus:ring-blue-500 focus:border-blue-500"
              value={form.basePrice}
              onChange={(e) =>
                setForm({ ...form, basePrice: numberOnly(e.target.value) })
              }
              min={0}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Stock Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1 focus:ring-blue-500 focus:border-blue-500"
              value={form.stockQuantity}
              onChange={(e) =>
                setForm({ ...form, stockQuantity: numberOnly(e.target.value) })
              }
              min={0}
            />
          </div>

          {/* === IMAGE UPLOAD (REPLACED) === */}
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700 mb-1">
              Image <span className="text-red-500">*</span>
            </label>

            {/* Drag & Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={
                `relative rounded-xl border-2 border-dashed p-4 transition-all duration-300 ` +
                (dragActive
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-300 bg-gray-50")
              }
            >
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                onChange={onFileInputChange}
                className="hidden"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => document.getElementById("fileInput").click()}
                  className="px-3 py-1 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Chọn ảnh"}
                </button>
                <p className="text-sm text-gray-500">
                  Kéo & thả ảnh vào đây hoặc nhấn "Chọn ảnh"
                </p>
              </div>

              {/* Progress Bar */}
              {uploading && (
                <div className="mt-3 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              {/* Preview */}
              <div className="mt-3 h-40 w-full bg-white rounded-xl border grid place-items-center overflow-hidden">
                {(localPreview || form.imageUrl) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={localPreview || form.imageUrl}
                    alt="Preview"
                    className={`max-h-40 object-contain transition-opacity duration-500 ${uploading ? "opacity-60" : "opacity-100"}`}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ) : (
                  <span className="text-sm text-gray-400">Image preview</span>
                )}
              </div>

              {/* Faded URL text after upload */}
              {form.imageUrl && (
                <p className="mt-2 text-xs text-gray-500 truncate">
                  Uploaded URL: {form.imageUrl}
                </p>
              )}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeAndReset}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {mode === "edit" ? "Save changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 