import React, { useEffect, useMemo } from "react";
import { X, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

const ProfileModal = ({ onClose, loading, error, profile }) => {
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  // Unified status (loading / error / info)
  const status = useMemo(() => {
    if (loading) return { type: "info", title: "Đang tải", message: "Đang tải hồ sơ người dùng..." };
    if (error) return { type: "error", title: "Có lỗi xảy ra", message: error };
    if (profile?.status) return { type: "success", title: "Trạng thái người dùng", message: profile.status };
    return null;
  }, [loading, error, profile]);

  const StatusIcon = useMemo(() => {
    switch (status?.type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "error":
        return <XCircle className="w-5 h-5" />;
      case "warn":
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  }, [status]);

  const statusColors = useMemo(() => {
    switch (status?.type) {
      case "success":
        return { bg: "bg-emerald-50", text: "text-emerald-800", sub: "text-emerald-700", ring: "from-emerald-500 via-green-500 to-emerald-600" };
      case "error":
        return { bg: "bg-rose-50", text: "text-rose-800", sub: "text-rose-700", ring: "from-rose-500 via-red-500 to-rose-600" };
      case "warn":
        return { bg: "bg-amber-50", text: "text-amber-800", sub: "text-amber-700", ring: "from-amber-500 via-yellow-500 to-amber-600" };
      default:
        return { bg: "bg-blue-50", text: "text-blue-800", sub: "text-blue-700", ring: "from-blue-500 via-purple-500 to-cyan-500" };
    }
  }, [status]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm focus:outline-none"
        onClick={onClose}
        aria-label="Đóng hộp thoại"
      />

      {/* Dialog wrapper with animated gradient border */}
      <div className="relative w-full md:max-w-2xl max-w-xl mx-4">
        <div className="rounded-2xl shimmer-border shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
          <div className="rounded-2xl bg-white/95 dark:bg-neutral-900/90 border border-white/40 dark:border-white/10 overflow-hidden">
            {/* Header (sticky) */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/10 bg-white/90 dark:bg-neutral-900/80 backdrop-blur">
              <h3
                id="profile-modal-title"
                className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-fuchsia-600"
              >
                User Profile
              </h3>
              <button
                type="button"
                className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/60 transition"
                onClick={onClose}
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Unified status banner (under header) */}
            {status && (
              <div className="px-6 pt-4">
                <div className={`status-border rounded-xl ${statusColors.bg}`}>
                  <div className={`rounded-xl ${statusColors.bg} px-4 py-3 flex items-start gap-3`}>
                    <div className={`${statusColors.text}`}>{StatusIcon}</div>
                    <div className="flex-1">
                      {status.title && <div className={`font-semibold ${statusColors.text}`}>{status.title}</div>}
                      <div className={`text-sm ${statusColors.sub}`}>{status.message}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Body */}
            <div className="px-6 py-5 max-h-[78vh] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:theme(colors.indigo.300)_transparent]">
              {loading && (
                <div className="space-y-4 animate-pulse" aria-live="polite">
                  <div className="h-4 w-40 rounded-md bg-black/10 dark:bg-white/10" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="h-10 rounded-xl bg-black/5 dark:bg-white/5" />
                    ))}
                  </div>
                </div>
              )}

              {!loading && !error && profile && (
                <div className="space-y-6">
                  {/* Top identity block */}
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl gradient-orb text-white grid place-items-center text-lg font-semibold shadow-inner">
                      {profile?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0">
                      <div className="text-lg font-semibold truncate">{profile.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 truncate">{profile.email}</div>
                    </div>
                  </div>

                  {/* Details layout: 2 columns on md+ */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
                    {/* Left column: meta list */}
                    <div className="md:col-span-5 rounded-2xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70">
                      <div className="px-5 py-4 border-b border-black/5 dark:border-white/10 text-sm font-semibold text-gray-700 dark:text-gray-200">
                        Thông tin chung
                      </div>
                      <div className="p-5">
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                          <div>
                            <dt className="text-xs uppercase tracking-wide text-gray-500">Điện thoại</dt>
                            <dd className="mt-1 font-medium break-words">{profile.phone || "—"}</dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase tracking-wide text-gray-500">Role</dt>
                            <dd className="mt-1 font-medium">{profile.roleName || "—"}</dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase tracking-wide text-gray-500">User ID</dt>
                            <dd className="mt-1 font-mono text-xs break-all">{profile.userId || "—"}</dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase tracking-wide text-gray-500">Dealer ID</dt>
                            <dd className="mt-1 font-mono text-xs break-all">{profile.dealerId || "—"}</dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase tracking-wide text-gray-500">Role ID</dt>
                            <dd className="mt-1 font-medium">{profile.roleId || "—"}</dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase tracking-wide text-gray-500">Last Activity</dt>
                            <dd className="mt-1 font-medium">{profile.lastActivityAt || "—"}</dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase tracking-wide text-gray-500">Created At</dt>
                            <dd className="mt-1 font-medium">{profile.createdAt || "—"}</dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase tracking-wide text-gray-500">Updated At</dt>
                            <dd className="mt-1 font-medium">{profile.updatedAt || "—"}</dd>
                          </div>
                          {/* Removed Password Hash for security */}
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-black/5 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70">
              <button
                type="button"
                onClick={onClose}
                className="h-10 px-4 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition text-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Animated border + utilities */}
      <style>{`
        .shimmer-border {
          position: relative;
          padding: 1.25px;
          background: linear-gradient(90deg, #6366f1, #d946ef, #22d3ee, #6366f1);
          background-size: 200% 100%;
          animation: borderMove 6s linear infinite;
        }
        .status-border {
          position: relative; padding: 1px;
          background: linear-gradient(90deg, #60a5fa, #a78bfa, #22d3ee, #60a5fa);
          background-size: 200% 100%;
          animation: borderMove 8s linear infinite;
        }
        @keyframes borderMove {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .gradient-orb {
          background: radial-gradient(100% 100% at 50% 0%, #8b5cf6 0%, #3b82f6 50%, #06b6d4 100%);
        }
      `}</style>
    </div>
  );
};

export default ProfileModal;