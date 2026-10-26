import { useState } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  Users,
  CheckCircle2,
  Calendar,
  Layers,
  Clock,
  UserCheck,
  Percent,
  Plus,
  RotateCw,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { ScrollReveal } from '../../shared/components/ScrollReveal';

// Live TanStack Query Hooks
import {
  useTeacherDashboard,
  useTeacherOfferings,
} from '../../shared/hooks/useTeacher';

export default function TeacherDashboardPage() {
  const adminContext = useAdmin?.() || {};
  const {
    setTeacherTab,
    setIsAttendanceModalOpen,
    setIsNewCourseModalOpen,
    teacherCourses = [],
    user,
    showToast,
  } = adminContext;

  // ---------------------------------------------------------------------------
  // 1. Fetch Live Teacher Dashboard Analytics (/api/teacher/dashboard)
  // ---------------------------------------------------------------------------
  const {
    data: dashboardResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useTeacherDashboard();

  const metrics = dashboardResponse?.data || dashboardResponse || {};

  // Extract all 7 metrics directly from backend response
  const totalCourses = metrics.totalCourses ?? 0;
  const totalOfferings = metrics.totalOfferings ?? 0;
  const totalStudents = metrics.totalStudents ?? 0;
  const totalSessions = metrics.totalSessions ?? 0;
  const attendancePresent = metrics.attendancePresent ?? 0;
  const attendanceMarked = metrics.attendanceMarked ?? 0;
  const attendancePercentage = metrics.attendancePercentage ?? 0;

  // Optional: Fetch live offerings to populate the distribution list
  const { data: offeringsResponse } = useTeacherOfferings({ perPage: 10 });
  const liveOfferings = offeringsResponse?.data || [];

  const handleRefresh = async () => {
    await refetch();
    showToast?.('Dashboard metrics refreshed.', 'success');
  };

  const teacherDisplayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName || 'Professor Vance';

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Hero Dark Banner */}
      <div className="rounded-3xl bg-primary-900 text-white p-6 sm:p-8 relative overflow-hidden border border-slate-800 shadow-xl">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            
            
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Welcome back!</span>
              <span className="inline-block animate-bounce">👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Track your course batches, classroom sessions, and verified student attendance metrics.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setTeacherTab?.('schedule')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>View Courses</span>
            </button>

           
            
          </div>
        </div>
      </div>

      {/* Error Notice */}
      {isError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              {error?.response?.data?.message ||
                error?.message ||
                'Failed to load dashboard metrics.'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="font-bold underline hover:no-underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* 2. Top Metric Cards (All 7 Metrics - 3 on Each Row) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Row 1, Card 1: Total Courses */}
        <ScrollReveal delay={0.05}>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between h-full hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Created & Assigned Courses
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-slate-950 tracking-tight font-mono">
                {isLoading ? '...' : totalCourses.toLocaleString()}
              </div>
              <div className="mt-1 text-xs text-slate-500 font-medium">
                Academic curriculum modules in your portfolio
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Row 1, Card 2: Total Offerings */}
        <ScrollReveal delay={0.1}>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between h-full hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Course Offerings / Batches
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-slate-950 tracking-tight font-mono">
                {isLoading ? '...' : totalOfferings.toLocaleString()}
              </div>
              <div className="mt-1 text-xs text-slate-500 font-medium">
                Scheduled term cohorts instructed by you
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Row 1, Card 3: Total Students */}
        <ScrollReveal delay={0.15}>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between h-full hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Enrolled Students
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-slate-950 tracking-tight font-mono">
                {isLoading ? '...' : totalStudents.toLocaleString()}
              </div>
              <div className="mt-1 text-xs text-slate-500 font-medium">
                Distinct active learners across your batches
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Row 2, Card 4: Total Sessions */}
        <ScrollReveal delay={0.2}>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between h-full hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Class Sessions
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-slate-950 tracking-tight font-mono">
                {isLoading ? '...' : totalSessions.toLocaleString()}
              </div>
              <div className="mt-1 text-xs text-slate-500 font-medium">
                Lectures, labs & workshop sessions scheduled
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Row 2, Card 5: Attendance Present */}
        <ScrollReveal delay={0.25}>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between h-full hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Attendance Present
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-slate-950 tracking-tight font-mono text-emerald-700">
                {isLoading ? '...' : attendancePresent.toLocaleString()}
              </div>
              <div className="mt-1 text-xs text-slate-500 font-medium">
                Verified student check-ins across sessions
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Row 2, Card 6: Attendance Marked */}
        <ScrollReveal delay={0.3}>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between h-full hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Attendance Marked
              </span>
              <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-slate-950 tracking-tight font-mono">
                {isLoading ? '...' : attendanceMarked.toLocaleString()}
              </div>
              <div className="mt-1 text-xs text-slate-500 font-medium">
                Total student session attendance records logged
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Row 3, Card 7: Overall Attendance Percentage */}
        <ScrollReveal delay={0.35}>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between h-full hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Overall Attendance Rate
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-slate-950 tracking-tight font-mono text-emerald-600 flex items-baseline gap-2">
                <span>{isLoading ? '...' : `${Number(attendancePercentage).toFixed(1)}%`}</span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
              <div className="mt-1 text-xs text-slate-500 font-medium">
                {attendanceMarked > 0
                  ? `${attendancePresent.toLocaleString()} present out of ${attendanceMarked.toLocaleString()} marked`
                  : 'No attendance marked yet'}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

     
    </div>
  );
}