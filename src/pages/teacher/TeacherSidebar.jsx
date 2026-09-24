import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  Settings,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
export const TeacherSidebar = () => {
  const {
    teacherTab,
    setTeacherTab,
    sidebarCollapsed,
    toggleSidebar,
    mobileMenuOpen,
    setMobileMenuOpen,
    currentUser,
    logout,
    switchToAdmin,
    switchToStudent,
    setAppView,
  } = useAdmin();
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: CalendarCheck,
      badge: 'Live',
    },
    { id: 'schedule', label: 'Class Schedule', icon: CalendarDays },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];
  const content = (
    <div className="flex flex-col h-full select-none bg-primary-900 text-slate-100">
      {/* Brand Header */}
      <div className="h-18 flex items-center px-4 border-b border-slate-800/80 shrink-0 justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          {sidebarCollapsed ? (
            <div className="w-9 h-9 rounded-xl bg-secondary-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-md shadow-amber-500/20 shrink-0 select-none">
              O
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-secondary-500 text-slate-950 font-black flex items-center justify-center text-xs shadow-md shadow-amber-500/20 shrink-0 select-none">
                O
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-white leading-tight">
                  Othello Institute
                </span>
                <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase truncate">
                  Faculty Portal
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <div className="hidden lg:block">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <motion.div
              animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Academic Term Indicator Pill */}
      {!sidebarCollapsed && (
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] font-semibold text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary-500" />
              <span className="text-slate-400 uppercase tracking-wider text-[10px]">
                Academic Term
              </span>
            </div>
            <span className="font-bold text-white font-mono">2025-A</span>
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <div className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = teacherTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setTeacherTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`
                group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer
                ${isActive ? 'bg-white text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}
                ${sidebarCollapsed ? 'justify-center px-2' : ''}
              `}
              title={sidebarCollapsed ? item.label : void 0}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-105 ${isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-white'}`}
              />

              <AnimatePresence initial={false}>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.18 }}
                    className="flex-1 text-left whitespace-nowrap overflow-hidden text-sm"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Live Badge */}
              {!sidebarCollapsed && item.badge && (
                <span
                  className={`ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded-md ${isActive ? 'bg-secondary-500 text-slate-950' : 'bg-amber-500/20 text-secondary-500'}`}
                >
                  {item.badge}
                </span>
              )}

              {/* Collapsed dot badge */}
              {sidebarCollapsed && item.badge && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-secondary-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Profile & Switcher */}
      <div className="p-3 border-t border-slate-800/80 shrink-0 space-y-2">
        {/* Profile Card */}
        <div
          className={`flex items-center gap-3 p-2 rounded-xl bg-slate-900/80 border border-slate-800 ${sidebarCollapsed ? 'justify-center' : ''}`}
        >
          <div className="relative shrink-0">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
              alt="Dr. Eleanor Vance"
              className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-primary-900" />
          </div>

          {!sidebarCollapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-white truncate">
                Dr. Eleanor Vance
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                Faculty • Senior
              </span>
            </div>
          )}

          {!sidebarCollapsed && (
            <button
              type="button"
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 80 : 260 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="hidden lg:block h-screen sticky top-0 bg-primary-900 border-r border-slate-800 shadow-xl z-30 shrink-0 overflow-hidden"
      >
        {content}
      </motion.aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="relative w-72 max-w-[85vw] h-full bg-primary-900 shadow-2xl z-10"
            >
              {content}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
