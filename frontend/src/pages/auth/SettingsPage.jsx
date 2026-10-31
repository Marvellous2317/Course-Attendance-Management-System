import { useState, useEffect } from "react";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  AlertCircle,
  Loader2,
  Shield,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../shared/hooks/useAuth";
import { useAuthStore } from "../../shared/store/useAuthStore";
import { getUserProfile } from "../../shared/api/auth";
import useToast from "../../shared/hooks/useToast";

// Helper to format role names ({ id: 1, name: "admin" } -> "Super Admin")
const formatRole = (r) => {
  const raw = typeof r === "object" ? r?.name : r;
  if (!raw) return "Super Admin";
  return raw.toLowerCase() === "admin"
    ? "Super Admin"
    : raw.charAt(0).toUpperCase() + raw.slice(1);
};

export default function SettingsPage() {
  const { logout, changePassword, isChangingPassword } = useAuth();
  const { user, setUser } = useAuthStore();
  const { showSuccess, showError } = useToast();

  // ---------------------------------------------------------------------------
  // 1. Initial State from useAuthStore (Instant values on page enter)
  // ---------------------------------------------------------------------------
  const initialFirstName =
    user?.firstName || (user?.name ? user.name.split(" ")[0] : "");
  const initialLastName =
    user?.lastName ||
    (user?.name ? user.name.split(" ").slice(1).join(" ") : "");

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [email, setEmail] = useState(user?.email || "");
  const [role, setRole] = useState(formatRole(user?.role));
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // ---------------------------------------------------------------------------
  // 2. Fetch Latest Profile from /api/profile
  // ---------------------------------------------------------------------------
  const { data: profileResponse, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getUserProfile,
  });

  // ---------------------------------------------------------------------------
  // 3. Keep Inputs & Store Synced with Server Profile
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const profile = profileResponse?.data || profileResponse;
    if (profile) {
      if (profile.firstName) setFirstName(profile.firstName);
      if (profile.lastName) setLastName(profile.lastName);
      if (profile.email) setEmail(profile.email);
      if (profile.role) setRole(formatRole(profile.role));

      // Update Zustand store using setUser
      setUser({
        ...user,
        ...profile,
        role: profile.role || user?.role,
      });
    }
  }, [profileResponse]);

  // ---------------------------------------------------------------------------
  // Password State
  // ---------------------------------------------------------------------------
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleLogout = () => {
    logout(); // Calls clearSession(), queryClient.clear(), and navigates to /login
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      if (user) {
        setUser({
          ...user,
          firstName,
          lastName,
        });
      }
      showSuccess("Profile details updated successfully");
    } catch (err) {
      console.error("Error updating profile:", err);
      showError("Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordDataChange = (event) => {
    const { name, value } = event.target;
    setPasswordError("");
    setChangePasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError("");

    if (!changePasswordData.currentPassword) {
      setPasswordError("Please enter your current password");
      showError("Please enter your current password");
      return;
    }

    if (changePasswordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      showError("New password must be at least 6 characters");
      return;
    }

    if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
      setPasswordError("New password and confirm password do not match");
      showError("New password and confirm password do not match");
      return;
    }

    try {
      await changePassword({
        currentPassword: changePasswordData.currentPassword,
        newPassword: changePasswordData.newPassword,
      });

      setChangePasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      // Handled in mutation onError
    }
  };

  return (
    <div className="min-h-full p-2 sm:p-4 lg:p-6 rounded-3xl">
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
          {/* User Profile Banner Card */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-50 border border-indigo-200/70 flex items-center justify-center text-indigo-700 shadow-xs shrink-0 font-bold text-xl sm:text-2xl">
                {firstName ? (
                  firstName.charAt(0).toUpperCase()
                ) : (
                  <User className="w-7 h-7 sm:w-8 sm:h-8" />
                )}
              </div>
              
            </div>

            {/* Logout Button (desktop only — mobile uses the sidebar menu) */}
            <button
              type="button"
              onClick={handleLogout}
              className="hidden sm:flex px-4 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs hover:shadow-md transition-all items-center gap-2 cursor-pointer shrink-0"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Profile Form: First Name, Last Name, Role, Email */}
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-1">
              {/* First Name Input */}
              <div>
                <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                  First Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={firstName}
                    readOnly
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    className="w-full bg-slate-100/90 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-500 font-semibold shadow-xs cursor-not-allowed select-none"
                  />
                </div>
              </div>

              {/* Last Name Input */}
              <div>
                <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                  Last Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={lastName}
                    readOnly
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    className="w-full bg-slate-100/90 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-500 font-semibold shadow-xs cursor-not-allowed select-none"
                  />
                </div>
              </div>

              {/* Role (Read-only) */}
              <div>
                <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                  Role
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={role}
                    disabled
                    readOnly
                    className="w-full bg-slate-100/90 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-500 font-semibold shadow-xs cursor-not-allowed select-none"
                  />
                  <Shield className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Email (Non-editable) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                    Email Address
                  </label>
                  <span className="text-[10px] font-semibold text-slate-400">
                    Read-only
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    disabled
                    readOnly
                    placeholder="admin@school.edu"
                    className="w-full bg-slate-100/90 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-500 font-medium shadow-xs cursor-not-allowed select-none pr-10"
                    title="Email cannot be changed"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Profile Save Changes Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSavingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </form>

          {/* Change Password Section */}
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
                      name="currentPassword"
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
                      name="newPassword"
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
                      name="confirmPassword"
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

              {/* Change Password Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-indigo-400" />
                      <span>Change Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}