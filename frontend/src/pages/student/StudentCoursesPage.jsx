import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Clock,
  RotateCw,
  Search,
  User,
  Calendar,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';

// Live TanStack Query Hooks & Context
import {
  useStudentEnrollments,
  useDropOffering,
} from '../../shared/hooks/useStudent';
import useToast from '../../shared/hooks/useToast';

export default function StudentCoursesPage({
  onSelectCourse,
  onNavigateTab,
}) {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [courseToDrop, setCourseToDrop] = useState(null);
  const perPage = 20;

  // ---------------------------------------------------------------------------
  // 1. Consume Live Enrolled Courses API Hook
  // ---------------------------------------------------------------------------
  const {
    data: enrollmentsResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useStudentEnrollments({ page, perPage });

  const enrollments = Array.isArray(enrollmentsResponse?.data)
    ? enrollmentsResponse.data
    : Array.isArray(enrollmentsResponse)
      ? enrollmentsResponse
      : [];

  const meta = enrollmentsResponse?.meta || {
    page,
    perPage,
    totalPages: 1,
    totalRecords: enrollments.length,
  };

  const handleRefresh = async () => {
    await refetch();
    showToast?.('Enrolled courses refreshed.', 'success');
  };

  // ---------------------------------------------------------------------------
  // 2. Drop / Unenroll Offering Mutation Hook
  // ---------------------------------------------------------------------------
  const dropMutation = useDropOffering({
    onSuccess: (data, offeringId) => {
      showToast?.('Successfully unenrolled from the course.', 'success');
      setCourseToDrop(null);
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to unenroll from course offering.';
      showToast?.(msg, 'error');
    },
  });

  const handleConfirmDrop = () => {
    if (!courseToDrop?.id) return;
    dropMutation.mutate(courseToDrop.id);
  };

  // ---------------------------------------------------------------------------
  // 3. Client-side Search Filter (Course code, title, batch code, instructor)
  // ---------------------------------------------------------------------------
  const filteredCourses = enrollments.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const code = item.course?.code?.toLowerCase() || '';
    const title = item.course?.title?.toLowerCase() || '';
    const batch = item.batchCode?.toLowerCase() || '';
    const instructorName = `${item.instructor?.firstName || ''} ${item.instructor?.lastName || ''}`.toLowerCase();
    const instructorEmail = item.instructor?.email?.toLowerCase() || '';

    return (
      code.includes(q) ||
      title.includes(q) ||
      batch.includes(q) ||
      instructorName.includes(q) ||
      instructorEmail.includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
              • Active Enrollments
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-700">
              {meta.totalRecords} Courses Registered
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Your Registered Courses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            View your active course offerings, batch schedules, and instructor details.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigateTab?.('enrollment')}
            className="px-4 py-2.5 rounded-2xl bg-secondary-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-secondary-500/20 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>+ Enroll Courses</span>
          </motion.button>

          <button
            type="button"
            onClick={handleRefresh}
            title="Refresh courses"
            disabled={isFetching}
            className="p-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
          >
            <RotateCw
              className={`w-4 h-4 ${isFetching ? 'animate-spin text-secondary-500' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* 2. Search Bar */}
      <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by course title, code, batch code, or instructor..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-secondary-500 transition-colors"
          />
        </div>

        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-xs text-slate-500 hover:text-slate-900 font-semibold px-2 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* 3. Loading State */}
      {isLoading && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-secondary-500 mx-auto" />
          <p className="text-sm font-bold text-slate-700">Loading your enrolled courses...</p>
        </div>
      )}

      {/* 4. Error State */}
      {!isLoading && isError && (
        <div className="p-8 text-center bg-white rounded-3xl border border-rose-200 shadow-xs space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-sm font-bold text-slate-900">
            {error?.response?.data?.message || error?.message || 'Failed to load courses.'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer hover:bg-slate-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* 5. Empty State */}
      {!isLoading && !isError && filteredCourses.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-950">
            {searchQuery ? 'No matching courses found' : 'No Enrolled Courses Found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No course matches "${searchQuery}". Try searching for another keyword.`
              : 'You are not enrolled in any course offerings yet.'}
          </p>
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold cursor-pointer transition-colors"
            >
              Clear Search
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigateTab?.('enrollment')}
              className="px-4 py-2 rounded-xl bg-primary-900 text-white text-xs font-bold cursor-pointer hover:bg-slate-800 transition-colors"
            >
              Browse Catalog & Enroll
            </button>
          )}
        </div>
      )}

      {/* 6. Enrolled Courses Grid */}
      {!isLoading && !isError && filteredCourses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((item) => {
            const course = item.course || {};
            const instructor = item.instructor || {};
            const instructorFullName =
              instructor.firstName && instructor.lastName
                ? `${instructor.firstName} ${instructor.lastName}`
                : instructor.firstName || instructor.name || 'Instructor';

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl bg-primary-900 text-secondary-500 font-mono font-black text-xs">
                        {course.code || 'COURSE'}
                      </span>
                      {item.batchCode && (
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-mono font-bold text-[11px] border border-slate-200">
                          {item.batchCode}
                        </span>
                      )}
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Enrolled</span>
                    </span>
                  </div>

                  {/* Course Title & Description */}
                  <div>
                    <h3 className="font-black text-base sm:text-lg text-slate-950 tracking-tight leading-snug">
                      {course.title || 'Untitled Course'}
                    </h3>
                    {course.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    )}
                  </div>

                  {/* Instructor Details */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {instructorFullName}
                      </p>
                      {instructor.email && (
                        <p className="text-[11px] text-slate-500 truncate font-mono">
                          {instructor.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Sessions & Duration */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {item.sessions != null && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-slate-700 font-medium">
                        <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{item.sessions} Sessions</span>
                      </div>
                    )}

                    {item.duration != null && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-slate-700 font-medium">
                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{item.duration} Mins</span>
                      </div>
                    )}
                  </div>

                  {/* Schedule */}
                  {(item.startTime || item.classDate) && (
                    <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60 flex items-center gap-2 text-xs text-amber-900 font-medium">
                      <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="truncate">
                        {item.classDate ? item.classDate : ''}
                        {item.classDate && item.startTime ? ' • ' : ''}
                        {item.startTime ? `Starts ${item.startTime}` : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Actions: View Details + Unenroll Button */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onSelectCourse?.(item)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-primary-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-secondary-500" />
                    <span>View Details</span>
                  </motion.button>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setCourseToDrop(item)}
                    className="py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    title="Unenroll from this course"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Unenroll</span>
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 7. Pagination Controls */}
      {!isLoading && !isError && meta.totalPages > 1 && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between text-xs text-slate-600">
          <span>
            Page <strong className="text-slate-900">{meta.page}</strong> of{' '}
            <strong className="text-slate-900">{meta.totalPages}</strong> ({meta.totalRecords} total records)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={meta.page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={meta.page >= meta.totalPages}
              onClick={() => setPage((prev) => Math.min(meta.totalPages, prev + 1))}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 8. Confirmation Modal for Unenrolling */}
      <AnimatePresence>
        {courseToDrop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !dropMutation.isPending && setCourseToDrop(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 z-10 space-y-5"
            >
              {/* Header with Alert Icon & Close */}
              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                  <AlertTriangle className="w-6 h-6 text-rose-600" />
                </div>
                <button
                  type="button"
                  disabled={dropMutation.isPending}
                  onClick={() => setCourseToDrop(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Title & Warning message */}
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-950 tracking-tight">
                  Unenroll from Course Offering?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to drop your enrollment? Any attendance
                  already recorded will be preserved, and you can re-enroll later if seats remain open.
                </p>

                {/* Target Course Summary Box */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 mt-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-primary-900 text-secondary-500 font-mono font-bold text-xs">
                      {courseToDrop.course?.code || 'COURSE'}
                    </span>
                    {courseToDrop.batchCode && (
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono font-semibold text-[11px]">
                        Batch: {courseToDrop.batchCode}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-black text-slate-900 leading-snug">
                    {courseToDrop.course?.title || 'Course Offering'}
                  </h4>
                  {courseToDrop.instructor && (
                    <p className="text-[11px] text-slate-500">
                      Instructor:{' '}
                      {courseToDrop.instructor.firstName}{' '}
                      {courseToDrop.instructor.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={dropMutation.isPending}
                  onClick={() => setCourseToDrop(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={dropMutation.isPending}
                  onClick={handleConfirmDrop}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center justify-center gap-1.5 cursor-pointer transition-colors disabled:opacity-60"
                >
                  {dropMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Dropping...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5 text-white" />
                      <span>Confirm Unenroll</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}