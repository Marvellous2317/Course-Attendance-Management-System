import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import Images from "../../../public/images/images";

const currentYear = new Date().getFullYear();

export const LoginPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const { login, setAppView } = useAdmin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      login(email, password);
      setIsSubmitting(false);
    }, 400);
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
            <img src={Images.logo} className="object-contain h-12 sm:h-16" alt="Othello Logo" />
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
            <span>Course & Attendance Management System</span>
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
          {/* Left Column: Login Form */}
          <div className="p-5 sm:p-8 lg:p-12 flex flex-col justify-center items-center h-full">
            <div className="w-full max-w-md">
              {/* Back to website link */}
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-950 transition-colors mb-6 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <div>
                <h2 className="text-3xl font-black text-slate-950 tracking-tight">
                  Welcome back
                </h2>
                <p className="text-sm text-slate-500 mt-1.5">
                  Please enter your details to access your portal.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full px-4 py-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all pr-10"
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

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => navigate("/change-password")}
                    className="font-semibold text-slate-700 hover:text-slate-950 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Sign In Button */}
                <motion.button
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3.5 px-4 rounded-xl bg-secondary-500 hover:bg-secondary-600 text-slate-950 font-extrabold text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>
                    {isSubmitting ? "Authenticating Session..." : "Sign In"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </form>

              {/* Register Link */}
              <div className="text-center pt-4 border-t border-slate-100 mt-6">
                <p className="text-xs text-slate-500">
                  Don't have an institutional account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer ml-1"
                  >
                    Create an account
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
        <div>© {currentYear} Othello Institute of Technology. All rights reserved.</div>
      </footer>
    </div>
  );
};
