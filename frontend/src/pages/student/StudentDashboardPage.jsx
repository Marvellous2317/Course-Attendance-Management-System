import React from 'react';
import { motion } from 'motion/react';
import {
  Clock,
  ArrowRight,
  ShieldCheck,
  Calendar,
  GraduationCap,
  CheckCircle2,
  Percent,
  Loader2,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Context & Hooks
import { useAdmin } from '../../context/AdminContext';
import { useStudentDashboard } from '../../shared/hooks/useStudent';
import { getUserProfile } from '../../shared/api/auth';

export default function StudentDashboardPage({
  courses = [],
  onNavigateTab,
  onOpenCheckIn,
  onOpenTimetable,
  onSelectCourse,
}) {
  const { currentUser } = useAdmin();

  // ---------------------------------------------------------------------------
  // 1. Live User Profile (Fetches name from /api/profile)
  // ---------------------------------------------------------------------------
  const { data: profileResponse, isLoading: isProfileLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: getUserProfile,
    staleTime: 1000 * 60 * 5,
  });

  const profileUser = profileResponse?.data || profileResponse || currentUser;

  const displayName =
    profileUser?.firstName
      ? `${profileUser.firstName}`
      : profileUser?.firstName ||
        profileUser?.name ||
        profileUser?.username ||
        'Student';

  // ---------------------------------------------------------------------------
  // 2. Live Student Dashboard Analytics (/api/student/dashboard)
  // ---------------------------------------------------------------------------
  const {
    data: dashboardResponse,
    isLoading: isDashboardLoading,
  } = useStudentDashboard();

  const dashboardData = dashboardResponse?.data || dashboardResponse || {};
  const {
    enrolledOfferings = 0,
    upcomingSessions = 0,
    attendancePresent = 0,
    attendanceMarked = 0,
    attendancePercentage = null,
  } = dashboardData;

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-7 pb-16"
    >
      {/* 1. Welcome Banner */}
      <motion.div
        variants={item}
        className="rounded-3xl bg-primary-900 text-white p-6 sm:p-8 relative overflow-hidden shadow-xl border border-slate-800"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              {isProfileLoading && !profileUser ? (
                <div className="flex items-center gap-2">
                  <span>Welcome back...</span>
                  <Loader2 className="w-6 h-6 animate-spin text-secondary-500" />
                </div>
              ) : (
                <>
                  Welcome back, {displayName}! <span>🚀</span>
                </>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              • {profileUser?.email || 'Student Account'} •
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row lg:flex-col gap-3 shrink-0 self-start lg:self-center">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigateTab('enrollment')}
              className="px-5 py-3 rounded-2xl bg-secondary-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-secondary-500/20 flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <span>+ Enroll for Courses</span>
            </motion.button>

           
          </div>
        </div>
      </motion.div>

      {/* 2. Top 5 Stat Cards (Matches Backend Exactly) */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 md:grid-cols-3 gap-5"
      >
        {/* Card 1: enrolledOfferings */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200/60">
              Active
            </span>
          </div>

          <div className="mt-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Enrolled Offerings
            </span>
            <div className="text-3xl font-black text-slate-950 mt-1">
              {isDashboardLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              ) : (
                enrolledOfferings
              )}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-3 pt-3 border-t border-slate-100">
              Total enrolled course offerings
            </div>
          </div>
        </div>

        {/* Card 2: upcomingSessions */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200/60">
              Scheduled
            </span>
          </div>

          <div className="mt-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Upcoming Sessions
            </span>
            <div className="text-3xl font-black text-slate-950 mt-1">
              {isDashboardLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              ) : (
                upcomingSessions
              )}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-3 pt-3 border-t border-slate-100">
              Total sessions scheduled
            </div>
          </div>
        </div>

        {/* Card 3: attendancePresent */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/60">
              Present
            </span>
          </div>

          <div className="mt-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Attendance Present
            </span>
            <div className="text-3xl font-black text-slate-950 mt-1">
              {isDashboardLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              ) : (
                attendancePresent
              )}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-3 pt-3 border-t border-slate-100">
              Sessions attended by student
            </div>
          </div>
        </div>

        {/* Card 4: attendanceMarked */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-800 border border-indigo-200/60">
              Marked
            </span>
          </div>

          <div className="mt-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Attendance Marked
            </span>
            <div className="text-3xl font-black text-slate-950 mt-1">
              {isDashboardLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              ) : (
                attendanceMarked
              )}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-3 pt-3 border-t border-slate-100">
              Total sessions recorded
            </div>
          </div>
        </div>

        {/* Card 5: attendancePercentage */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200/60">
              Rate
            </span>
          </div>

          <div className="mt-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Attendance Percentage
            </span>
            <div className="text-3xl font-black text-slate-950 mt-1">
              {isDashboardLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              ) : attendancePercentage != null ? (
                `${Number(attendancePercentage).toFixed(2)}%`
              ) : (
                'N/A'
              )}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-3 pt-3 border-t border-slate-100">
              Overall attendance percentage
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}