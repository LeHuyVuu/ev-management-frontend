import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  X, User, Mail, Shield, Eye, EyeOff, Building2, CheckCircle2, AlertCircle,
  Loader2, Filter as FilterIcon, Search, RefreshCw, ChevronDown, Plus, Pencil, Trash2,
  ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight
} from "lucide-react";
import { Popconfirm } from "antd";

// ====== Thêm cấu hình API + helper (không đổi UI cũ) ======
const API_URL = "https://prn232.freeddns.org/identity-service/api/admin/users";
const DEALERS_API = "https://prn232.freeddns.org/dealer-service/api/Dealers/active-dealers";
const UPDATE_USER_URL = (id) => `https://prn232.freeddns.org/identity-service/api/User/${id}`;

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
const allRoles = Object.values(roleMap);
const roleNameToId = {
  Admin: 1,
  "EVM Staff": 2,
  "Dealer Manager": 3,
  "Dealer Staff": 4,
  Auditor: 5,
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
    headers: { accept: "*/*", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Cập nhật trạng thái thất bại (${res.status}): ${txt || res.statusText}`);
  }
  try { return await res.json(); } catch { return null; }
}

async function updateUserApi(userId, payload) {
  const token = getTokenFromLocalStorage();
  const res = await fetch(UPDATE_USER_URL(userId), {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch {}
  if (!res.ok) throw new Error(json?.message || `Cập nhật user thất bại (${res.status})`);
  return json;
}

// ===== Toasts =====
function Toasts({ toasts }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-2 px-4 py-3 rounded-lg shadow-lg min-w-[280px] ${
            t.type === "error"
              ? "bg-red-50 border border-red-200 text-red-700"
              : "bg-emerald-50 border border-emerald-200 text-emerald-700"
          }`}
        >
          {t.type === "error" ? <AlertCircle className="w-5 h-5 mt-[2px]" /> : <CheckCircle2 className="w-5 h-5 mt-[2px]" />}
          <div className="text-sm leading-5">{t.message}</div>
        </div>
      ))}
    </div>
  );
}

// ===== Small UI atoms =====
const BadgeStatus = ({ status }) => {
  const isActive = (status || "").toLowerCase() === "active";
  return (
    <span
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border ${
        isActive
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-slate-50 text-slate-700 border-slate-200"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
};

const EmptyState = ({ title = "Không có dữ liệu", subtitle = "Thử thay đổi bộ lọc hoặc làm mới." }) => (
  <div className="py-12 flex flex-col items-center justify-center text-center">
    <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-4">
      <User className="w-7 h-7 text-gray-400" />
    </div>
    <p className="text-base font-semibold text-gray-800">{title}</p>
    <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
  </div>
);

// ===== Main Component =====
const UserManagement = () => {
  // Data
  const [users, setUsers] = useState([]);
  const [dealers, setDealers] = useState([]);

  // ==== Thêm state tải/lỗi + phân trang ====
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [err, setErr] = useState("");

  // Toasts
  const [toasts, setToasts] = useState([]);
  const pushToast = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  };

  // Filters (frontend)
  const [q, setQ] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all"); // all | active | inactive
  const [filterDealer, setFilterDealer] = useState("all");

  // Client-side pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // 10/20/50/100

  // Form / Modal
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUserIndex, setSelectedUserIndex] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    status: "active",
    password: "",
    confirmPassword: "",
    dealerId: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isDealerRole = isDealerRoleName(formData.role);

  const dealersById = useMemo(() => {
    const m = new Map();
    dealers.forEach((d) => m.set(d.dealerId, d));
    return m;
  }, [dealers]);

  // ===== Loaders =====
  const loadDealers = useCallback(async () => {
    try {
      const token = getTokenFromLocalStorage();
      const res = await fetch(DEALERS_API, {
        headers: { accept: "*/*", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
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
      setDealers(mapped);
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const token = getTokenFromLocalStorage();
      const url = new URL(API_URL);
      // LẤY HẾT: ép pageNumber=1 & pageSize=1000
      url.searchParams.set("pageNumber", "1");
      url.searchParams.set("pageSize", "1000");
      const res = await fetch(url.toString(), {
        headers: { accept: "*/*", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
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
        status: (u.status || "").toLowerCase() === "active" ? "active" : "inactive",
        dealerId: u.dealerId ?? null,
        phone: u.phone ?? "",
      }));
      setUsers(mapped);
    } catch (e) {
      setErr(e.message || "Không tải được danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDealers();
  }, [loadDealers]);

    loadUsers();
    return () => { mounted = false; };
  }, [pageNumber, pageSize]);
  // =======================================================

  // ===== Effects =====
  useEffect(() => {
    if (formData.role === "Dealer Manager" && formData.dealerId) {
      const d = dealersById.get(formData.dealerId);
      if (d?.contactEmail && formData.email !== d.contactEmail) {
        setFormData((prev) => ({ ...prev, email: d.contactEmail }));
      }
    }
  }, [formData.role, formData.dealerId, dealersById, formData.email]);

  // Reset trang khi thay đổi filter/search/page size
  useEffect(() => {
    setCurrentPage(1);
  }, [q, filterRole, filterStatus, filterDealer, pageSize]);

  // ===== Filters (client-side) =====
  const filteredUsers = useMemo(() => {
    const qNorm = q.trim().toLowerCase();
    return users.filter((u) => {
      const matchText =
        !qNorm ||
        (u.name || "").toLowerCase().includes(qNorm) ||
        (u.email || "").toLowerCase().includes(qNorm);
      const matchRole =
        filterRole === "all" || (u.role || "").toLowerCase() === filterRole.toLowerCase();
      const matchStatus =
        filterStatus === "all" || (u.status || "") === filterStatus;
      const matchDealer =
        filterDealer === "all" || (u.dealerId || "") === filterDealer;
      return matchText && matchRole && matchStatus && matchDealer;
    });
  }, [users, q, filterRole, filterStatus, filterDealer]);

  // ===== Pagination (client-side) =====
  const totalItems = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrent = Math.min(currentPage, totalPages);
  const startIdx = (safeCurrent - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalItems);
  const pageUsers = filteredUsers.slice(startIdx, endIdx);

  const goFirst = () => setCurrentPage(1);
  const goLast = () => setCurrentPage(totalPages);
  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  // ===== Handlers =====
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "",
      status: "active",
      password: "",
      confirmPassword: "",
      dealerId: "",
      phone: "",
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
      phone: user.phone || "",
    });
    setEditingUser(user);
    setSelectedUserIndex(index); // index trong trang hiện tại
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setSelectedUserId(null);
    resetForm();
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Tên là bắt buộc";
    if (!formData.email.trim()) newErrors.email = "Email là bắt buộc";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email không hợp lệ";
    if (!formData.role) newErrors.role = "Vai trò là bắt buộc";
    
    // Password validation for new users
    if (!editingUser) {
      if (!formData.password) newErrors.password = "Mật khẩu là bắt buộc";
      else if (formData.password.length < 6) newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }
    
    // Password validation for editing users (only if password is provided)
    if (editingUser && formData.password) {
      if (formData.password.length < 6) newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingUser) {
        // PUT update
        const payload = {
          userId: editingUser.userId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone || "",
          passwordHash: formData.password || "",
          roleId: roleNameToId[formData.role],
          dealerId: isDealerRole ? formData.dealerId : null,
          status: (formData.status || "active").toLowerCase(),
        };
        setActionLoadingId(editingUser.userId);
        const res = await updateUserApi(editingUser.userId, payload);
        const updatedFromApi = res?.data || payload;
        const updatedUser = {
          ...editingUser,
          name: updatedFromApi.name,
          email: updatedFromApi.email,
          phone: updatedFromApi.phone,
          status: (updatedFromApi.status || "active").toLowerCase(),
        };

        // Cập nhật trong mảng users gốc (không chỉ trang)
        setUsers((prev) =>
          prev.map((u) => (u.userId === editingUser.userId ? { ...u, ...updatedUser } : u))
        );

        pushToast(res?.message || "Cập nhật người dùng thành công.");
      } else {
        // POST create
        const payload = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || "",
          passwordHash: formData.password,
          roleId: roleNameToId[formData.role],
          dealerId: isDealerRole ? formData.dealerId : null,
          status: (formData.status || "active").toLowerCase(),
        };
        await createUserApi(payload);
        await loadUsers(); // tải lại full list (1000)
        pushToast("Tạo người dùng thành công.");
      }
      closeModal();
    } catch (e) {
      setErr(e.message || "Có lỗi khi lưu người dùng.");
      pushToast(e.message || "Có lỗi khi lưu người dùng.", "error");
    } finally {
      setActionLoadingId(null);
    }
    
    closeModal();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const onClearFilters = () => {
    setQ("");
    setFilterRole("all");
    setFilterStatus("all");
    setFilterDealer("all");
  };

  // ===== Render =====
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 relative">
      <Toasts toasts={toasts} />

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-5">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">User Management</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadUsers()}
            className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={openAddModal}
            className="px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-sm"
            disabled={loading}
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Error */}
      {err && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {err}
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50/60 p-3">
        <div className="flex items-center gap-2 mb-3 text-gray-700 font-medium">
          <FilterIcon className="w-4 h-4" />
          Bộ lọc nhanh
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm theo tên hoặc email…"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Role filter */}
          <div>
            <div className="relative">
              <Shield className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-indigo-500 appearance-none"
              >
                <option value="all">Tất cả vai trò</option>
                {allRoles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Status filter */}
          <div>
            <div className="relative">
              <div className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-emerald-500 to-indigo-500 opacity-70" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-indigo-500 appearance-none"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Dealer filter */}
          <div className="md:col-span-2">
            <div className="relative">
              <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={filterDealer}
                onChange={(e) => setFilterDealer(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-indigo-500 appearance-none"
              >
                <option value="all">Tất cả Dealer</option>
                {dealers.map((d) => (
                  <option key={d.dealerId} value={d.dealerId}>
                    {d.name} ({d.dealerCode})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={onClearFilters}
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
            >
              Xoá bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <div className="max-h-[60vh] overflow-auto">
          <table className="min-w-full">
            <thead className="sticky top-0 z-[1] bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-gray-600">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-gray-600">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-gray-600">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-gray-600">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang tải dữ liệu…
                    </div>
                  </td>
                </tr>
              )}

              {!loading && pageUsers.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <EmptyState title="Không tìm thấy người dùng" subtitle="Thử thay đổi từ khoá hoặc bộ lọc." />
                  </td>
                </tr>
              )}

              {!loading && pageUsers.map((user, i) => (
                <tr key={`${user.userId || user.email}-${i}`} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                        {isDealerRoleName(user.role) && user.dealerId && dealersById.get(user.dealerId) && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {dealersById.get(user.dealerId)?.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700">{user.email}</div>
                    {user.phone && <div className="text-xs text-gray-400 mt-0.5">{user.phone}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-2 text-sm text-gray-800">
                      <Shield className="w-4 h-4 text-gray-400" />
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <BadgeStatus status={user.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(user, i)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                        title="Chỉnh sửa"
                        disabled={!!actionLoadingId}
                      >
                        <Pencil className="w-4 h-4" /> Edit
                      </button>

                      <Popconfirm
                        title="Đổi trạng thái thành Inactive?"
                        description="Người dùng sẽ bị vô hiệu hóa (inactive). Bạn có chắc chắn?"
                        okText="Đồng ý"
                        cancelText="Hủy"
                        onConfirm={async () => {
                          try {
                            if (user?.userId) {
                              setActionLoadingId(user.userId);
                              await patchUserStatus(user.userId, "inactive");
                            }
                            setUsers((prev) =>
                              prev.map((u) => (u.userId === user.userId ? { ...u, status: "inactive" } : u))
                            );
                            pushToast("Đã cập nhật trạng thái người dùng thành Inactive.");
                          } catch (e) {
                            pushToast(e.message || "Cập nhật trạng thái thất bại.", "error");
                          } finally {
                            setActionLoadingId(null);
                          }
                        }}
                        okButtonProps={{ className: "bg-red-600 hover:bg-red-700 text-white" }}
                      >
                        <button
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60"
                          title="Set Inactive"
                          disabled={actionLoadingId === user.userId}
                        >
                          {actionLoadingId === user.userId ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" /> Updating…
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4" /> Inactive
                            </>
                          )}
                        </button>
                      </Popconfirm>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3 border-t border-gray-200 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-gray-600">
            Hiển thị{" "}
            <span className="font-semibold">{totalItems === 0 ? 0 : startIdx + 1}</span>
            {"–"}
            <span className="font-semibold">{endIdx}</span> trên{" "}
            <span className="font-semibold">{totalItems}</span> người dùng
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Page size:</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border rounded-md px-2 py-1 text-sm"
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>

            <div className="flex items-center gap-1">
              <button
                onClick={goFirst}
                disabled={safeCurrent <= 1}
                className={`p-2 rounded-md border ${safeCurrent > 1 ? "hover:bg-gray-50" : "opacity-50 cursor-not-allowed"}`}
                title="Trang đầu"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goPrev}
                disabled={safeCurrent <= 1}
                className={`p-2 rounded-md border ${safeCurrent > 1 ? "hover:bg-gray-50" : "opacity-50 cursor-not-allowed"}`}
                title="Trang trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-2 text-sm text-gray-700">
                Trang <span className="font-semibold">{safeCurrent}</span> / {totalPages}
              </span>

              <button
                onClick={goNext}
                disabled={safeCurrent >= totalPages}
                className={`p-2 rounded-md border ${safeCurrent < totalPages ? "hover:bg-gray-50" : "opacity-50 cursor-not-allowed"}`}
                title="Trang sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={goLast}
                disabled={safeCurrent >= totalPages}
                className={`p-2 rounded-md border ${safeCurrent < totalPages ? "hover:bg-gray-50" : "opacity-50 cursor-not-allowed"}`}
                title="Trang cuối"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Form Modal (giữ nguyên UI cũ) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <User className="w-6 h-6" />
                {editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none transition-colors ${
                      errors.name ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-indigo-500"
                    }`}
                    placeholder="Nhập họ và tên"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full border-2 rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-colors ${
                        errors.email ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-indigo-500"
                      } ${formData.role === "Dealer Manager" && formData.dealerId ? "bg-gray-50" : ""}`}
                      placeholder="user@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full border-2 rounded-xl px-4 py-3 focus:outline-none transition-colors border-gray-200 focus:border-indigo-500"
                    placeholder="VD: 0909123456"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Vai trò *
                  </label>
                  <div className="relative">
                    <Shield className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
                      disabled={!!editingUser}
                      className={`w-full border-2 rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-colors ${
                        errors.role ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-indigo-500"
                      } ${editingUser ? "bg-gray-50 cursor-not-allowed" : ""}`}
                    >
                      <option value="">Chọn vai trò</option>
                      {allRoles.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  {errors.role && (
                    <p className="text-red-500 text-sm mt-1">{errors.role}</p>
                  )}
                </div>

                {/* Dealer select */}
                {isDealerRole && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Dealer *</label>
                    <div className="relative">
                      <Building2 className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select
                        name="dealerId"
                        value={formData.dealerId}
                        onChange={handleInputChange}
                        disabled={!!editingUser}
                        className={`w-full border-2 rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-colors ${
                          errors.dealerId ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-indigo-500"
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
                        {dealersById.get(formData.dealerId)?.name || "—"}
                      </div>
                    )}
                  </div>
                )}

                {/* Status */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="active"
                        checked={formData.status === "active"}
                        onChange={handleInputChange}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-medium text-emerald-700">Hoạt động</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="inactive"
                        checked={formData.status === "inactive"}
                        onChange={handleInputChange}
                        className="text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-sm font-medium text-slate-700">Không hoạt động</span>
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
                            errors.password ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-indigo-500"
                          }`}
                          placeholder="Nhập mật khẩu"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                            errors.confirmPassword ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-indigo-500"
                          }`}
                          placeholder="Nhập lại mật khẩu"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg"
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
