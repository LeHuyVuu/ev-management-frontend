import React, { useEffect, useState } from "react";
import { Search, Bell, LogOut } from "lucide-react";
import ProfileModal from "./ProfileModal";
import api from "../../context/api";

const PROFILE_ENDPOINT =
  `${api.identity}/api/User/me`;

function getToken() {
  const candidateKeys = [
    "token",
    "access_token",
    "authToken",
    "jwt",
    "id_token",
  ];
  for (const k of candidateKeys) {
    const v = window.localStorage.getItem(k);
    if (v) return v;
  }
  return null;
}

const Header = ({ logoutRedirectTo = "/login" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);

  const openProfile = async () => {
    setIsOpen(true);
    if (profile || loading) return; // Avoid refetch while open

    const token = getToken();
    if (!token) {
      setError("Không tìm thấy token trong localStorage.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(PROFILE_ENDPOINT, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        let msg = `Lỗi ${res.status}`;
        try {
          const data = await res.json();
          if (data?.message) msg += `: ${data.message}`;
        } catch (_) { }
        throw new Error(msg);
      }

      const data = await res.json();
      const normalized = data?.data || data; // API per screenshot wraps in data
      setProfile(normalized);
    } catch (err) {
      setError(err.message || "Không thể tải hồ sơ người dùng.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Remove common token keys; use localStorage.clear() if you truly want to wipe all keys
    [
      "token",
      "access_token",
      "authToken",
      "jwt",
      "id_token",
      "refresh_token",
    ].forEach((k) => localStorage.removeItem(k));

    setProfile(null);
    window.location.assign(logoutRedirectTo);
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <span className="text-xl font-semibold text-gray-800">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnZfrwLKBUrEEL6oD9XsTdK7YqRaDM6yCpgw&s"
                alt="Logo"
                className="h-10 w-full"
              />
            </span>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
           

            

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>

            {/* User Avatar */}
            <button
              type="button"
              onClick={openProfile}
              className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-gray-200 hover:ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Mở hồ sơ người dùng"
            >
              <img
                src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&fit=crop&crop=face"
                alt="User Avatar"
                className="w-8 h-8 object-cover"
              />
            </button>
          </div>
        </div>
      </header>

      {isOpen && (
        <ProfileModal
          onClose={() => setIsOpen(false)}
          loading={loading}
          error={error}
          profile={profile}
        />
      )}
    </>
  );
};

export default Header;
