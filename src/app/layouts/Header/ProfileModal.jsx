import React, { useEffect } from "react";
import { X } from "lucide-react";

const ProfileModal = ({ onClose, loading, error, profile }) => {
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

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

      {/* Dialog wrapper with gradient border */}
      <div className="relative w-full md:max-w-2xl max-w-xl mx-4">
        <div className="rounded-2xl p-[1.25px] bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-amber-400 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
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

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              {!loading && !error && profile && (
                <div className="space-y-6">
                  {/* Top identity block */}
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white grid place-items-center text-lg font-semibold shadow-inner">
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
                    <div className="md:col-span-3 rounded-2xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70">
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
                          <div className="sm:col-span-2">
                            <dt className="text-xs uppercase tracking-wide text-gray-500">Password Hash</dt>
                            <dd className="mt-1 font-mono text-[11px] leading-5 break-all bg-black/5 dark:bg-white/5 rounded-lg px-3 py-2">
                              {profile.passwordHash || "—"}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>

                    {/* Right column: status card */}
                    <div className="md:col-span-2 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40 bg-emerald-50/70 dark:bg-emerald-900/10">
                      <div className="px-5 py-4 border-b border-emerald-200/60 dark:border-emerald-800/40 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                        Trạng thái
                      </div>
                      <div className="p-5">
                        <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium bg-white text-emerald-700 border border-emerald-200 shadow-sm dark:bg-transparent dark:text-emerald-300 dark:border-emerald-700/40">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]" />
                          {profile.status || "—"}
                        </span>
                        <p className="mt-4 text-xs text-emerald-800/80 dark:text-emerald-200/80">
                          Người dùng đang hoạt động. Bạn có thể cập nhật vai trò hoặc vô hiệu hoá trong trang quản trị.
                        </p>
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
    </div>
  );
};

export default ProfileModal;