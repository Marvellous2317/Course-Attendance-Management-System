import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Building2,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { OthelloLogo } from '../shared/OthelloLogo';
export const LoginPage = () => {
  const {
    login,
    setAppView,
    showToast,
    switchToAdmin,
    switchToTeacher,
    switchToStudent,
  } = useAdmin();
  const [email, setEmail] = useState('admin@othello.edu');
  const [password, setPassword] = useState(
    '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022',
  );
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      login(email, password);
      setIsSubmitting(false);
    }, 400);
  };
  const handleDemoSSO = (provider) => {
    setEmail('admin@othello.edu');
    setPassword('demopassword123');
    showToast(`Pre-filled verified credentials via ${provider} SSO`, 'info');
    setTimeout(() => {
      login('admin@othello.edu');
    }, 600);
  };
  return (
    <div
      className="min-h-screen bg-primary-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative selection:bg-secondary-500/20 selection:text-white"
      style={{
        backgroundImage:
          'linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
        backgroundSize: '36px 36px',
      }}
    >
      {/* Top Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2 z-10">
        <div
          onClick={() => setAppView('landing')}
          className="cursor-pointer group flex items-center gap-2"
          title="Return to Public Landing Page"
        >
          <OthelloLogo
            size="md"
            theme="dark"
            subtitle="COURSE MANAGEMENT SYSTEM"
          />
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">Unified Campus Gateway</span>
          </div>

          <button
            type="button"
            onClick={() => setAppView('landing')}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <span>Public Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Container Card */}
      <main className="max-w-5xl w-full mx-auto my-6 sm:my-8 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/90 text-slate-900 grid grid-cols-1 lg:grid-cols-2"
        >
          {/* Left Column: Login Form */}
          <div className="p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
            <div>
              {/* Back to website small link */}
              <button
                type="button"
                onClick={() => setAppView('landing')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors mb-4 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Home</span>
              </button>

              {/* Building Icon Badge */}
              <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 mb-6 shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>

              <h2 className="text-3xl font-black text-slate-950 tracking-tight">
                Welcome back
              </h2>
              <p className="text-sm text-slate-500 mt-1.5">
                Please enter your details to access your portal.
              </p>

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
                      className="w-full px-4 py-3 text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all pr-10"
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
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full px-4 py-3 text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all pr-10"
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
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 font-medium">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>Remember for 30 days</span>
                  </label>

                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      showToast(
                        'Password reset link dispatched to administrator email.',
                        'info',
                      );
                    }}
                    className="font-semibold text-slate-900 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </a>
                </div>

                {/* Sign In Button */}
                <motion.button
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3.5 px-4 rounded-xl bg-primary-950 hover:bg-primary-600 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>
                    {isSubmitting ? 'Authenticating Session...' : 'Sign In'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </form>

              {/* SSO Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
                  <span className="bg-white px-3">Or Continue With</span>
                </div>
              </div>

              {/* 3 Social SSO Buttons */}
              <div className="grid grid-cols-3 gap-3">
                {/* Google SSO */}
                <button
                  type="button"
                  onClick={() => handleDemoSSO('Google')}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                  title="Sign in with Google"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </button>

                {/* Microsoft SSO */}
                <button
                  type="button"
                  onClick={() => handleDemoSSO('Microsoft')}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                  title="Sign in with Microsoft"
                >
                  <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                    <span className="w-1.5 h-1.5 bg-[#f25022]" />
                    <span className="w-1.5 h-1.5 bg-[#7fba00]" />
                    <span className="w-1.5 h-1.5 bg-[#00a4ef]" />
                    <span className="w-1.5 h-1.5 bg-[#ffb900]" />
                  </div>
                </button>

                {/* Apple SSO */}
                <button
                  type="button"
                  onClick={() => handleDemoSSO('Apple')}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                  title="Sign in with Apple"
                >
                  <svg className="w-4 h-4 fill-slate-900" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.58-7.7-11.66-13.98-5.96-9.14-10.63-19.46-14.01-30.97-3.38-11.51-5.07-22.61-5.07-33.31 0-14.89 3.86-27.18 11.59-36.88 7.72-9.7 17.29-14.65 28.69-14.86 5.26 0 10.74 1.25 16.44 3.76 5.7 2.51 9.47 3.81 11.32 3.9 1.63 0 5.49-1.34 11.57-4.01 6.09-2.68 11.45-3.9 16.1-3.67 11.97.76 21.6 5.17 28.91 13.23-10.45 6.31-15.57 15.13-15.35 26.45.22 8.71 3.53 16.11 9.94 22.21 6.41 6.1 14.15 9.68 23.23 10.78-1.96 5.99-4.24 11.97-6.86 17.96zM119.22 31.84c0-7.29 2.67-14.15 8-20.57 5.34-6.42 11.92-10.5 19.76-12.27.33 1.41.49 2.72.49 3.92 0 7.3-2.73 14.28-8.19 20.93-5.45 6.64-12.14 10.58-20.06 11.81z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Auto-fill demo accounts banner */}
            <div className="mt-6 p-3 rounded-2xl bg-amber-50/90 border border-amber-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-amber-900 font-medium">
                <span className="w-2 h-2 rounded-full bg-secondary-500 shrink-0" />
                <span>
                  Click any social icon above for auto-fill demo accounts
                </span>
              </div>
              <span className="px-2 py-0.5 bg-amber-200/80 text-amber-950 font-bold text-[10px] rounded-md shrink-0">
                SSO READY
              </span>
            </div>
          </div>

          {/* Right Column: Dark Preview / Brand Showcase Panel */}
          <div className="bg-primary-950 p-6 sm:p-8 lg:p-10 flex flex-col justify-between text-white relative overflow-hidden border-t lg:border-t-0 lg:border-l border-slate-800">
            {/* Top Preview Image with Floating Badge */}
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-900 border border-slate-800 shadow-inner">
                <img
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80"
                  alt="Othello Institute Campus"
                  className="w-full h-full object-cover brightness-[0.75]"
                />

                {/* Floating Top Pill inside preview */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <div className="px-2.5 py-1 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-[10px] font-bold text-white flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-secondary-500 text-slate-950 text-[9px] font-black flex items-center justify-center">
                      O
                    </span>
                    <span>Othello Institute of Technology</span>
                  </div>

                  <span className="text-[9px] font-mono font-semibold tracking-wider text-slate-300 uppercase px-2 py-1 rounded-full bg-black/60 backdrop-blur-xs">
                    SECURE TLS • 256-BIT
                  </span>
                </div>
              </div>

              {/* Central Glowing Icon Badge */}
              <div className="pt-2 flex justify-center">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="w-16 h-16 rounded-2xl bg-secondary-500 text-slate-950 text-2xl font-black flex items-center justify-center shadow-lg shadow-amber-500/30 select-none border-2 border-amber-300/40"
                >
                  O
                </motion.div>
              </div>

              {/* Text Headline & Subtext */}
              <div className="text-center space-y-2">
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  One Gateway. <br />
                  <span className="text-secondary-500">
                    Infinite Possibilities.
                  </span>
                </h3>

                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Unified authentication automatically directs faculty,
                  students, and administrators to their tailored command spaces.
                </p>
              </div>
              {/* Direct Role Access Section */}
              <div className="mt-5 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Fast Portal Access (Prototype Mode)
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400/20 text-secondary-500 font-bold">
                    1-CLICK JUMP
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      login('admin@othello.edu');
                      switchToAdmin();
                    }}
                    className="py-2 px-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs flex flex-col items-center gap-0.5 cursor-pointer"
                  >
                    <span>🏛️ Admin UI</span>
                    <span className="text-[9px] text-indigo-200 font-normal">
                      Dean Sterling
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      login('e.vance@othello.edu');
                      switchToTeacher();
                    }}
                    className="py-2 px-2 rounded-xl bg-secondary-500 hover:bg-secondary-600 text-slate-950 text-xs font-bold transition-all shadow-xs flex flex-col items-center gap-0.5 cursor-pointer"
                  >
                    <span>👨‍🏫 Teacher UI</span>
                    <span className="text-[9px] text-slate-800 font-medium">
                      Prof. Vance
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      login('j.vance@student.othello.edu');
                      switchToStudent();
                    }}
                    className="py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs flex flex-col items-center gap-0.5 cursor-pointer"
                  >
                    <span>🎒 Student UI</span>
                    <span className="text-[9px] text-emerald-200 font-normal">
                      Julian Vance
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Matriculants Bar */}
            <div className="mt-8 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center ring-1 ring-slate-900">
                    ML
                  </div>
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-[9px] flex items-center justify-center ring-1 ring-slate-900">
                    JV
                  </div>
                  <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-[9px] flex items-center justify-center ring-1 ring-slate-900">
                    AD
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-200 block text-xs leading-none">
                    3,840 Active Matriculants
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Fall 2025 Term In Session
                  </span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                ONLINE
              </span>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Bottom Footer */}
      <footer className="max-w-5xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 py-2 z-10">
        <div>© 2025 Othello Institute of Technology. All rights reserved.</div>
        <div className="flex items-center gap-4 text-slate-400">
          <span className="hover:text-slate-200 cursor-pointer">
            Privacy Policy
          </span>
          <span>•</span>
          <span className="hover:text-slate-200 cursor-pointer">
            Terms of Governance
          </span>
          <span>•</span>
          <span className="hover:text-slate-200 cursor-pointer">
            Campus Directory
          </span>
        </div>
      </footer>
    </div>
  );
};
