import React, { useEffect, useMemo, useState, useCallback } from "react";
import { X, User, Mail, Shield, Eye, EyeOff, Building2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

// ====== API & helpers ======
const API_URL = "https://prn232.freeddns.org/identity-service/api/admin/users";
const DEALERS_API = "https://prn232.freeddns.org/dealer-service/api/Dealers/active-dealers";

function getTokenFromLocalStorage() {
  const keys = ["access_token", "token", "authToken", "jwt"];
  for (const k of keys) {
    const v = window.localStorage.getItem(k);
    if (v) return v;
  }
  return null;
}

const roleMap = {
  1: "Admin",
  2: "EVM Staff",
  3: "Dealer Manager",
  4: "Dealer Staff",
  5: "Auditor",
};
const roleNameToId = {
  "Admin": 1,
  "EVM Staff": 2,
  "Dealer Manager": 3,
  "Dealer Staff": 4,
  "Auditor": 5,
};
const isDealerRoleName = (name) => name === "Dealer Manager" || name === "Dealer Staff";

// === API helpers ===
async function createUserApi(payload) {
  const token = getTokenFromLocalStorage();
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Tạo user thất bại`);
  }
  return res.json();
}

async function patchUserStatus(userId, status) {
  const token = getTokenFromLocalStorage();
  const url = `${API_URL}/${userId}/status?status=${encodeURIComponent(status)}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      accept: "*/*",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Cập nhật trạng thái thất bại (${res.status}): ${txt || res.statusText}`);
  }
  return res.json?.() ?? null;
}

// ===== Toasts =====
function Toasts({ toasts }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-2 px-4 py-3 rounded-lg shadow-lg min-w-[260px] ${
            t.type === "error"
              ? "bg-red-50 border border-red-200 text-red-700"
              : "bg-green-50 border border-green-200 text-green-700"
          }`}
        >
          {t.type === "error" ? (
            <AlertCircle className="w-5 h-5 mt-[2px]" />
          ) : (
            <CheckCircle2 className="w-5 h-5 mt-[2px]" />
          )}
          <div className="text-sm">{t.message}</div>
        </div>
      ))}
    </div>
  );
}

const UserManagement = () => {
  // Bỏ dữ liệu mẫu
  const [users, setUsers] = useState([]);

  // Loading & error
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null); // id đang delete/update
  const [err, setErr] = useState("");

  // Pagination
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Toasts
  const [toasts, setToasts] = useState([]);
  const pushToast = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  };

  // Dealers
  const [dealers, setDealers] = useState([]);
  const dealersById = useMemo(() => {
    const m = new Map();
    dealers.forEach((d) => m.set(d.dealerId, d));
    return m;
  }, [dealers]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUserIndex, setSelectedUserIndex] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    status: "Active",
    password: "",
    confirmPassword: "",
    dealerId: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isDealerRole = isDealerRoleName(formData.role);

  // Load dealers once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = getTokenFromLocalStorage();
        const res = await fetch(DEALERS_API, {
          headers: {
            accept: "*/*",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) throw new Error(`Dealer API lỗi (${res.status})`);
        const json = await res.json();
        const data = Array.isArray(json) ? json : json?.data || [];
        const mapped = data.map((d) => ({
          dealerId: d.dealerId,
          dealerCode: d.dealerCode,
          name: d.name,
          region: d.region,
          address: d.address,
          contactEmail: d.contactEmail,
          contactPhone: d.contactPhone,
          status: d.status,
        }));
        if (mounted) setDealers(mapped);
      } catch (e) {
        console.warn(e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Load users (paging)
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const token = getTokenFromLocalStorage();
      const url = new URL(API_URL);
      url.searchParams.set("pageNumber", String(pageNumber));
      url.searchParams.set("pageSize", String(pageSize));

      const res = await fetch(url.toString(), {
        headers: {
          accept: "*/*",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`API lỗi (${res.status}): ${txt || res.statusText}`);
      }

      const json = await res.json();
      const items = json?.data?.items || [];

      const mapped = items.map((u) => ({
        userId: u.userId ?? u.id,
        name: u.name,
        email: u.email,
        roleId: u.roleId,
        role: roleMap[u.roleId] || "Unknown",
        status: (u.status || "").toLowerCase() === "active" ? "Active" : u.status || "Inactive",
        dealerId: u.dealerId ?? null,
      }));

      setUsers(mapped);
      setTotalItems(json?.data?.totalItems ?? mapped.length);
      setTotalPages(json?.data?.totalPages ?? 1);
    } catch (e) {
      setErr(e.message || "Không tải được danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Auto-fill email when Dealer Manager + dealer selected
  useEffect(() => {
    if (formData.role === "Dealer Manager" && formData.dealerId) {
      const d = dealersById.get(formData.dealerId);
      if (d?.contactEmail && formData.email !== d.contactEmail) {
        setFormData((prev) => ({ ...prev, email: d.contactEmail }));
      }
    }
  }, [formData.role, formData.dealerId, dealersById, formData.email]);

  // Handlers
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "",
      status: "Active",
      password: "",
      confirmPassword: "",
      dealerId: "",
    });
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const openAddModal = () => {
    resetForm();
    setEditingUser(null);
    setShowModal(true);
  };

  const openEditModal = (user, index) => {
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      password: "",
      confirmPassword: "",
      dealerId: user.dealerId || "",
    });
    setEditingUser(user);
    setSelectedUserIndex(index);
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setSelectedUserIndex(null);
    resetForm();
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Tên là bắt buộc";
    if (!formData.email.trim()) newErrors.email = "Email là bắt buộc";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email không hợp lệ";
    if (!formData.role) newErrors.role = "Vai trò là bắt buộc";
    if (isDealerRole && !formData.dealerId) newErrors.dealerId = "Vui lòng chọn Dealer";

    if (!editingUser) {
      if (!formData.password) newErrors.password = "Mật khẩu là bắt buộc";
      else if (formData.password.length < 6) newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingUser) {
        // Local update: cố định vai trò & dealer; user lên đầu bảng
        const updated = {
          ...editingUser,
          name: formData.name,
          email: formData.email,
          status: formData.status,
        };
        setUsers((prev) => {
          const arr = [...prev];
          arr.splice(selectedUserIndex, 1);
          return [updated, ...arr];
        });
        pushToast("Cập nhật người dùng thành công.");
      } else {
        // Create via API
        const payload = {
          name: formData.name,
          email: formData.email,
          phone: "",
          passwordHash: formData.password, // theo swagger
          roleId: roleNameToId[formData.role],
          dealerId: isDealerRole ? formData.dealerId : null,
          status: formData.status,
        };
        await createUserApi(payload);
        // Sau khi tạo, reload trang 1 hoặc thêm lên đầu
        // Gọi lại API để lấy userId chính xác:
        await loadUsers();
        // Đưa user vừa tạo lên đầu theo local form (phòng trường hợp API chưa trả kịp)
        setUsers((prev) => [{ ...payload, role: formData.role }, ...prev]);
        pushToast("Tạo người dùng thành công.");
      }
      closeModal();
    } catch (e) {
      setErr(e.message || "Có lỗi khi lưu người dùng.");
      pushToast(e.message || "Có lỗi khi lưu người dùng.", "error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "active":
        return "text-green-600 font-semibold";
      case "inactive":
        return "text-gray-500 bg-gray-100 px-2 py-1 rounded-full text-xs";
      case "locked":
        return "text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs font-semibold";
      default:
        return "text-gray-600";
    }
  };

  const canPrev = pageNumber > 1;
  const canNext = pageNumber < totalPages;

  const currentDealer =
    isDealerRole && formData.dealerId ? dealersById.get(formData.dealerId) : null;

  // Delete (patch status=inactive) with confirm
  const handleDelete = async (user, index) => {
  const ok = window.confirm("Bạn có chắc chắn muốn đổi trạng thái người dùng này thành Inactive?");
  if (!ok) return;

  try {
    // nếu có userId từ API: gọi patch, nếu chưa có thì chỉ cập nhật local
    if (user?.userId) {
      setActionLoadingId(user.userId);
      await patchUserStatus(user.userId, "inactive");
    }

    // ✅ Cập nhật tại chỗ (không filter xóa)
    setUsers((prev) =>
      prev.map((u, i) =>
        (user?.userId ? u.userId === user.userId : i === index)
          ? { ...u, status: "Inactive" }
          : u
      )
    );

    pushToast("Đã cập nhật trạng thái người dùng thành Inactive.");
  } catch (e) {
    pushToast(e.message || "Cập nhật trạng thái thất bại.", "error");
  } finally {
    setActionLoadingId(null);
  }
};


  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative">
      <Toasts toasts={toasts} />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">User Management</h2>
        <div className="flex space-x-3">
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center space-x-2 disabled:opacity-50"
            disabled={loading}
          >
            <span>＋</span>
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Loading / Error */}
      {err && <p className="text-red-600 mb-3">⚠️ {err}</p>}
      {loading && (
        <div className="flex items-center gap-2 text-gray-500 mb-3">
          <Loader2 className="w-4 h-4 animate-spin" /> Đang tải danh sách người dùng...
        </div>
      )}

      {/* User Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">User Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Role</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user, i) => (
              <tr key={`${user.email}-${i}`}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {user.role}
                  {isDealerRoleName(user.role) && user.dealerId && dealersById.get(user.dealerId) && (
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {dealersById.get(user.dealerId)?.name}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={getStatusColor(user.status)}>{user.status}</span>
                </td>
                <td className="px-6 py-4 text-sm flex items-center gap-3">
                  <button
                    onClick={() => openEditModal(user, i)}
                    className="text-gray-500 hover:text-indigo-600 disabled:opacity-50"
                    title="Edit"
                    disabled={!!actionLoadingId}
                  >
                    ✏️
                  </button>
                  <button
                    className="text-gray-500 hover:text-red-600 disabled:opacity-50 flex items-center gap-1"
                    title="Delete"
                    disabled={actionLoadingId === user.userId}
                    onClick={() => handleDelete(user, i)}
                  >
                    {actionLoadingId === user.userId ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
                      </>
                    ) : (
                      <>🗑️</>
                    )}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                  Không có người dùng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-sm text-gray-600">
          Trang <span className="font-medium">{pageNumber}</span> / {totalPages} • Tổng {totalItems} users
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Page size:</label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPageNumber(1);
            }}
            className="border rounded-md px-2 py-1 text-sm"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <button
            disabled={!canPrev || loading}
            onClick={() => canPrev && setPageNumber((p) => p - 1)}
            className={`px-3 py-1 rounded-md border text-sm ${
              canPrev && !loading ? "hover:bg-gray-50" : "opacity-50 cursor-not-allowed"
            }`}
          >
            ← Prev
          </button>
          <button
            disabled={!canNext || loading}
            onClick={() => canNext && setPageNumber((p) => p + 1)}
            className={`px-3 py-1 rounded-md border text-sm ${
              canNext && !loading ? "hover:bg-gray-50" : "opacity-50 cursor-not-allowed"
            }`}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <User className="w-6 h-6" />
                {editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none transition-colors ${
                      errors.name ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                    }`}
                    placeholder="Nhập họ và tên"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      readOnly={formData.role === "Dealer Manager" && !!formData.dealerId}
                      className={`w-full border-2 rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-colors ${
                        errors.email ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                      } ${formData.role === "Dealer Manager" && formData.dealerId ? "bg-gray-50" : ""}`}
                      placeholder="user@example.com"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Vai trò *</label>
                  <div className="relative">
                    <Shield className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      name="role"
                      value={formData.role}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          role: value,
                          dealerId: isDealerRoleName(value) ? prev.dealerId : "",
                        }));
                        if (errors.role) setErrors((prev) => ({ ...prev, role: "" }));
                      }}
                      disabled={!!editingUser} // KHÔNG cho sửa vai trò khi edit
                      className={`w-full border-2 rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-colors ${
                        errors.role ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                      } ${editingUser ? "bg-gray-50 cursor-not-allowed" : ""}`}
                    >
                      <option value="">Chọn vai trò</option>
                      <option value="Admin">Admin</option>
                      <option value="EVM Staff">EVM Staff</option>
                      <option value="Dealer Manager">Dealer Manager</option>
                      <option value="Dealer Staff">Dealer Staff</option>
                      <option value="Auditor">Auditor</option>
                    </select>
                  </div>
                  {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
                </div>

                {/* Dealer select */}
                {isDealerRole && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Dealer *</label>
                    <div className="relative">
                      <Building2 className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <select
                        name="dealerId"
                        value={formData.dealerId}
                        onChange={handleInputChange}
                        disabled={!!editingUser} // KHÔNG cho sửa dealer khi edit
                        className={`w-full border-2 rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-colors ${
                          errors.dealerId ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                        } ${editingUser ? "bg-gray-50 cursor-not-allowed" : ""}`}
                      >
                        <option value="">Chọn Dealer</option>
                        {dealers.map((d) => (
                          <option key={d.dealerId} value={d.dealerId}>
                            {d.name} ({d.dealerCode})
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.dealerId && <p className="text-red-500 text-sm mt-1">{errors.dealerId}</p>}
                    {formData.dealerId && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Dealer name:</span>{" "}
                        {currentDealer?.name || dealersById.get(formData.dealerId)?.name || "—"}
                      </div>
                    )}
                  </div>
                )}

                {/* Status */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Trạng thái</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="Active"
                        checked={formData.status === "Active"}
                        onChange={handleInputChange}
                        className="text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-green-600">Hoạt động</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="Inactive"
                        checked={formData.status === "Inactive"}
                        onChange={handleInputChange}
                        className="text-gray-600 focus:ring-gray-500"
                      />
                      <span className="text-sm font-medium text-gray-600">Không hoạt động</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="Locked"
                        checked={formData.status === "Locked"}
                        onChange={handleInputChange}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm font-medium text-red-600">Bị khóa</span>
                    </label>
                  </div>
                </div>

                {/* Password fields — chỉ khi thêm mới */}
                {!editingUser && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`w-full border-2 rounded-xl px-4 py-3 pr-12 focus:outline-none transition-colors ${
                            errors.password ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                          }`}
                          placeholder="Nhập mật khẩu"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Xác nhận mật khẩu *</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`w-full border-2 rounded-xl px-4 py-3 pr-12 focus:outline-none transition-colors ${
                            errors.confirmPassword
                              ? "border-red-500 focus:border-red-500"
                              : "border-gray-200 focus:border-blue-500"
                          }`}
                          placeholder="Nhập lại mật khẩu"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  {editingUser ? "Cập nhật" : "Thêm người dùng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
