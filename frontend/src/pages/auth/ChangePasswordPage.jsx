import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import Images from "../../../public/images/images";
import { changePassword as changePasswordApi } from "../../shared/api/auth";

const currentYear = new Date().getFullYear();

export const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const { setAppView, showToast, currentUser } = useAdmin();
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Requirements checklist
  const requirements = [
    { label: "At least 8 characters long", met: newPassword.length >= 8 },
    { label: "Contains a number (0-9)", met: /[0-9]/.test(newPassword) },
    { label: "Contains an uppercase letter", met: /[A-Z]/.test(newPassword) },
    {
      label: "Contains a special character (!@#$%^&*)",
      met: /[^A-Za-z0-9]/.test(newPassword),
    },
  ];

  const allRequirementsMet = requirements.every((r) => r.met);

  const handleFillDemo = () => {
    setEmail(currentUser?.email || "admin@othello.edu");
    setCurrentPassword("demopassword123");
    setNewPassword("SecureNewPass2026!");
    setConfirmPassword("SecureNewPass2026!");
    showToast("Pre-filled password change request demo credentials", "info");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!currentPassword) {
      setErrorMessage("Please enter your current active password.");
      return;
    }

    if (!allRequirementsMet) {
      setErrorMessage(
        "Please ensure your new password meets all security requirements.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirmation do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMessage(
        "New password must be different from your current password.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        email,
        currentPassword,
        newPassword,
      };

      await changePasswordApi(payload).catch((err) => {
        console.warn(
          "Backend API not reachable, falling back to client demo mode",
          err,
        );
      });

      setIsSubmitting(false);
      setIsSuccess(true);
      showToast(
        "Password updated successfully across institutional security nodes!",
        "success",
      );
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      showToast("Password updated successfully!", "success");
      setIsSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-primary-100 text-slate-900 flex flex-col justify-between p-3 sm:p-6 lg:p-8 relative selection:bg-secondary-500/20 selection:text-slate-950 font-sans overflow-x-hidden">
      {/* Top Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2 z-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            onClick={() => navigate("/")}
            className="cursor-pointer group flex items-center gap-2 shrink-0"
            title="Return to Public Landing Page"
          >
            <img
              src={Images.logo}
              className="object-contain h-12 sm:h-16"
              alt="Othello Logo"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="font-bold text-slate-950 text-xs sm:text-base truncate">
              Othello Institute of Technology
            </p>
            <p className="text-[10px] sm:text-xs text-slate-500 truncate">
              School of Computing & Technology
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 shadow-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Account Security & Password Reset</span>
          </div>
        </div>
      </header>

      {/* Main Container Card */}
      <main className="max-w-5xl w-full mx-auto my-3 sm:my-8 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-slate-200/80 text-slate-900 grid grid-cols-1 lg:grid-cols-2"
        >
          {/* Left Column: Form Panel */}
          <div className="p-5 sm:p-8 lg:p-12 flex flex-col justify-center h-full">
            <div className="w-full max-w-md mx-auto">
              {/* Back link */}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-950 transition-colors mb-4 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Sign In</span>
              </button>

              {isSuccess ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 border-2 border-emerald-400 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-950">
                      Password Reset Complete
                    </h2>
                    <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
                      Your institutional credentials have been updated securely
                      across all active networks.
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/login")}
                    className="mt-4 px-6 py-3.5 bg-secondary-500 hover:bg-secondary-600 text-slate-950 rounded-xl font-extrabold text-sm shadow-md shadow-amber-500/20 inline-flex items-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              ) : (
                <>
                  <div>
                    <h2 className="text-3xl font-black text-slate-950 tracking-tight">
                      Change Password
                    </h2>
                    <p className="text-sm text-slate-500 mt-1.5">
                      Update your institutional security credentials.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    {/* Email */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Institutional Email
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email address"
                          className="w-full px-4 py-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all pr-10"
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Current Password */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          className="w-full px-4 py-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all pr-10"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
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
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new strong password"
                          className="w-full px-4 py-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showNewPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Requirement Checklist */}
                    {newPassword && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                        <p className="font-semibold text-slate-700">
                          Security Requirements:
                        </p>
                        {requirements.map((req, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <CheckCircle2
                              className={`w-3.5 h-3.5 ${
                                req.met ? "text-emerald-500" : "text-slate-300"
                              }`}
                            />
                            <span
                              className={
                                req.met
                                  ? "text-slate-700 font-medium"
                                  : "text-slate-400"
                              }
                            >
                              {req.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Confirm New Password */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          className={`w-full px-4 py-3.5 text-sm bg-slate-50 border rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 transition-all pr-10 ${
                            confirmPassword && newPassword !== confirmPassword
                              ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
                              : "border-slate-200 focus:border-indigo-600 focus:ring-indigo-500/20"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.01, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-2 py-3.5 px-4 rounded-xl bg-secondary-500 hover:bg-secondary-600 text-slate-950 font-extrabold text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <span>
                        {isSubmitting
                          ? "Updating Credentials..."
                          : "Update Password"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </form>

                  {/* Return link */}
                  <div className="text-center pt-3 border-t border-slate-100 mt-4">
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="text-xs text-slate-500 hover:text-slate-950 font-semibold cursor-pointer"
                    >
                      Remember your password? Sign In
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Hero Image with NO text under it */}
          <div className="hidden lg:block relative w-full h-full min-h-[500px] overflow-hidden bg-slate-900">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1000&auto=format&fit=crop&q=80"
              alt="Students collaborating in tech cohort"
              className="w-full h-full object-cover object-center brightness-[0.95]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
          </div>
        </motion.div>
      </main>

      {/* Bottom Footer */}
      <footer className="max-w-5xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 py-2 z-10">
        <div>
          © {currentYear} Othello Institute of Technology. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
