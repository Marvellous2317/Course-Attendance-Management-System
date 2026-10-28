import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Clock,
  MapPin,
  ArrowUpRight,
  MoreVertical,
  Users,
  BookOpen,
  Loader2,
  AlertCircle,
  RotateCw,
  Search,
  GraduationCap,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Layers,
} from "lucide-react";
import { useUIStore } from "../../shared/store/useUIStore";
import useToast from "../../shared/hooks/useToast";
import { ScrollReveal } from "../../shared/components/ScrollReveal";
import { Modal } from "../../shared/components/Modal";
import { Button } from "../../shared/components/Button";
import { Badge } from "../../shared/components/Badge";

// Live TanStack Query Hooks
import {
  useTeacherCourses,
  useTeacherOfferings,
  useTeacherOfferingStudents,
  useCreateTeacherOffering,
} from "../../shared/hooks/useTeacher";

// =============================================================================
// Offering Helpers
// =============================================================================
const MAX_BATCH_CODE_LENGTH = 10;

// Builds a short, unique-looking batch code from a course code (backend caps it at 10 chars).
const suggestBatchCode = (course) => {
  const base = (course?.code || "BATCH")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  return `${base.slice(0, 8) || "BATCH"}-A`.slice(0, MAX_BATCH_CODE_LENGTH);
};

const todayInputValue = () => new Date().toISOString().slice(0, 10);

// =============================================================================
// Course Card Component (Displays course, offering details & student count)
// =============================================================================
function TeacherCourseCardItem({
  course,
  offerings = [],
  onViewStudents,
  onTakeAttendance,
  onCreateOffering,
  openMenuCourseId,
  setOpenMenuCourseId,
  showToast,
}) {
  const courseId = course.id;

  // Match all offerings/batches taught by the teacher for this specific course
  const matchingOfferings = useMemo(() => {
    return offerings.filter(
      (o) =>
        String(o.courseId) === String(courseId) ||
        String(o.course?.id) === String(courseId)
    );
  }, [offerings, courseId]);

  const primaryOffering = matchingOfferings[0];

  // Fetch student count for the primary offering
  const { data: studentsResponse, isLoading: isLoadingStudents } =
    useTeacherOfferingStudents(
      primaryOffering?.id,
      { page: 1, perPage: 1 },
      { enabled: Boolean(primaryOffering?.id) }
    );

  const enrolledCount =
    studentsResponse?.meta?.totalRecords ??
    studentsResponse?.data?.length ??
    0;

  const isMenuOpen = openMenuCourseId === courseId;

  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between h-full relative">
      <div className="space-y-3">
        {/* Top Header: Code, Batch Tags & 3-dots More Menu */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-primary-900 text-secondary-500 text-xs font-mono font-bold">
              {course.code || "COURSE"}
            </span>

            {matchingOfferings.length > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200/70">
                {matchingOfferings.length === 1
                  ? primaryOffering.batchCode || "Batch A"
                  : `${matchingOfferings.length} Active Batches`}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                No Batches Scheduled
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Three Dots More Menu */}
            <div className="relative teacher-course-menu">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuCourseId(isMenuOpen ? null : courseId);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Course Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-30 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenuCourseId(null);
                      onCreateOffering(course);
                    }}
                    className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-amber-50 hover:text-amber-800 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-600" />
                    <span>New Course Offering</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenuCourseId(null);
                      onViewStudents(course, matchingOfferings);
                    }}
                    className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    <span>View Enrolled Students</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenuCourseId(null);
                      onTakeAttendance(primaryOffering || course);
                    }}
                    className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Take Attendance</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Course Title & Overview */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-950 leading-snug">
            {course.title || "Untitled Course"}
          </h3>
          {course.description && (
            <p className="mt-2 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100 line-clamp-3">
              {course.description}
            </p>
          )}
        </div>

        {/* Offering Details (Schedule & Duration) */}
        {primaryOffering && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
            {primaryOffering.startTime && (
              <div className="flex items-center gap-2 text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">
                  Starts: {primaryOffering.startTime}
                </span>
              </div>
            )}
            {primaryOffering.duration && (
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">
                  {primaryOffering.duration} Mins / {primaryOffering.sessions || 12} Sessions
                </span>
              </div>
            )}
          </div>
        )}

        {/* Live Enrolled Students Counter */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              <span>Enrolled Students</span>
            </span>
            <span className="font-bold text-slate-900 font-mono">
              {isLoadingStudents ? (
                <span className="text-slate-400">Loading...</span>
              ) : (
                `${enrolledCount} ${enrolledCount === 1 ? "student" : "students"}`
              )}
            </span>
          </div>

          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-secondary-500 transition-all duration-500"
              style={{
                width: `${Math.min((enrolledCount / 50) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        {primaryOffering ? (
          <button
            type="button"
            onClick={() => onTakeAttendance(primaryOffering || course)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Take Attendance
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onCreateOffering(course)}
            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-amber-600" />
            <span>Schedule Batch</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onViewStudents(course, matchingOfferings)}
          className="px-3.5 py-2 rounded-xl bg-primary-900 hover:bg-primary-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>View Students</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-secondary-500" />
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// Enrolled Students Modal Content (Lists Students from Endpoint)
// =============================================================================
function CourseStudentsRosterModal({ target, onClose }) {
  const { course, offerings = [] } = target;

  // Selected offering state for filtering by batch
  const [selectedOfferingId, setSelectedOfferingId] = useState(
    offerings[0]?.id || null
  );
  const [page, setPage] = useState(1);
  const perPage = 10;

  const currentOffering =
    offerings.find((o) => String(o.id) === String(selectedOfferingId)) ||
    offerings[0];

  // Fetch enrolled students for the selected course offering
  const {
    data: studentsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useTeacherOfferingStudents(
    selectedOfferingId,
    { page, perPage },
    { enabled: Boolean(selectedOfferingId) }
  );

  const students = studentsResponse?.data || [];
  const meta = studentsResponse?.meta || {};
  const total = meta.totalRecords ?? students.length;
  const totalPages = meta.totalPages ?? 1;

  return (
    <div className="space-y-4">
      {/* Batch / Offering Selector (if course has multiple offerings) */}
      {offerings.length > 1 && (
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Select Batch Offering
          </label>
          <select
            value={selectedOfferingId}
            onChange={(e) => {
              setSelectedOfferingId(Number(e.target.value));
              setPage(1);
            }}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500"
          >
            {offerings.map((off) => (
              <option key={off.id} value={off.id}>
                {off.batchCode || `Offering #${off.id}`} ({off.duration || 90} Mins)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Roster Header Stat */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
        <span className="text-slate-600 font-medium flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-indigo-500" />
          <span>
            {currentOffering?.batchCode
              ? `Batch: ${currentOffering.batchCode}`
              : "Course Cohort"}
          </span>
        </span>
        <span className="px-2.5 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700">
          {isLoading ? "..." : `${total} Enrolled ${total === 1 ? "Student" : "Students"}`}
        </span>
      </div>

      {/* Student List Body */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">
            Loading enrolled students...
          </p>
        </div>
      ) : isError ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-2">
          <AlertCircle className="w-6 h-6 text-rose-500 mx-auto" />
          <p className="text-xs text-rose-700">
            {error?.response?.data?.message ||
              "Failed to load students for this offering."}
          </p>
          <Button size="xs" variant="outline" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      ) : !selectedOfferingId ? (
        <div className="py-10 text-center text-slate-400 space-y-2">
          <Layers className="w-8 h-8 mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">
            No active offering scheduled
          </p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Students enroll directly into course offerings/batches. Create an offering to enroll students.
          </p>
        </div>
      ) : students.length === 0 ? (
        <div className="py-10 text-center text-slate-400 space-y-2">
          <Users className="w-8 h-8 mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">
            No students enrolled yet
          </p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            When students register for this course offering, their names and records will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
          {students.map((student) => {
            const studentId = student.id || student.studentId || student.userId;
            const fullName =
              `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
              student.email ||
              "Student";
            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
              fullName
            )}&background=e0e7ff&color=4338ca&bold=true`;

            return (
              <div
                key={studentId}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-white transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={avatarUrl}
                    alt={fullName}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {fullName}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate font-mono">
                      {student.email}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className="font-mono text-[10px] text-slate-400 block">
                    ID #{studentId}
                  </span>
                  {student.role?.name && (
                    <span className="text-[10px] uppercase font-semibold text-indigo-600">
                      {student.role.name}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              size="xs"
              variant="outline"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              size="xs"
              variant="outline"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <div className="pt-3 border-t border-slate-100 flex justify-end">
        <Button size="sm" variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}

// =============================================================================
// Create Offering Modal (Schedules a batch for one of the teacher's courses)
// =============================================================================
function CreateOfferingModal({ courses = [], initialCourseId, onClose }) {
  const { showToast } = useToast();
  const [courseId, setCourseId] = useState(() => {
    if (initialCourseId) return String(initialCourseId);
    return courses[0]?.id != null ? String(courses[0].id) : "";
  });
  const initialCourse =
    courses.find((c) => String(c.id) === String(initialCourseId)) || courses[0];

  const [batchCode, setBatchCode] = useState(() =>
    initialCourse ? suggestBatchCode(initialCourse) : ""
  );
  const [classDate, setClassDate] = useState(todayInputValue);
  const [startTime, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState(90);
  const [sessions, setSessions] = useState(12);
  const [formError, setFormError] = useState("");

  const selectedCourse = courses.find((c) => String(c.id) === String(courseId));

  const createOfferingMutation = useCreateTeacherOffering({
    onSuccess: () => {
      showToast?.("Course offering created successfully.", "success");
      onClose?.();
    },
    onError: (err) => {
      setFormError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to create the course offering."
      );
    },
  });

  const handleCourseChange = (value) => {
    setCourseId(value);
    setFormError("");
    // Only re-suggest the batch code when the field is still the previous suggestion.
    const previousSuggestion = initialCourse ? suggestBatchCode(initialCourse) : "";
    if (!batchCode.trim() || batchCode === previousSuggestion) {
      const nextCourse = courses.find((c) => String(c.id) === String(value));
      setBatchCode(nextCourse ? suggestBatchCode(nextCourse) : "");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const trimmedBatchCode = batchCode.trim();
    const durationNumber = Number(duration);
    const sessionsNumber = Number(sessions);

    if (!courseId) {
      setFormError("Please select the course this offering belongs to.");
      return;
    }
    if (!trimmedBatchCode) {
      setFormError("Batch code is required.");
      return;
    }
    if (trimmedBatchCode.length > MAX_BATCH_CODE_LENGTH) {
      setFormError(
        `Batch code must be at most ${MAX_BATCH_CODE_LENGTH} characters.`
      );
      return;
    }
    if (!classDate || !startTime) {
      setFormError("Class date and start time are required.");
      return;
    }

    const startDateTime = new Date(`${classDate}T${startTime}:00`);
    if (isNaN(startDateTime.getTime())) {
      setFormError("Invalid class date or start time.");
      return;
    }
    if (!Number.isFinite(durationNumber) || durationNumber <= 0) {
      setFormError("Duration must be greater than 0 minutes.");
      return;
    }
    if (!Number.isFinite(sessionsNumber) || sessionsNumber <= 0) {
      setFormError("Number of sessions must be greater than 0.");
      return;
    }

    try {
      await createOfferingMutation.mutateAsync({
        courseId: Number(courseId),
        payload: {
          batchCode: trimmedBatchCode,
          // Backend expects RFC3339 timestamps for both fields.
          classDate: new Date(`${classDate}T00:00:00`).toISOString(),
          startTime: startDateTime.toISOString(),
          duration: durationNumber,
          sessions: sessionsNumber,
        },
      });
    } catch {
      // Error surfaced through onError.
    }
  };

  const isSubmitting = createOfferingMutation.isPending;

  if (courses.length === 0) {
    return (
      <div className="space-y-4">
        <div className="py-10 text-center space-y-2">
          <Layers className="w-8 h-8 mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">
            No courses available
          </p>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Offerings are scheduled against a course. Once a course is created
            or assigned to you, you can schedule a batch here.
          </p>
        </div>
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <Button size="sm" variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      {/* Course */}
      <div>
        <label
          htmlFor="offering-course"
          className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
        >
          Course *
        </label>
        <select
          id="offering-course"
          value={courseId}
          onChange={(e) => handleCourseChange(e.target.value)}
          disabled={isSubmitting || Boolean(initialCourseId)}
          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
        >
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.code ? `${course.code} - ` : ""}
              {course.title || `Course #${course.id}`}
            </option>
          ))}
        </select>
        {initialCourseId && (
          <p className="text-[11px] text-slate-500 mt-1">
            This offering will be scheduled for the selected course.
          </p>
        )}
      </div>

      {/* Batch code */}
      <div>
        <label
          htmlFor="offering-batch-code"
          className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
        >
          Batch Code *
        </label>
        <input
          id="offering-batch-code"
          type="text"
          required
          maxLength={MAX_BATCH_CODE_L ENGTH}
          value={batchCode}
          onChange={(e) => {
            setBatchCode(e.target.value);
            setFormError("");
          }}
          placeholder="e.g. CSC101-A"
          disabled={isSubmitting}
          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
        />
        <p className="text-[11px] text-slate-500 mt-1">
          Up to {MAX_BATCH_CODE_LENGTH} characters, unique across all batches (
          {batchCode.trim().length}/{MAX_BATCH_CODE_LENGTH}).
        </p>
      </div>

      {/* Class date & start time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="offering-class-date"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Class Date *
          </label>
          <input
            id="offering-class-date"
            type="date"
            required
            value={classDate}
            onChange={(e) => {
              setClassDate(e.target.value);
              setFormError("");
            }}
            disabled={isSubmitting}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="offering-start-time"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Start Time *
          </label>
          <input
            id="offering-start-time"
            type="time"
            required
            value={startTime}
            onChange={(e) => {
              setStartTime(e.target.value);
              setFormError("");
            }}
            disabled={isSubmitting}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Duration & sessions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="offering-duration"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Duration (minutes) *
          </label>
          <input
            id="offering-duration"
            type="number"
            min={1}
            required
            value={duration}
            onChange={(e) => {
              setDuration(e.target.value);
              setFormError("");
            }}
            disabled={isSubmitting}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="offering-sessions"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Number of Sessions *
          </label>
          <input
            id="offering-sessions"
            type="number"
            min={1}
            required
            value={sessions}
            onChange={(e) => {
              setSessions(e.target.value);
              setFormError("");
            }}
            disabled={isSubmitting}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-center gap-2">
        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
        <span>
          {selectedCourse?.code || "Course"} • {sessions || 0} session
          {Number(sessions) === 1 ? "" : "s"} × {duration || 0} mins
        </span>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          disabled={isSubmitting}
          onClick={onClose}
          className="cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          iconLeft={
            isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )
          }
          className="cursor-pointer"
        >
          {isSubmitting ? "Scheduling..." : "Create Offering"}
        </Button>
      </div>
    </form>
  );
}

// =============================================================================
// Main TeacherCoursesPage Component
// =============================================================================
export default function TeacherCoursesPage() {
  const { setIsNewCourseModalOpen, setIsAttendanceModalOpen } = useUIStore();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 20;

  // Track 3-dots card menu state
  const [openMenuCourseId, setOpenMenuCourseId] = useState(null);

  // Track which course is selected for the "View Students" modal
  const [targetCourseForStudents, setTargetCourseForStudents] = useState(null);

  // Create offering (batch) modal: null = closed, { courseId } or { courseId: null } when open
  const [offeringTargetCourseId, setOfferingTargetCourseId] = useState(null);
  const [isCreateOfferingOpen, setIsCreateOfferingOpen] = useState(false);

  const openCreateOffering = (course = null) => {
    setOpenMenuCourseId(null);
    setOfferingTargetCourseId(course?.id ?? null);
    setIsCreateOfferingOpen(true);
  };

  const closeCreateOffering = () => {
    setIsCreateOfferingOpen(false);
    setOfferingTargetCourseId(null);
  };

  // Close 3-dots menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".teacher-course-menu")) {
        setOpenMenuCourseId(null);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  // ---------------------------------------------------------------------------
  // 1. Fetch Teacher Courses (GET /api/teacher/courses)
  // ---------------------------------------------------------------------------
  const {
    data: coursesResponse,
    isLoading: isLoadingCourses,
    isError: isCoursesError,
    error: coursesError,
    refetch: refetchCourses,
    isFetching,
  } = useTeacherCourses({ page, perPage });

  const courses = useMemo(() => {
    if (!coursesResponse) return [];
    if (Array.isArray(coursesResponse.data)) return coursesResponse.data;
    if (Array.isArray(coursesResponse)) return coursesResponse;
    return [];
  }, [coursesResponse]);

  const meta = coursesResponse?.meta || {
    page,
    perPage,
    totalPages: 1,
    totalRecords: courses.length,
  };

  // ---------------------------------------------------------------------------
  // 2. Fetch Teacher Offerings (GET /api/teacher/offerings)
  // ---------------------------------------------------------------------------
  const { data: offeringsResponse } = useTeacherOfferings({ perPage: 50 });
  const offerings = useMemo(() => {
    if (!offeringsResponse) return [];
    if (Array.isArray(offeringsResponse.data)) return offeringsResponse.data;
    if (Array.isArray(offeringsResponse)) return offeringsResponse;
    return [];
  }, [offeringsResponse]);

  // Client-side search filter
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses;
    const q = searchQuery.toLowerCase().trim();
    return courses.filter((c) => {
      const code = (c.code || "").toLowerCase();
      const title = (c.title || "").toLowerCase();
      const desc = (c.description || "").toLowerCase();
      return code.includes(q) || title.includes(q) || desc.includes(q);
    });
  }, [courses, searchQuery]);

  const handleRefresh = async () => {
    await refetchCourses();
    showToast?.("Course curriculum refreshed.", "success");
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-50 text-amber-900 border border-amber-200/80 mb-2">
            <span className="w-2 h-2 rounded-full bg-secondary-500" />
            <span>FACULTY CURRICULUM</span>
            <span className="text-amber-400">•</span>
            <span>{meta.totalRecords} Assigned Courses</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            Course Curriculum & Syllabi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your courses, view enrolled cohorts, and schedule course batches.
          </p>
        </div>

        {/* Global Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isFetching}
            className="p-2.5 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            title="Refresh courses"
          >
            <RotateCw
              className={`w-4 h-4 ${isFetching ? "animate-spin text-secondary-500" : ""}`}
            />
          </button>

          <button
            type="button"
            onClick={() => openCreateOffering(null)}
            disabled={courses.length === 0}
            className="px-4 py-2.5 rounded-xl bg-primary-900 hover:bg-primary-950 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-slate-900/10 transition-all cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4 text-secondary-500" />
            <span>New Course Offering</span>
          </button>
        </div>
      </div>

      {/* 2. Search Filter */}
      <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by course code, title, or description..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary-500 transition-colors"
          />
        </div>
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="text-xs text-slate-500 hover:text-slate-900 font-semibold px-2 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* 3. Loading State */}
      {isLoadingCourses && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-secondary-500 mx-auto" />
          <p className="text-sm font-bold text-slate-700">
            Loading your courses...
          </p>
        </div>
      )}

      {/* 4. Error State */}
      {!isLoadingCourses && isCoursesError && (
        <div className="p-8 text-center bg-white rounded-3xl border border-rose-200 shadow-xs space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-sm font-bold text-slate-900">
            {coursesError?.response?.data?.message ||
              coursesError?.message ||
              "Failed to load courses."}
          </p>
          <Button size="sm" variant="outline" onClick={() => refetchCourses()}>
            Try Again
          </Button>
        </div>
      )}

      {/* 5. Empty State */}
      {!isLoadingCourses && !isCoursesError && filteredCourses.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-950">
            {searchQuery ? "No matching courses found" : "No Courses Assigned Yet"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No course matches "${searchQuery}". Try another keyword.`
              : "Courses you create or that are assigned to you by the administration will appear here."}
          </p>
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold cursor-pointer transition-colors"
            >
              Clear Search
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsNewCourseModalOpen?.(true)}
              className="px-4 hidden py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer hover:bg-slate-800 transition-colors"
            >
              Create First Course
            </button>
          )}
        </div>
      )}

      {/* 6. Course Cards Grid */}
      {!isLoadingCourses && !isCoursesError && filteredCourses.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredCourses.map((course, idx) => (
            <ScrollReveal key={course.id} delay={idx * 0.05}>
              <TeacherCourseCardItem
                course={course}
                offerings={offerings}
                onViewStudents={(c, offs) =>
                  setTargetCourseForStudents({ course: c, offerings: offs })
                }
                onTakeAttendance={() => setIsAttendanceModalOpen?.(true)}
                onCreateOffering={openCreateOffering}
                openMenuCourseId={openMenuCourseId}
                setOpenMenuCourseId={setOpenMenuCourseId}
                showToast={showToast}
              />
            </ScrollReveal>
          ))}
        </div>
      )}

      {/* 7. Pagination Controls */}
      {!isLoadingCourses && !isCoursesError && meta.totalPages > 1 && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between text-xs text-slate-600">
          <span>
            Page <strong className="text-slate-900">{meta.page}</strong> of{" "}
            <strong className="text-slate-900">{meta.totalPages}</strong> (
            {meta.totalRecords} total courses)
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
              onClick={() =>
                setPage((prev) => Math.min(meta.totalPages, prev + 1))
              }
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 8. Enrolled Students Modal */}
      <Modal
        isOpen={Boolean(targetCourseForStudents)}
        onClose={() => setTargetCourseForStudents(null)}
        title="Enrolled Students Roster"
        subtitle={
          targetCourseForStudents?.course
            ? `${targetCourseForStudents.course.code || ""} - ${
                targetCourseForStudents.course.title || "Course Roster"
              }`
            : "Course Students"
        }
      >
        {targetCourseForStudents && (
          <CourseStudentsRosterModal
            target={targetCourseForStudents}
            onClose={() => setTargetCourseForStudents(null)}
          />
        )}
      </Modal>

      {/* 9. Create Course Offering Modal */}
      <Modal
        isOpen={isCreateOfferingOpen}
        onClose={closeCreateOffering}
        title="Create Course Offering"
        subtitle={
          offeringTargetCourseId
            ? `${
                courses.find(
                  (c) => String(c.id) === String(offeringTargetCourseId)
                )?.code || ""
              } - Schedule a new batch for this course`
            : "Schedule a new batch students can enroll in"
        }
      >
        {isCreateOfferingOpen && (
          <CreateOfferingModal
            key={offeringTargetCourseId ?? "any"}
            courses={courses}
            initialCourseId={offeringTargetCourseId}
            onClose={closeCreateOffering}
          />
        )}
      </Modal>
    </div>
  );
}