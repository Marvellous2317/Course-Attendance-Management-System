import { useState } from "react";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  Check,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../shared/hooks/useAuth";
import { useAuthStore } from "../../shared/store/useAuthStore";
import { changePassword as changePasswordApi } from "../../shared/api/auth";
import { useQueryClient } from '@tanstack/react-query';
import useToast from "../../shared/hooks/useToast";

export const SettingsPage = () => {

  const { logout: authLogout } = useAuth();
  const { user, clearAuth } = useAuthStore();
  const { showSuccess, showError } = useToast();

  const queryClient = useQueryClient();

  // Profile fields: name, role, and email
  const [name, setName] = useState(
    // user?.name || currentUser?.name || "Dean Katherine Sterling"
  );
  const [role, setRole] = useState(
    user?.role
      ? user.role === "admin"
        ? "Super Admin"
        : user.role
      : currentUser?.title || currentUser?.role || "Super Admin"
  );
  const [email, setEmail] = useState(
    user?.email || currentUser?.email || "admin@othello.edu"
  );

  // Password fields
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

    const { changePassword, isChangingPassword } = useAuth();

  const handleLogout = async () => {

    clearAuth();
    // clearAllCaches();
    queryClient.clear();
  };
  const handleProfileSave = (e) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      // Persist profile updates in auth store
      if (user && setAuth) {
        setAuth({ ...user, name, role, email }, token);
      }
      showToast("Profile details updated successfully", "success");
    } catch (err) {
      console.error("Error updating profile:", err);
      showToast("Failed to update profile", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordDataChange = (event) => {
    const { name, value } = event.target;
    setChangePasswordData((prev) => ({
      ...prev,
      [name]: value?.trim(),
    }));
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
      showError('New password and confirm password do not match');
      return;
    }
    await changePassword(changePasswordData);
  };

  return (
    <div className="min-h-full bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] bg-slate-100/60 p-2 sm:p-4 lg:p-6 rounded-3xl">
      {/* Outer Floating Card Container */}
      <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xl p-5 sm:p-8 lg:p-10 max-w-6xl mx-auto space-y-8">
        {/* Top Header Bar */}
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-2">
            <div className="max-w-2xl">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
                Settings & System Governance
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                Manage administrative profile details, system credentials, and authentication standards.
              </p>
            </div>
          </div>
        </div>

        {/* Main Inner Section Card */}
        <div className="bg-[#f8fafc] border border-slate-200/80 rounded-[2rem] p-5 sm:p-8 space-y-8 shadow-xs">
          {/* User Profile Banner Card with Icon and Red Logout Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-50 border border-indigo-200/70 flex items-center justify-center text-indigo-700 shadow-xs shrink-0">
                <User className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>

            </div>

            {/* Red Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Profile Form: Name, Role, Email with its own Save button at the bottom of these fields */}
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-1">
              {/* Name */}
              <div>
                <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                  Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter name"
                    disabled
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 font-medium shadow-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                  Role
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Enter role"
                    disabled
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 font-medium shadow-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    disabled
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 font-medium shadow-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Button directly at the bottom of the name, role, and email fields */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {/* <Check className="w-4 h-4 text-emerald-400" /> */}
                <span>{isSavingProfile ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </form>

          {/* Change Password Section - White Card within the main card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-7 shadow-xs">
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-700 shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Change Password
                  </h2>
                  <p className="text-xs text-slate-500">
                    Update your password to keep your administrator account secure
                  </p>
                </div>
              </div>

              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Current Password */}
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={changePasswordData.currentPassword}
                      onChange={handlePasswordDataChange}
                      placeholder="Current password"
                      className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 font-medium shadow-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={changePasswordData.newPassword}
                      onChange={handlePasswordDataChange}
                      placeholder="New password"
                      className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 font-medium shadow-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={changePasswordData.confirmPassword}
                      onChange={handlePasswordDataChange}
                      placeholder="Confirm password"
                      className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 font-medium shadow-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Section's Own Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {/* <Lock className="w-4 h-4 text-indigo-400" /> */}
                  <span>{isChangingPassword ? "Updating..." : "Change Password"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
