import React, { useState } from "react";
import { X, User, Mail, Shield, Eye, EyeOff } from "lucide-react";

const UserManagement = () => {
  const [users, setUsers] = useState([
    { name: "Alice Smith", email: "alice.s@evm.com", role: "Admin", status: "Active" },
    { name: "Bob Johnson", email: "bob.j@evm.com", role: "EVM Staff", status: "Active" },
    { name: "Charlie Brown", email: "charlie.b@dealers.com", role: "Dealer Manager", status: "Active" },
    { name: "Diana Prince", email: "diana.p@evm.com", role: "EVM Staff", status: "Inactive" },
    { name: "Eve Adams", email: "eve.a@dealers.com", role: "Dealer Staff", status: "Locked" },
  ]);

  // State for popup management
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  
  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    status: "Active",
    password: "",
    confirmPassword: ""
  });
  
  // Form validation state
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handler functions
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "",
      status: "Active",
      password: "",
      confirmPassword: ""
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
      confirmPassword: ""
    });
    setEditingUser(user);
    setSelectedUserId(index);
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
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
      }
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

    if (editingUser) {
      // Update existing user
      const updatedUsers = [...users];
      updatedUsers[selectedUserId] = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status
      };
      setUsers(updatedUsers);
    } else {
      // Add new user
      const newUser = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status
      };
      setUsers([...users, newUser]);
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

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">User Management</h2>
        <div className="flex space-x-3">
          <button 
            onClick={openAddModal}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center space-x-2"
          >
            <span>＋</span>
            <span>Add User</span>
          </button>
        </div>
      </div>

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
              <tr key={i}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{user.role}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={getStatusColor(user.status)}>{user.status}</span>
                </td>
                <td className="px-6 py-4 text-sm flex space-x-3">
                  <button 
                    onClick={() => openEditModal(user, i)}
                    className="text-gray-500 hover:text-indigo-600" 
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button 
                    className="text-gray-500 hover:text-red-600" 
                    title="Delete"
                    onClick={() => {
                      if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
                        setUsers(users.filter((_, index) => index !== i));
                      }
                    }}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <User className="w-6 h-6" />
                {editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
              </h3>
              <button 
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
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
                      errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
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
                    <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full border-2 rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-colors ${
                        errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                      }`}
                      placeholder="user@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Role Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Vai trò *
                  </label>
                  <div className="relative">
                    <Shield className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className={`w-full border-2 rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-colors ${
                        errors.role ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                      }`}
                    >
                      <option value="">Chọn vai trò</option>
                      <option value="Admin">Admin</option>
                      <option value="EVM Staff">EVM Staff</option>
                      <option value="Dealer Manager">Dealer Manager</option>
                      <option value="Dealer Staff">Dealer Staff</option>
                    </select>
                  </div>
                  {errors.role && (
                    <p className="text-red-500 text-sm mt-1">{errors.role}</p>
                  )}
                </div>

                {/* Status Field */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Trạng thái
                  </label>
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

                {/* Password Fields */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mật khẩu {!editingUser && "*"}
                    {editingUser && <span className="text-gray-500 text-xs">(để trống nếu không thay đổi)</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full border-2 rounded-xl px-4 py-3 pr-12 focus:outline-none transition-colors ${
                        errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
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
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Xác nhận mật khẩu {!editingUser && "*"}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full border-2 rounded-xl px-4 py-3 pr-12 focus:outline-none transition-colors ${
                        errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
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
              </div>

              {/* Modal Footer */}
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
