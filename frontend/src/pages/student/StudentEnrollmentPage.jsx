import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Clock,
  CheckCircle2,
  BookOpen,
  Calendar,
  User,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  ArrowRight,
} from 'lucide-react';

// Hooks & Context
import {
  useStudentOfferings,
  useStudentEnrollments,
  useEnrollOfferings,
} from '../../shared/hooks/useStudent';
import useToast from '../../shared/hooks/useToast';

export default function StudentEnrollmentPage({ onNavigateTab }) {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [enrollingOfferingId, setEnrollingOfferingId] = useState(null);
  const perPage = 20;

  // ---------------------------------------------------------------------------
  // 1. Fetch Available Offerings (Catalogue to enroll into)
  // ---------------------------------------------------------------------------
  const {
    data: offeringsResponse,
    isLoading: isOfferingsLoading,
    isError: isOfferingsError,
    error: offeringsError,
    refetch: refetchOfferings,
    isFetching: isOfferingsFetching,
  } = useStudentOfferings({ page, perPage });

  const offerings = Array.isArray(offeringsResponse?.data)
    ? offeringsResponse.data
    : Array.isArray(offeringsResponse)
      ? offeringsResponse
      : [];

  const meta = offeringsResponse?.meta || {
    page,
    perPage,
    totalPages: 1,
    totalRecords: offerings.length,
  };

  // ---------------------------------------------------------------------------
  // 2. Fetch Active Student Enrollments (To identify already-enrolled courses)
  // ---------------------------------------------------------------------------
  const { data: enrollmentsResponse } = useStudentEnrollments({
    page: 1,
    perPage: 100,
  });

  const enrolledOfferings = Array.isArray(enrollmentsResponse?.data)
    ? enrollmentsResponse.data
    : Array.isArray(enrollmentsResponse)
      ? enrollmentsResponse
      : [];

  // Set of offering IDs the student is already enrolled in
  const enrolledOfferingIds = useMemo(() => {
    return new Set(
      enrolledOfferings.map((item) => Number(item.id || item.offeringId))
    );
  }, [enrolledOfferings]);

  // ---------------------------------------------------------------------------
  // 3. Mutation to Enroll in Course Offering
  // ---------------------------------------------------------------------------
  const enrollMutation = useEnrollOfferings({
    onSuccess: (data, variables) => {
      showToast?.('Successfully enrolled in course offering!', 'success');
      setEnrollingOfferingId(null);
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to enroll in offering.';
      showToast?.(msg, 'error');
      setEnrollingOfferingId(null);
    },
  });

  const handleEnroll = (offering) => {
    setEnrollingOfferingId(offering.id);
    // Payload accepted: [offeringId] or { offeringIds: [offeringId] }
    enrollMutation.mutate([offering.id]);
  };

  // ---------------------------------------------------------------------------
  // 4. Client-side Search Filter (Code, title, batch code, instructor)
  // ---------------------------------------------------------------------------
  const filteredOfferings = offerings.filter((item) => {
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
              • Open Catalogue
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-700">
              {meta.totalRecords} Available Offerings
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Course Catalogue & Enrollment
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse available course offerings and enroll directly into classes.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('courses')}
              className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>View Enrolled Courses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => refetchOfferings()}
            disabled={isOfferingsFetching}
            className="p-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Refresh offerings"
          >
            <RefreshCw
              className={`w-4 h-4 ${isOfferingsFetching ? 'animate-spin text-secondary-500' : ''}`}
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
            placeholder="Search offerings by title, course code, batch, or instructor..."
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
      {isOfferingsLoading && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-secondary-500 mx-auto" />
          <p className="text-sm font-bold text-slate-700">Loading course offerings...</p>
        </div>
      )}

      {/* 4. Error State */}
      {!isOfferingsLoading && isOfferingsError && (
        <div className="p-8 text-center bg-white rounded-3xl border border-rose-200 shadow-xs space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-sm font-bold text-slate-900">
            {offeringsError?.response?.data?.message ||
              offeringsError?.message ||
              'Failed to load course offerings.'}
          </p>
          <button
            type="button"
            onClick={() => refetchOfferings()}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer hover:bg-slate-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* 5. Empty State */}
      {!isOfferingsLoading && !isOfferingsError && filteredOfferings.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-950">
            {searchQuery ? 'No matching offerings found' : 'No Course Offerings Available'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No course offerings match "${searchQuery}". Try different keywords.`
              : 'There are currently no active course offerings available for enrollment.'}
          </p>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold cursor-pointer transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      )}

      {/* 6. Offerings Grid */}
      {!isOfferingsLoading && !isOfferingsError && filteredOfferings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredOfferings.map((item) => {
            const course = item.course || {};
            const instructor = item.instructor || {};
            const instructorFullName =
              instructor.firstName && instructor.lastName
                ? `${instructor.firstName} ${instructor.lastName}`
                : instructor.firstName || instructor.name || 'Instructor';

            const isAlreadyEnrolled = enrolledOfferingIds.has(Number(item.id));
            const isThisEnrolling =
              enrollingOfferingId === item.id && enrollMutation.isPending;

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

                    {isAlreadyEnrolled ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Enrolled</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 shrink-0">
                        <span>Open</span>
                      </span>
                    )}
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
                        <span>{item.duration} Mins / Class</span>
                      </div>
                    )}
                  </div>

                  {/* Class Schedule / Start Time */}
                  {(item.startTime || item.classDate) && (
                    <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60 flex items-center gap-2 text-xs text-amber-900 font-medium">
                      <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="truncate">
                        {item.classDate ? `Starts ${item.classDate}` : ''}
                        {item.classDate && item.startTime ? ' • ' : ''}
                        {item.startTime ? `Time: ${item.startTime}` : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Action Button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Offering #{item.id}
                  </span>

                  {isAlreadyEnrolled ? (
                    <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Already Enrolled</span>
                    </div>
                  ) : (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isThisEnrolling}
                      onClick={() => handleEnroll(item)}
                      className="px-5 py-2.5 rounded-xl text-xs font-black bg-secondary-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-secondary-500/20 flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                    >
                      {isThisEnrolling ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                          <span>Enrolling...</span>
                        </>
                      ) : (
                        <span>+ Enroll in Course</span>
                      )}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 7. Pagination Controls */}
      {!isOfferingsLoading && !isOfferingsError && meta.totalPages > 1 && (
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