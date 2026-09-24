import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  CalendarDays,
  CreditCard,
  BellRing,
  Settings,
  ChevronLeft,
  LogOut,
  Globe,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import Images from '../../../public/images/images';

export const Sidebar = () => {
  const {
    activeTab,
    setActiveTab,
    sidebarCollapsed,
    toggleSidebar,
    mobileMenuOpen,
    setMobileMenuOpen,
    invoices,
    announcements,
    logout,
    setAppView,
    currentUser,
  } = useAdmin();

  const pendingInvoicesCount = invoices.filter(
    (i) => i.status === 'Pending' || i.status === 'Overdue',
  ).length;
  const urgentAnnouncementsCount = announcements.filter(
    (a) => a.priority === 'Urgent',
  ).length;

  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'teachers', label: 'Faculty & Staff', icon: Users },
    { id: 'courses', label: 'Courses & Catalog', icon: BookOpen },
    { id: 'schedules', label: 'Timetable & Rooms', icon: CalendarDays },
    {
      id: 'finances',
      label: 'Tuition & Fees',
      icon: CreditCard,
      badge: pendingInvoicesCount > 0 ? pendingInvoicesCount : void 0,
    },
    {
      id: 'announcements',
      label: 'Notice Board',
      icon: BellRing,
      badge: urgentAnnouncementsCount > 0 ? urgentAnnouncementsCount : void 0,
    },
    { id: 'settings', label: 'Institution Settings', icon: Settings },
  ];

  const navContent = (
    // --page-bg MUST match the background of your main content area.
    // The active tab and its curves are painted with this colour so they
    // look like they "grow out of" the page.
    <div className="flex flex-col h-full select-none bg-primary-900 [--page-bg:var(--color-slate-50)]">
      {/* Brand Header */}
      <div className="h-18 flex items-center px-4 shrink-0 justify-between">
        {/* Collapse toggle button on desktop */}
        <div className={`hidden lg:block right-3 absolute ${sidebarCollapsed ? 'justify-center px-2' : ''}`}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
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

      {/* Navigation Links
          - pl-3 pr-0: items must touch the RIGHT edge so the tab can merge with the page
          - py-6: room for the 20px curves above the first / below the last item */}
      <div className="flex-1 pl-3 pr-0 py-6 space-y-2 overflow-y-auto">
        {mainNavItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              // `isolate` keeps the indicator's -z-10 inside this button,
              // so it can't slip behind the sidebar's background.
              className={`
                group relative isolate w-full flex items-center gap-3 py-3 rounded-l-full text-sm font-medium transition-colors cursor-pointer
                ${sidebarCollapsed ? 'justify-center px-2' : 'pl-4 pr-6'}
                ${isActive ? 'text-primary-900 font-semibold' : 'text-primary-200/80 hover:text-white hover:bg-white/10'}
              `}
              title={sidebarCollapsed ? item.label : void 0}
            >
              {/* Sliding active tab: page-coloured pill + two concave corners */}
              {isActive && (
                <motion.span
                  layoutId="sidebarActiveIndicator"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  className="absolute inset-y-0 left-0 right-0 -z-10 rounded-l-full bg-[var(--page-bg)]"
                >
                  {/* Top curve: sits just above the tab, on the sidebar's right edge */}
                  <span
                    aria-hidden
                    className="hidden lg:block pointer-events-none absolute right-0 -top-5 size-5 [background:radial-gradient(circle_at_0_0,transparent_19px,var(--page-bg)_20px)]"
                  />
                  {/* Bottom curve: mirror image, just below the tab */}
                  <span
                    aria-hidden
                    className="hidden lg:block pointer-events-none absolute right-0 -bottom-5 size-5 [background:radial-gradient(circle_at_0_100%,transparent_19px,var(--page-bg)_20px)]"
                  />
                </motion.span>
              )}

              <Icon
                className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-primary-900' : 'text-primary-200/80 group-hover:text-white'}`}
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

              {/* Badge indicator */}
              {!sidebarCollapsed && item.badge !== void 0 && (
                <span
                  className={`ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded-full ${isActive ? 'bg-primary-900/10 text-primary-900' : 'bg-white/15 text-white'}`}
                >
                  {item.badge}
                </span>
              )}

              {/* Collapsed dot badge */}
              {sidebarCollapsed && item.badge !== void 0 && (
                <span className="absolute top-2 right-3 w-2 h-2 rounded-full bg-fuchsia-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer / User Profile & Navigation Out */}
      <div className="p-3 border-t border-white/10 shrink-0 space-y-2">


        {/* User Card */}
        <div
          className={`flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/10 ${sidebarCollapsed ? 'justify-center' : ''}`}
        >
          <div className="relative shrink-0">
            <img
              src={
                currentUser?.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
              }
              alt="Admin Profile"
              className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/20"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-purple-950" />
          </div>

          {!sidebarCollapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-white truncate">
                {currentUser?.name || 'Dean Sterling'}
              </span>
              <span className="text-[10px] text-purple-300 truncate">
                Super Administrator
              </span>
            </div>
          )}

          {!sidebarCollapsed && (
            <button
              type="button"
              onClick={logout}
              className="p-1.5 rounded-lg text-purple-300 hover:text-rose-300 hover:bg-white/10 transition-colors cursor-pointer"
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
      {/* Desktop Animated Sidebar
          No border-r / shadow: any line on the right edge would cut the tab off from the page. */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 80 : 260 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="hidden lg:block h-screen sticky top-0 bg-purple-950 z-30 shrink-0 overflow-hidden"
      >
        {navContent}
      </motion.aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            {/* Off-canvas menu */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="relative w-72 max-w-[85vw] h-full bg-purple-950 shadow-2xl z-10"
            >
              {navContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};