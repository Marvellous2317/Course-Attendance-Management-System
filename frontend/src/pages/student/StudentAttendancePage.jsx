import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  BookOpen,
  Search,
  Loader2,
  AlertCircle,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  GraduationCap,
  Percent,
} from 'lucide-react';

// Live TanStack Query Hooks & Context
import {
  useStudentAttendance,
  useExportStudentAttendance,
} from '../../shared/hooks/useStudent';
import { useAdmin } from '../../context/AdminContext';

export default function StudentAttendancePage({ onNavigateTab }) {
  const { showToast } = useAdmin();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const perPage = 20;

  // ---------------------------------------------------------------------------
  // 1. Fetch Student Attendance Data
  // ---------------------------------------------------------------------------
  const {
    data: attendanceResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useStudentAttendance({ page, perPage });

  const attendanceList = Array.isArray(attendanceResponse?.data)
    ? attendanceResponse.data
    : Array.isArray(attendanceResponse)
      ? attendanceResponse
      : [];

  const meta = attendanceResponse?.meta || {
    page,
    perPage,
    totalPages: 1,
    totalRecords: attendanceList.length,
  };

  // ---------------------------------------------------------------------------
  // 2. Export Attendance as CSV Mutation
  // ---------------------------------------------------------------------------
  const exportMutation = useExportStudentAttendance({
    onSuccess: () => {
      showToast?.('Attendance history CSV downloaded successfully.', 'success');
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to export attendance CSV';
      showToast?.(msg, 'error');
    },
  });

  const handleExportCSV = () => {
    exportMutation.mutate();
  };

  // ---------------------------------------------------------------------------
  // 3. Computed Real Aggregates from Live API
  // ---------------------------------------------------------------------------
  const totalOfferings = attendanceList.length;

  const totalAttended = useMemo(() => {
    return attendanceList.reduce(
      (acc, curr) => acc + (Number(curr.attended) || 0),
      0
    );
  }, [attendanceList]);

  const totalMarked = useMemo(() => {
    return attendanceList.reduce(
      (acc, curr) => acc + (Number(curr.marked) || 0),
      0
    );
  }, [attendanceList]);

  const averagePercentage = useMemo(() => {
    const validPercentages = attendanceList
      .map((c) => Number(c.percentage))
      .filter((p) => !isNaN(p) && p !== null);

    if (validPercentages.length === 0) return null;
    return (
      validPercentages.reduce((a, b) => a + b, 0) / validPercentages.length
    ).toFixed(1);
  }, [attendanceList]);

  // List of unique course titles for the filter dropdown
  const uniqueCourseTitles = useMemo(() => {
    return Array.from(
      new Set(attendanceList.map((c) => c.courseTitle).filter(Boolean))
    );
  }, [attendanceList]);

  // ---------------------------------------------------------------------------
  // 4. Filter Offerings & Their Records
  // ---------------------------------------------------------------------------
  const filteredOfferings = useMemo(() => {
    return attendanceList
      .filter((offering) => {
        if (courseFilter !== 'all' && offering.courseTitle !== courseFilter) {
          return false;
        }
        return true;
      })
      .map((offering) => {
        const filteredRecords = (offering.records || []).filter((rec) => {
          // Status Filter
          if (statusFilter === 'present' && !rec.present) return false;
          if (statusFilter === 'absent' && rec.present) return false;

          // Search Query
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const topic = (rec.topic || '').toLowerCase();
            const course = (offering.courseTitle || '').toLowerCase();
            const batch = (offering.batchCode || '').toLowerCase();
            const time = (rec.startTime || '').toLowerCase();
            return (
              topic.includes(q) ||
              course.includes(q) ||
              batch.includes(q) ||
              time.includes(q)
            );
          }
          return true;
        });

        return {
          ...offering,
          filteredRecords,
        };
      })
      .filter((offering) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const course = (offering.courseTitle || '').toLowerCase();
          const batch = (offering.batchCode || '').toLowerCase();
          if (course.includes(q) || batch.includes(q)) return true;
          return offering.filteredRecords.length > 0;
        }
        if (statusFilter !== 'all') {
          return offering.filteredRecords.length > 0;
        }
        return true;
      });
  }, [attendanceList, courseFilter, statusFilter, searchQuery]);

  // Helper date formatter
  const formatSessionTime = (timeStr) => {
    if (!timeStr) return 'Scheduled';
    try {
      const d = new Date(timeStr);
      if (isNaN(d.getTime())) return timeStr;
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header with Export CSV Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            My Attendance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review your session records, attendance rates, and progress across all enrolled courses.
          </p>
        </div>

        {/* Replaced Refresh with Export CSV Button */}
        <button
          type="button"
          onClick={handleExportCSV}
          disabled={exportMutation.isPending}
          className="self-start sm:self-auto px-4 py-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-950 text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
          title="Download complete attendance history as CSV"
        >
          {exportMutation.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-secondary-500" />
          ) : (
            <Download className="w-3.5 h-3.5 text-slate-600" />
          )}
          <span>{exportMutation.isPending ? 'Exporting CSV...' : 'Export CSV'}</span>
        </button>
      </div>

      {/* 2. Search & Filters */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by topic, course title, or batch..."
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-secondary-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Course Filter */}
          <div className="relative">
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200/80 px-3 py-2 pr-7 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <option value="all">All Enrolled Courses</option>
              {uniqueCourseTitles.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200/80 px-3 py-2 pr-7 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <option value="all">All Attendance Records</option>
              <option value="present">Present Only</option>
              <option value="absent">Absent Only</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {(searchQuery || courseFilter !== 'all' || statusFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCourseFilter('all');
                setStatusFilter('all');
              }}
              className="text-xs text-slate-500 hover:text-slate-900 font-semibold px-2 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* 3. Loading State */}
      {isLoading && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-secondary-500 mx-auto" />
          <p className="text-sm font-bold text-slate-700">Loading attendance records...</p>
        </div>
      )}

      {/* 4. Error State */}
      {!isLoading && isError && (
        <div className="p-8 text-center bg-white rounded-3xl border border-rose-200 shadow-xs space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-sm font-bold text-slate-900">
            {error?.response?.data?.message || error?.message || 'Failed to load attendance.'}
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
      {!isLoading && !isError && filteredOfferings.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-950">
            {searchQuery || courseFilter !== 'all' || statusFilter !== 'all'
              ? 'No matching attendance records'
              : 'No Attendance Records Available'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || courseFilter !== 'all' || statusFilter !== 'all'
              ? 'Try modifying your search query or reset your filters.'
              : 'You do not have any recorded attendance sessions in your enrolled courses yet.'}
          </p>
        </div>
      )}

      {/* 6. Per-Offering Attendance Cards & Session Records */}
      {!isLoading && !isError && filteredOfferings.length > 0 && (
        <div className="space-y-6">
          {filteredOfferings.map((offering) => {
            const percentage = Number(offering.percentage || 0);
            const isGoodStanding = percentage >= 85;

            return (
              <motion.div
                key={offering.offeringId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden"
              >
                {/* Offering Header Strip */}
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-lg text-slate-950 tracking-tight">
                        {offering.courseTitle || 'Untitled Course'}
                      </h3>
                      {offering.batchCode && (
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-mono font-bold text-xs border border-slate-200">
                          {offering.batchCode}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Offering ID: #{offering.offeringId} • {offering.attended} of {offering.marked} sessions attended
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {/* Rate Percentage Badge */}
                    <div className="text-right">
                      <div className="text-2xl font-black text-slate-950">
                        {percentage.toFixed(1)}%
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          isGoodStanding
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {isGoodStanding ? 'Good Standing' : 'Below 85% Target'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar with 85% Benchmark Line */}
                <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-100">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-1.5">
                    <span>Attendance Rate</span>
                    <span>Institutional Benchmark: 85.0%</span>
                  </div>
                  <div className="relative w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isGoodStanding ? 'bg-slate-900' : 'bg-amber-600'
                      }`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                    {/* 85% target marker */}
                    <div
                      className="absolute top-0 bottom-0 left-[85%] w-0.5 bg-amber-400 z-10"
                      title="85% Requirement"
                    />
                  </div>
                </div>

                {/* Session Records Table */}
                <div className="overflow-x-auto">
                  {offering.filteredRecords?.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No session records match the active filter for this course.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="py-3 px-6">SESSION ID</th>
                          <th className="py-3 px-6">TOPIC</th>
                          <th className="py-3 px-6">DATE & TIME</th>
                          <th className="py-3 px-6 text-right">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {offering.filteredRecords.map((record) => (
                          <tr
                            key={record.sessionId}
                            className="hover:bg-slate-50/80 transition-colors"
                          >
                            {/* Session ID */}
                            <td className="py-3.5 px-6 font-mono font-semibold text-slate-600 whitespace-nowrap">
                              #{record.sessionId}
                            </td>

                            {/* Topic */}
                            <td className="py-3.5 px-6 font-bold text-slate-900">
                              {record.topic || 'General Session'}
                            </td>

                            {/* Date / Time */}
                            <td className="py-3.5 px-6 text-slate-500 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>{formatSessionTime(record.startTime)}</span>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-6 text-right whitespace-nowrap">
                              {record.present ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Present</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Absent</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
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
            <strong className="text-slate-900">{meta.totalPages}</strong> ({meta.totalRecords} total offerings)
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
    </div>
  );
}