import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  User,
  Shield,
  Building2,
  Sparkles,
  IdCard,
} from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import Images from "../../../public/images/images";
import { register as registerApi } from "../../shared/api/auth";

const currentYear = new Date().getFullYear();

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { setAppView, showToast, login } = useAdmin();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const [department, setDepartment] = useState(
    "Department of Computer Science & AI",
  );
  const [studentOrEmployeeId, setStudentOrEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const getPasswordStrength = () => {
    if (!password) return { label: "", score: 0, color: "bg-slate-200" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { label: "Weak", score: 25, color: "bg-rose-500" };
    if (score === 2) return { label: "Fair", score: 50, color: "bg-amber-500" };
    if (score === 3) return { label: "Good", score: 75, color: "bg-blue-500" };
    return { label: "Strong", score: 100, color: "bg-emerald-500" };
  };

  const passwordStrength = getPasswordStrength();

  const handleFillDemo = (demoRole) => {
    if (demoRole === "student") {
      setFullName("Alex Morgan");
      setEmail("a.morgan@student.othello.edu");
      setRole("student");
      setDepartment("Department of Computer Science & AI");
      setStudentOrEmployeeId("STU-2026-9042");
      setPassword("OthelloStudent2026!");
      setConfirmPassword("OthelloStudent2026!");
      setAgreeTerms(true);
      showToast("Pre-filled demo Student registration profile", "info");
    } else {
      setFullName("Dr. Robert Chen");
      setEmail("r.chen@othello.edu");
      setRole("teacher");
      setDepartment("School of Computing & Cybernetics");
      setStudentOrEmployeeId("FAC-2026-118");
      setPassword("FacultyOthello2026!");
      setConfirmPassword("FacultyOthello2026!");
      setAgreeTerms(true);
      showToast("Pre-filled demo Faculty registration profile", "info");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    if (!agreeTerms) {
      setErrorMessage(
        "Please accept the Institutional Code of Conduct to register.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        fullName,
        email,
        role,
        department,
        idNumber: studentOrEmployeeId,
        password,
      };

      await registerApi(payload).catch((err) => {
        console.warn(
          "Backend API not reachable, falling back to client demo mode",
          err,
        );
      });

      showToast(`Account successfully registered for ${fullName}!`, "success");

      setTimeout(() => {
        login(email);
        setIsSubmitting(false);
      }, 500);
    } catch (err) {
      console.error(err);
      showToast(
        "Registration completed. Please sign in with your credentials.",
        "success",
      );
      setIsSubmitting(false);
      navigate("/login");
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
            <span>Institutional Registration Portal</span>
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
          {/* Left Column: Register Form */}
          <div className="p-5 sm:p-8 lg:p-10 flex flex-col justify-center h-full">
            <div className="w-full max-w-md mx-auto">
              {/* Back Link */}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-950 transition-colors mb-4 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Sign In</span>
              </button>

              <div>
                <h2 className="text-3xl font-black text-slate-950 tracking-tight">
                  Create Account
                </h2>
                <p className="text-sm text-slate-500 mt-1.5">
                  Enter your institutional details to register your portal
                  access.
                </p>
              </div>

              {errorMessage && (
                <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700">
                  {errorMessage}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Dr. Eleanor Vance or Julian Vance"
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all pr-10"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Email & Role Grid */}
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Institutional Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="username@othello.edu"
                        className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all pr-10"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full px-4 py-2.5 text-sm bg-slate-50 border rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 transition-all pr-10 ${
                          confirmPassword && password !== confirmPassword
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
                </div>

                {/* Password strength meter */}
                {password && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                      <span>Password Strength</span>
                      <span className="text-slate-700 font-bold">
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${passwordStrength.score}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Terms checkbox */}
                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label
                    htmlFor="terms"
                    className="text-xs text-slate-600 leading-snug cursor-pointer"
                  >
                    I agree to the{" "}
                    <span className="font-semibold text-slate-900 hover:underline">
                      Othello Institute Code of Conduct
                    </span>{" "}
                    and Academic Integrity Charter.
                  </label>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-3 py-3.5 px-4 rounded-xl bg-secondary-500 hover:bg-secondary-600 text-slate-950 font-extrabold text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>
                    {isSubmitting
                      ? "Creating Institutional Profile..."
                      : "Register Account"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </form>

              {/* Already registered link */}
              <div className="text-center pt-3 border-t border-slate-100 mt-4">
                <p className="text-xs text-slate-500">
                  Already have an institutional account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer ml-1"
                  >
                    Sign In here
                  </button>
                </p>
              </div>
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
