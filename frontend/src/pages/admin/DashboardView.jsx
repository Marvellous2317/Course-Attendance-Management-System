import React from 'react';
import { motion } from 'motion/react';
import {
  Users,
  GraduationCap,
  BookOpen,
  Layers,
  UserCheck,
  CheckCircle2,
  Clock,
  Percent,
  RotateCw,
  AlertCircle,
  UserPlus,
  BookPlus,
  Plus,
} from 'lucide-react';
import { useAdminDashboard } from '../../shared/hooks/useAdmin';
import { useAdmin } from '../../context/AdminContext';
import { StatCard } from '../../shared/components/StatCard';

export default function DashboardView() {
  const adminCtx = useAdmin?.() || {};
  const { openModal, setActiveTab, user, showToast } = adminCtx;

  // ---------------------------------------------------------------------------
  // 1. Fetch Live Backend Analytics (/api/admin/dashboard)
  // ---------------------------------------------------------------------------
  const {
    data: dashboardResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useAdminDashboard();

  const dashboardData = dashboardResponse?.data || dashboardResponse || {};

  // Extract all 8 metrics directly from the API response
  const totalTeachers = dashboardData.totalTeachers ?? 0;
  const totalStudents = dashboardData.totalStudents ?? 0;
  const totalCourses = dashboardData.totalCourses ?? 0;
  const totalOfferings = dashboardData.totalOfferings ?? 0;
  const totalEnrollments = dashboardData.totalEnrollments ?? 0;
  const attendancePresent = dashboardData.attendancePresent ?? 0;
  const attendanceMarked = dashboardData.attendanceMarked ?? 0;
  const attendancePercentage = dashboardData.attendancePercentage;

  const attendanceRateLabel =
    attendancePercentage !== null && attendancePercentage !== undefined
      ? `${Number(attendancePercentage).toFixed(1)}%`
      : '0%';

  const adminDisplayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName || user?.name || 'Administrator';

  const handleRefresh = async () => {
    await refetch();
    showToast?.('Institutional metrics refreshed.', 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Hero Dark Banner with Orange Accent Glow */}
      <div className="rounded-3xl bg-primary-900 text-white p-6 sm:p-8 relative overflow-hidden border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-xl">

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Welcome back!</span>
              <span className="inline-block animate-bounce">👋</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Real-time academic metrics, campus telemetry, curriculum provisioning, and faculty management.
            </p>
          </div>

          {/* Action Buttons with Signature Orange Branding */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openModal?.('add-student')}
              className="px-4 py-2.5 rounded-xl bg-secondary-500 hover:bg-secondary-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-slate-950" />
              <span>Enroll Student</span>
            </motion.button>

            <button
              type="button"
              onClick={() => openModal?.('add-teacher')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Add Teacher</span>
            </button>

            <button
              type="button"
              onClick={() => openModal?.('add-course')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <BookPlus className="w-3.5 h-3.5 text-slate-400" />
              <span>Create Course</span>
            </button>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isFetching}
              title="Refresh Analytics"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            >
              <RotateCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-secondary-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
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
            className="px-3 py-1 bg-white border border-rose-200 rounded-lg font-bold hover:bg-rose-100 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* 2. Top Metric Cards (All 8 Metrics) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Row 1, Card 1: Total Teachers */}
        <StatCard
          id="stat-teachers"
          title="Total Teachers"
          value={isLoading ? '...' : totalTeachers.toLocaleString()}
          subValue="Active faculty & instructors"
          icon={<Users className="w-6 h-6" />}
          colorScheme="blue"
          delay={0.05}
        />

        {/* Row 1, Card 2: Total Students */}
        <StatCard
          id="stat-students"
          title="Total Students"
          value={isLoading ? '...' : totalStudents.toLocaleString()}
          subValue="Registered student body"
          icon={<GraduationCap className="w-6 h-6" />}
          colorScheme="indigo"
          delay={0.1}
        />

        {/* Row 1, Card 3: Total Courses */}
        <StatCard
          id="stat-courses"
          title="Total Courses"
          value={isLoading ? '...' : totalCourses.toLocaleString()}
          subValue="Active curriculum modules"
          icon={<BookOpen className="w-6 h-6" />}
          colorScheme="purple"
          delay={0.15}
        />

        {/* Row 2, Card 4: Course Offerings (Amber Scheme) */}
        <StatCard
          id="stat-offerings"
          title="Course Offerings"
          value={isLoading ? '...' : totalOfferings.toLocaleString()}
          subValue="Scheduled class batches"
          icon={<Layers className="w-6 h-6" />}
          colorScheme="amber"
          delay={0.2}
        />

        {/* Row 2, Card 5: Total Enrollments */}
        <StatCard
          id="stat-enrollments"
          title="Total Enrollments"
          value={isLoading ? '...' : totalEnrollments.toLocaleString()}
          subValue="Active student course seats"
          icon={<UserCheck className="w-6 h-6" />}
          colorScheme="teal"
          delay={0.25}
        />

        {/* Row 2, Card 6: Attendance Present */}
        <StatCard
          id="stat-attendance-present"
          title="Attendance Present"
          value={isLoading ? '...' : attendancePresent.toLocaleString()}
          subValue="Verified student check-ins"
          icon={<CheckCircle2 className="w-6 h-6" />}
          colorScheme="emerald"
          delay={0.3}
        />

        {/* Row 3, Card 7: Attendance Marked */}
        <StatCard
          id="stat-attendance-marked"
          title="Attendance Marked"
          value={isLoading ? '...' : attendanceMarked.toLocaleString()}
          subValue="Total class sessions held"
          icon={<Clock className="w-6 h-6" />}
          colorScheme="cyan"
          delay={0.35}
        />

        {/* Row 3, Card 8: Attendance Percentage (Amber Scheme) */}
        <StatCard
          id="stat-attendance-rate"
          title="Attendance Rate"
          value={isLoading ? '...' : attendanceRateLabel}
          subValue={
            attendanceMarked > 0
              ? `${attendancePresent.toLocaleString()} of ${attendanceMarked.toLocaleString()} present`
              : 'Institutional average rate'
          }
          icon={<Percent className="w-6 h-6" />}
          colorScheme="amber"
          delay={0.4}
        />
      </div>
    </div>
  );
}