import React, { useState } from "react";
import { User, Shield, Camera, Eye, EyeOff, Lock, Mail, AlertTriangle, CheckCircle } from "lucide-react";

export default function UserProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [name, setName] = useState("Vũ Minh Trí");
  const [email, setEmail] = useState("minhtri.vu@example.com");
  const [phone, setPhone] = useState("+84 987 654 321");
  const [bio, setBio] = useState(
    "Chuyên gia về phát triển phần mềm và kiến trúc hệ thống, đam mê các công nghệ mới và tối ưu hóa hiệu suất ứng dụng."
  );
  
  // Security states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Forgot password states
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleSave = () => {
    alert("Lưu thay đổi thành công!");
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (newPassword.length < 8) {
      alert("Mật khẩu phải có ít nhất 8 ký tự!");
      return;
    }
    // Here you would typically call an API to change the password
    alert("Đổi mật khẩu thành công!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleForgotPassword = () => {
    if (!forgotPasswordEmail) {
      alert("Vui lòng nhập địa chỉ email!");
      return;
    }
    // Here you would typically call an API to send reset email
    setResetEmailSent(true);
    setTimeout(() => {
      setResetEmailSent(false);
      setForgotPasswordEmail("");
    }, 5000); // Reset after 5 seconds
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Hồ sơ người dùng
              </h1>
              <p className="text-gray-600">Quản lý thông tin cá nhân và bảo mật tài khoản</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-all ${
                activeTab === "profile"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              <User className="w-5 h-5" />
              Thông tin cá nhân
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-all ${
                activeTab === "security"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              <Shield className="w-5 h-5" />
              Bảo mật tài khoản
            </button>
          </div>

          {/* Profile Tab Content */}
          {activeTab === "profile" && (
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center space-y-6">
                  <div className="relative">
                    <img
                      src="https://via.placeholder.com/120"
                      alt="avatar"
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <button className="absolute bottom-2 right-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-shadow">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all">
                    Tải ảnh lên
                  </button>
                </div>

                {/* Form Section */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Giới thiệu bản thân</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-4 pt-6">
                    <button className="px-6 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                      Hủy bỏ
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                    >
                      Lưu thay đổi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab Content */}
          {activeTab === "security" && (
            <div className="p-8 space-y-8">
              {/* Password Change Section */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Lock className="w-6 h-6" />
                  Thay đổi mật khẩu
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu hiện tại</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu mới</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="Nhập mật khẩu mới"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="Nhập lại mật khẩu mới"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={handlePasswordChange}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    Cập nhật mật khẩu
                  </button>
                </div>
              </div>

              {/* Forgot Password Section */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Mail className="w-6 h-6" />
                  Quên mật khẩu
                </h3>
                
                {resetEmailSent ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <h4 className="font-semibold text-green-800">Email đặt lại mật khẩu đã được gửi!</h4>
                    </div>
                    <p className="text-green-700 mb-4">
                      Chúng tôi đã gửi liên kết đặt lại mật khẩu đến địa chỉ email: <strong>{forgotPasswordEmail}</strong>
                    </p>
                    <div className="bg-green-100 rounded-lg p-4">
                      <h5 className="font-medium text-green-800 mb-2">Hướng dẫn tiếp theo:</h5>
                      <ul className="list-disc list-inside text-sm text-green-700 space-y-1">
                        <li>Kiểm tra hộp thư đến của bạn (có thể mất vài phút)</li>
                        <li>Nhấp vào liên kết trong email để đặt lại mật khẩu</li>
                        <li>Tạo mật khẩu mới và xác nhận thay đổi</li>
                        <li>Nếu không thấy email, kiểm tra thư mục spam</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-800">Lưu ý quan trọng</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Tính năng này sẽ gửi email đặt lại mật khẩu đến địa chỉ email đã đăng ký. 
                            Đảm bảo bạn có quyền truy cập vào email này trước khi tiếp tục.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Địa chỉ email để nhận liên kết đặt lại mật khẩu
                        </label>
                        <input
                          type="email"
                          value={forgotPasswordEmail}
                          onChange={(e) => setForgotPasswordEmail(e.target.value)}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                          placeholder="Nhập địa chỉ email của bạn"
                        />
                        <p className="text-sm text-gray-500 mt-2">
                          Email hiện tại: <span className="font-medium text-gray-700">{email}</span>
                        </p>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h5 className="font-medium text-yellow-800 mb-2">Quy trình đặt lại mật khẩu:</h5>
                        <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
                          <li>Nhập địa chỉ email và nhấn "Gửi email đặt lại"</li>
                          <li>Kiểm tra email và nhấp vào liên kết trong thư</li>
                          <li>Tạo mật khẩu mới theo yêu cầu bảo mật</li>
                          <li>Đăng nhập với mật khẩu mới</li>
                        </ol>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={handleForgotPassword}
                          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                        >
                          <Mail className="w-5 h-5 inline mr-2" />
                          Gửi email đặt lại
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
