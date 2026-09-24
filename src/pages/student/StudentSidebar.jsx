import { motion } from 'motion/react';
import {
  LayoutDashboard,
  BookOpen,
  UserPlus,
  CalendarCheck,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { OthelloLogo } from '../../components/shared/OthelloLogo';
import { useAdmin } from '../../context/AdminContext';
export const StudentSidebar = ({
  activeTab,
  setActiveTab,
  mobileOpen,
  setMobileOpen,
}) => {
  const { logout, showToast } = useAdmin();
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses', label: 'Your Courses', icon: BookOpen },
    { id: 'enrollment', label: 'Enrollment', icon: UserPlus, badge: 'Open' },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];
  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
        fixed top-0 bottom-0 left-0 z-50
        w-64 bg-primary-900 text-slate-300
        border-r border-slate-800/80
        flex flex-col justify-between
        transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        {/* Logo & Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary-500 flex items-center justify-center text-slate-950 shadow-md shadow-secondary-500/20 shrink-0">
              <OthelloLogo className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-white leading-tight">
                Othello Institute
              </div>
              <div className="text-[10px] font-bold text-secondary-500 tracking-wider uppercase">
                STUDENT PORTAL
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                type="button"
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold
                  transition-all duration-200 cursor-pointer relative
                  ${isActive ? 'bg-white/10 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${isActive ? 'text-secondary-500' : 'text-slate-400'}`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-secondary-500/20 text-secondary-500 border border-secondary-500/30">
                    {item.badge}
                  </span>
                )}

                {isActive && (
                  <motion.div
                    layoutId="activeStudentIndicator"
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-secondary-500 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Bottom Student Profile Card */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256"
                  alt="Julian Vance-Hayes"
                  className="w-9 h-9 rounded-full object-cover border border-slate-700 ring-2 ring-secondary-500/30"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-primary-900" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  Julian Vance-Hayes
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  j.vancehayes@othello.edu
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              title="Sign Out"
              aria-label="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px]">
            <span className="px-2 py-0.5 rounded-full font-bold bg-secondary-500/20 text-secondary-500 border border-secondary-500/40 tracking-wider uppercase">
              STUDENT
            </span>
            <button
              type="button"
              onClick={() =>
                showToast('DESFire EV3 Key #8841-RFID authenticated.', 'info')
              }
              className="text-slate-400 hover:text-slate-300 font-mono flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              #8841-RFID
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
