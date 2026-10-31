import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  User,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useUIStore } from "../store/useUIStore";
import { useAuthStore } from "../../shared/store/useAuthStore";
import { getUserProfile } from "../../shared/api/auth";
import useAuth from "../hooks/useAuth";

// Helper to format role names ({ id: 1, name: "admin" } -> "Super Admin")
const formatRole = (r) => {
  const raw = typeof r === "object" ? r?.name : r;
  if (!raw) return "Super Admin";
  return raw.toLowerCase() === "admin"
    ? "Super Admin"
    : raw.charAt(0).toUpperCase() + raw.slice(1);
};

export const Sidebar = () => {
  const {
    sidebarCollapsed,
    toggleSidebar,
    mobileMenuOpen,
    setMobileMenuOpen,
  } = useUIStore();
  const invoices = [];
  const announcements = [];

  const { logout } = useAuth();

  const handleLogout = () => {
    logout(); // Calls clearSession(), queryClient.clear(), and navigates to /login
  };

  // ---------------------------------------------------------------------------
  // Profile Data & API Consumption
  // ---------------------------------------------------------------------------
  const { user, setUser } = useAuthStore();

  const { data: profileResponse } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getUserProfile,
    staleTime: 1000 * 60 * 5, // keep fresh for 5 minutes
  });

  // Sync latest server profile into Zustand store
  useEffect(() => {
    const profile = profileResponse?.data || profileResponse;
    if (profile && typeof profile === "object") {
      setUser({
        ...user,
        ...profile,
        role: profile.role || user?.role,
      });
    }
  }, [profileResponse]);

  // Resolve current active profile values
  const currentProfile = profileResponse?.data || profileResponse || user;
  const firstName =
    currentProfile?.firstName ||
    (currentProfile?.name ? currentProfile.name.split(" ")[0] : "");
  const lastName =
    currentProfile?.lastName ||
    (currentProfile?.name
      ? currentProfile.name.split(" ").slice(1).join(" ")
      : "");
  const fullName =
    `${firstName} ${lastName}`.trim() || currentProfile?.name || "Admin User";
  const displayRole = formatRole(currentProfile?.role);
  const initial = firstName ? firstName.charAt(0).toUpperCase() : "";

  // Close mobile drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen, setMobileMenuOpen]);

  // Close mobile drawer if resized to desktop breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileMenuOpen, setMobileMenuOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const mainNavItems = [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { path: "/admin/students", label: "Students", icon: GraduationCap },
    { path: "/admin/teachers", label: "Teachers", icon: Users },
    { path: "/admin/courses", label: "Courses", icon: BookOpen },
    // { path: "/admin/roles", label: "Roles", icon: ShieldCheck },
    { path: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const navContent = (
    <div className="flex flex-col h-full select-none bg-primary-900 [--page-bg:var(--color-slate-50)]">
      {/* Brand Header */}
      <div className="h-18 flex items-center px-4 shrink-0 justify-between relative">
        {/* Mobile Header Branding */}
        <div className="flex items-center gap-2.5 lg:hidden">
          <span className="w-2 h-2 rounded-full bg-secondary-500 animate-pulse" />
          <span className="font-semibold text-white text-sm tracking-tight">
            Admin Portal
          </span>
        </div>

        {/* Desktop Header Branding */}
        {!sidebarCollapsed && (
          <div className="hidden lg:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary-500 animate-pulse" />
            <span className="font-bold text-secondary-400 text-xs tracking-wider uppercase">
              Admin Console
            </span>
          </div>
        )}

        {/* Mobile Chevron Close Button (<<) */}
        <div className="lg:hidden ml-auto">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-lg text-primary-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center group"
            title="Close sidebar"
            aria-label="Close navigation sidebar"
          >
            <ChevronsLeft className="w-5 h-5 text-primary-200 group-hover:text-white transition-colors" />
          </motion.button>
        </div>

        {/* Collapse toggle button on desktop */}
        <div
          className={`hidden lg:block right-3 absolute ${
            sidebarCollapsed ? "justify-center px-2" : ""
          }`}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-primary-200 hover:text-secondary-400 hover:bg-white/10 transition-colors cursor-pointer"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <motion.div
              animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 pl-3 pr-0 py-6 space-y-2 overflow-y-auto">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => `
                group relative isolate w-full flex items-center gap-3 py-3 rounded-l-full text-sm font-medium transition-colors cursor-pointer
                ${sidebarCollapsed ? "justify-center px-2" : "pl-4 pr-6"}
                ${
                  isActive
                    ? "text-primary-900 font-semibold"
                    : "text-primary-200/80 hover:text-white hover:bg-white/10"
                }
              `}
              title={sidebarCollapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  {/* Sliding active tab */}
                  {isActive && (
                    <motion.span
                      layoutId="sidebarActiveIndicator"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      className="absolute inset-y-0 left-0 right-0 -z-10 rounded-l-full bg-[var(--page-bg)]"
                    >
                      <span
                        aria-hidden
                        className="hidden lg:block pointer-events-none absolute right-0 -top-5 size-5 [background:radial-gradient(circle_at_0_0,transparent_19px,var(--page-bg)_20px)]"
                      />
                      <span
                        aria-hidden
                        className="hidden lg:block pointer-events-none absolute right-0 -bottom-5 size-5 [background:radial-gradient(circle_at_0_100%,transparent_19px,var(--page-bg)_20px)]"
                      />
                    </motion.span>
                  )}

                  <Icon
                    className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      isActive
                        ? "text-primary-900"
                        : "text-primary-200/80 group-hover:text-white"
                    }`}
                  />

                  <AnimatePresence initial={false}>
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.18 }}
                        className="flex-1 text-left whitespace-nowrap overflow-hidden text-sm"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {!sidebarCollapsed && isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary-500 shrink-0 ml-auto" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer / User Profile & Logout */}
      <div className="p-3 border-t border-white/10 shrink-0 space-y-2">
        <div
          className={`flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/10 ${
            sidebarCollapsed ? "justify-center" : ""
          }`}
        >
          {/* Settings-style Initials Avatar with Online Badge */}
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200/70 flex items-center justify-center text-primary-900 font-bold text-xs ring-1 ring-secondary-500/30 shrink-0 shadow-xs">
              {initial ? (
                initial
              ) : (
                <User className="w-4 h-4 text-primary-900" />
              )}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-primary-950" />
          </div>

          {/* Dynamic Full Name & Role */}
          {!sidebarCollapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span
                className="text-xs font-bold text-white truncate"
                title={fullName}
              >
                {fullName}
              </span>
              <span
                className="text-[10px] text-secondary-400 font-semibold truncate flex items-center gap-1"
                title={displayRole}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-secondary-500" />
                {displayRole}
              </span>
            </div>
          )}

          {/* Logout Button */}
          {!sidebarCollapsed && (
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-primary-200 hover:text-rose-300 hover:bg-white/10 transition-colors cursor-pointer"
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
      {/* Mobile Floating Drawer Trigger Button */}
      <AnimatePresence>
        {!mobileMenuOpen && (
          <motion.button
            key="mobile-sidebar-toggle-btn"
            initial={{ opacity: 0, scale: 0.85, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.85, x: -10 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMobileMenuOpen(true)}
            className="fixed top-4 left-4 z-40 lg:hidden p-2.5 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-slate-200/90 text-primary-900 hover:text-secondary-500 hover:bg-slate-50 hover:shadow-lg transition-all duration-200 flex items-center justify-center cursor-pointer group"
            title="Open navigation"
            aria-label="Open navigation sidebar"
          >
            <ChevronsRight className="w-5 h-5 text-primary-900 group-hover:text-secondary-500 transition-transform group-hover:translate-x-0.5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Desktop Animated Sidebar */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 80 : 260 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
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
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
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

export default Sidebar;
