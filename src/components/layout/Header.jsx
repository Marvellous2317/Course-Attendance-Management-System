import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  Bell,
  Plus,
  Calendar,
  UserPlus,
  BookPlus,
  Megaphone,
  CheckCheck,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { SearchInput } from '../shared/SearchInput';
import { Button } from '../shared/Button';
export const Header = () => {
  const {
    activeTab,
    setMobileMenuOpen,
    searchQuery,
    setSearchQuery,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    openModal,
    setAppView,
  } = useAdmin();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const notifRef = useRef(null);
  const quickAddRef = useRef(null);
  const unreadCount = notifications.filter((n) => !n.read).length;
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (quickAddRef.current && !quickAddRef.current.contains(e.target)) {
        setQuickAddOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const tabTitles = {
    dashboard: {
      title: 'Executive Dashboard',
      subtitle: 'Academic Year 2026 \u2022 Term 1',
    },
    students: {
      title: 'Student Directory',
      subtitle: 'Enrolled students, academic records & attendance',
    },
    teachers: {
      title: 'Faculty & Instructors',
      subtitle: 'Teaching staff, departments & course assignments',
    },
    courses: {
      title: 'Course Catalog',
      subtitle: 'Curriculum syllabus, credits & capacity',
    },
    schedules: {
      title: 'Timetable & Rooms',
      subtitle: 'Weekly schedules, lab allocations & lecture halls',
    },
    finances: {
      title: 'Tuition & Accounts',
      subtitle: 'Fee collection, invoices & balance tracking',
    },
    announcements: {
      title: 'Notice Board',
      subtitle: 'Campus-wide announcements & emergency notices',
    },
    settings: {
      title: 'System Settings',
      subtitle: 'Academic rules, grading scales & portal options',
    },
  };
  const currentMeta = tabTitles[activeTab] || {
    title: 'Admin Portal',
    subtitle: 'Institutional Management',
  };
  return (
    <header className="h-18 bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Page Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate tracking-tight">
            {currentMeta.title}
          </h1>
          <p className="text-[11px] text-slate-400 hidden sm:block truncate">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="hidden md:block flex-1 max-w-md mx-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={`Search ${activeTab}...`}
        />
      </div>

      {/* Right: Quick Actions & Notifications */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Term Indicator Pill */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 font-medium">
          <Calendar className="w-3.5 h-3.5 text-amber-600" />
          <span>Fall 2025 • Term In Session</span>
        </div>

        {/* View Public Website */}
        <button
          type="button"
          onClick={() => setAppView('landing')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
          title="Switch to Landing Page"
        >
          <span>Landing Page</span>
        </button>

        {/* Quick Add Dropdown */}
        <div className="relative" ref={quickAddRef}>
          <Button
            size="sm"
            variant="primary"
            iconLeft={<Plus className="w-4 h-4" />}
            onClick={() => setQuickAddOpen(!quickAddOpen)}
            className="hidden sm:inline-flex shadow-sm"
          >
            Quick Add
          </Button>

          <AnimatePresence>
            {quickAddOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200/80 py-1.5 z-30"
              >
                <button
                  type="button"
                  onClick={() => {
                    openModal('add-student');
                    setQuickAddOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                >
                  <UserPlus className="w-4 h-4 text-indigo-600" />
                  <span>Enroll New Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openModal('add-course');
                    setQuickAddOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                >
                  <BookPlus className="w-4 h-4 text-emerald-600" />
                  <span>Create Course</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openModal('add-teacher');
                    setQuickAddOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                >
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  <span>Add Faculty Member</span>
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  type="button"
                  onClick={() => {
                    openModal('add-announcement');
                    setQuickAddOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                >
                  <Megaphone className="w-4 h-4 text-amber-600" />
                  <span>Publish Notice</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </motion.button>

          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden z-30"
              >
                <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-800">
                      System Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 text-[10px] font-bold bg-indigo-100 text-indigo-700 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-3.5 transition-colors cursor-pointer hover:bg-slate-50 flex items-start gap-3 ${!notif.read ? 'bg-indigo-50/30' : ''}`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!notif.read ? 'bg-indigo-600' : 'bg-transparent'}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-semibold text-slate-800 truncate">
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {notif.time}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
