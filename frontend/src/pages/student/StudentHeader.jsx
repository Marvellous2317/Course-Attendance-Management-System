import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Bell, Menu, Radio, ShieldCheck } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
export const StudentHeader = ({ onOpenMobileMenu, onOpenQuickScan }) => {
  const { showToast } = useAdmin();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const notifications = [
    {
      id: 'notif-1',
      title: 'CS-401 Lecture Starting in 40m',
      desc: 'Amphitheater L-102 \u2022 Turnstile ingress #4 is open and ready.',
      time: '10m ago',
      urgent: true,
    },
    {
      id: 'notif-2',
      title: 'Registration Window Term 2025-A',
      desc: '4.0 credits remaining for elective enrollment.',
      time: '2h ago',
    },
    {
      id: 'notif-3',
      title: 'Audit Ledger Re-Keyed',
      desc: 'Turnstile DESFire EV3 cryptokeys rotated successfully.',
      time: '1d ago',
    },
  ];
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search registered courses, syllabi, notes..."
            className="w-full pl-10 pr-12 py-2 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200/90 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500 transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-semibold text-slate-400 bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-2xs pointer-events-none">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Badges & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
        {/* SSO Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-slate-600 bg-slate-100/90 border border-slate-200/70">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>SSO CONNECTED</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-800">TERM 2025-A</span>
        </div>

        {/* RFID Quick Tap Badge */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            if (onOpenQuickScan) {
              onOpenQuickScan();
            } else {
              showToast(
                'RFID Turnstile Token #8841 Active & Authenticated',
                'success',
              );
            }
          }}
          className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-primary-900 text-secondary-500 border border-slate-800 shadow-xs cursor-pointer"
        >
          <Radio className="w-3.5 h-3.5 text-secondary-500 animate-pulse" />
          <span>ID #8841-RFID</span>
        </motion.button>

        {/* Notification Bell */}
        <div className="relative">
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setNotificationsOpen((prev) => !prev);
              if (!notificationsOpen && unreadCount > 0) {
                setUnreadCount(0);
              }
            }}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary-500 rounded-full ring-2 ring-white" />
            )}
          </motion.button>

          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.96 }}
                className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-xl p-4 z-50 space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Student Telemetry & Alerts
                  </span>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> All systems nominal
                  </span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-xl border text-xs transition-colors ${item.urgent ? 'bg-amber-50/80 border-amber-200/80 text-amber-950' : 'bg-slate-50 border-slate-100 text-slate-800'}`}
                    >
                      <div className="flex items-center justify-between">
                        <strong className="font-bold">{item.title}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200">
          <img
            src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256"
            alt="Julian Vance-Hayes"
            className="w-8 h-8 rounded-full object-cover border border-slate-200 ring-2 ring-secondary-500/20"
          />
          <div className="hidden xl:block text-left leading-tight">
            <div className="text-xs font-bold text-slate-900">
              Julian Vance-Hayes
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              Class of 2026
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
