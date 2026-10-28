import React, { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import {
  BookPlus,
  Clock,
  MapPin,
  UserCheck,
  Trash2,
  Pencil,
  Calendar,
  History,
  RotateCcw,
  Loader2,
  AlertCircle,
  RefreshCw,
  Search,
  MoreVertical,
  Users,
  GraduationCap,
} from "lucide-react";
import { useUIStore } from "../../shared/store/useUIStore";
import useToast from "../../shared/hooks/useToast";
import { Card } from "../../shared/components/Card";
import { Button } from "../../shared/components/Button";
import { Badge } from "../../shared/components/Badge";
import { Modal } from "../../shared/components/Modal";
import { ScrollReveal } from "../../shared/components/ScrollReveal";
import { EmptyState } from "../../shared/components/EmptyState";
import { formatCourseDate } from "../../shared/utils/date";

// TanStack Query Hooks
import {
  useAdminCourses,
  useDeleteCourse,
  useRestoreCourse,
  useAdminCourseStudents,
  useAdminCourseTeachers,
} from "../../shared/hooks/useAdmin";

// Defensive ID extractor (handles _id, id, courseId)
const getCourseId = (course) =>
  course?.id ?? course?._id ?? course?.courseId;

// Helper to check if a course is deleted
const isCourseDeleted = (course) => {
  if (!course) return false;
  return Boolean(
    course.isDeleted === true ||
    course.is_deleted === true ||
    course.deletedAt ||
    course.deleted_at ||
    course.status === "Deleted" ||
    course.status === "Archived"
  );
};

// Safe normalizer for API list responses
const normalizeCourses = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.courses)) return data.courses;
  if (Array.isArray(data.data)) return data.data;
  return [];
};

// Helper to format teacher name from API
const getTeacherName = (t) => {
  if (!t) return "";
  const first = t.firstName || t.first_name || "";
  const last = t.lastName || t.last_name || "";
  const full = `${first} ${last}`.trim();
  return full || t.name || t.email || `Teacher #${t.id}`;
};

// =============================================================================
// Individual Course Card Component (Calls endpoints for students & teachers)
// =============================================================================
function CourseCardItem({
  course,
  isDel,
  onOpenDelete,
  onRestore,
  onEdit,
  onViewStudents,
  isCurrentRestoring,
  openMenuCourseId,
  setOpenMenuCourseId,
}) {
  const courseId = getCourseId(course);

  // 1. Fetch Students enrolled in this course (for count)
  const { data: studentsResponse, isLoading: isLoadingStudents } =
    useAdminCourseStudents(
      courseId,
      { page: 1, perPage: 1 },
      { enabled: Boolean(courseId) && !isDel }
    );

  // 2. Fetch Teachers in charge of this course
  const { data: teachersResponse, isLoading: isLoadingTeachers } =
    useAdminCourseTeachers(
      courseId,
      { page: 1, perPage: 5 },
      { enabled: Boolean(courseId) && !isDel }
    );

  // Resolve live enrolled count (falls back to course object if available)
  const enrolledCount =
    studentsResponse?.meta?.totalRecords ??
    studentsResponse?.data?.length ??
    course.enrolledCount ??
    0;

  // Resolve teacher in charge
  const teachers = teachersResponse?.data || [];
  const primaryTeacher = teachers[0];
  const teacherName = primaryTeacher
    ? getTeacherName(primaryTeacher)
    : course.instructorName || null;

  // Capacity calculations
  const maxCapacity = course.maxCapacity || 0;
  const hasCapacity = maxCapacity > 0;
  const fillPercentage = hasCapacity
    ? Math.round((enrolledCount / maxCapacity) * 100)
    : 0;
  const isFull = hasCapacity ? enrolledCount >= maxCapacity : false;

  return (
    <Card
      hoverEffect
      className={`p-5 flex flex-col justify-between h-full group border-slate-200/90 shadow-xs hover:shadow-md transition-all ${
        isDel ? "opacity-75 bg-slate-50/60" : ""
      }`}
    >
      <div>
        {/* Header: Code, ID Badge, Credits, Status & 3-dots Menu */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-primary-900 text-secondary-500 border border-slate-800 shadow-xs">
              {course.code}
            </span>
            <span
              className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60"
              title={`Database Identifier: ${courseId}`}
            >
              ID #{courseId}
            </span>
            {course.credits && (
              <span className="text-xs text-slate-400 font-medium">
                {course.credits} Credits
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Badge
              variant={
                isDel
                  ? "rose"
                  : course.status === "Active"
                  ? "emerald"
                  : course.status === "Upcoming"
                  ? "amber"
                  : "blue"
              }
              size="sm"
            >
              {isDel ? "Deleted" : course.status || "Active"}
            </Badge>

            {/* 3-dots More Menu button */}
            {!isDel && (
              <div className="relative course-card-menu">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuCourseId(
                      openMenuCourseId === courseId ? null : courseId
                    );
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Course options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {openMenuCourseId === courseId && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenuCourseId(null);
                        onViewStudents(course);
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                      <span>View Students</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenuCourseId(null);
                        onEdit(course);
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5 text-slate-400" />
                      <span>Edit Course</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Course Title */}
        <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
          {course.title}
        </h3>

        {/* Department (if available) */}
        {course.department && (
          <p className="mt-1 text-xs text-slate-400 font-medium">
            {course.department}
          </p>
        )}

        {/* Course Description */}
        {course.description && (
          <p className="mt-2.5 text-xs text-slate-600 line-clamp-3 leading-relaxed bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
            {course.description}
          </p>
        )}

        {/* Teacher in Charge & Meta Info from Endpoint */}
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
          {/* Teacher in Charge */}
          <div className="flex items-center gap-2">
            <UserCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="truncate">
              {isLoadingTeachers ? (
                <span className="text-slate-400 italic">Resolving instructor...</span>
              ) : teacherName ? (
                <span className="font-semibold text-slate-800">
                  {teacherName}
                  {teachers.length > 1 && (
                    <span className="text-slate-400 font-normal ml-1">
                      (+{teachers.length - 1} more)
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-slate-400 italic">No instructor assigned</span>
              )}
            </span>
          </div>

          {course.schedule && (
            <div className="flex items-center gap-2 text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{course.schedule}</span>
            </div>
          )}
          {course.room && (
            <div className="flex items-center gap-2 text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{course.room}</span>
            </div>
          )}
        </div>
      </div>

      {/* Lower Section: Enrolled Students Count, Capacity Bar & Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
        {/* Number of Students Enrolled (from endpoint) */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Enrolled Students</span>
            </span>

            <span
              className={`font-bold ${
                isFull ? "text-amber-600" : "text-slate-800"
              }`}
            >
              {isLoadingStudents ? (
                "..."
              ) : hasCapacity ? (
                `${enrolledCount} / ${maxCapacity} seats (${fillPercentage}%)`
              ) : (
                `${enrolledCount} ${enrolledCount === 1 ? "student" : "students"}`
              )}
            </span>
          </div>

          {/* Progress bar if maxCapacity is configured */}
          {hasCapacity && (
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{
                  width: `${Math.min(fillPercentage, 100)}%`,
                }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  isFull
                    ? "bg-amber-500"
                    : fillPercentage > 80
                    ? "bg-indigo-600"
                    : "bg-emerald-500"
                }`}
              />
            </div>
          )}
        </div>

        {/* Tracking & Timestamps */}
        {(course.createdAt || course.updatedAt) && (
          <div className="bg-slate-50/90 rounded-xl p-2.5 border border-slate-200/70 text-[11px] space-y-1.5">
            {course.createdAt && (
              <div className="flex items-center justify-between text-slate-500">
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Created:
                </span>
                <span
                  className="font-mono text-slate-700 font-semibold"
                  title={`Exact ISO: ${course.createdAt}`}
                >
                  {formatCourseDate(course.createdAt)}
                </span>
              </div>
            )}
            {course.updatedAt && (
              <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-200/50">
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                  <History className="w-3.5 h-3.5 text-indigo-500" />
                  Updated:
                </span>
                <span
                  className="font-mono text-slate-700 font-semibold"
                  title={`Exact ISO: ${course.updatedAt}`}
                >
                  {formatCourseDate(course.updatedAt)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-1">
          {isDel ? (
            <Button
              size="xs"
              variant="outline"
              disabled={isCurrentRestoring}
              iconLeft={
                isCurrentRestoring ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                ) : (
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                )
              }
              onClick={() => onRestore(course)}
              className="w-full text-xs font-semibold text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100 border-emerald-200/80 hover:border-emerald-300 shadow-none cursor-pointer justify-center"
            >
              {isCurrentRestoring ? "Restoring..." : "Restore Course"}
            </Button>
          ) : (
            <>
              <Button
                size="xs"
                variant="outline"
                iconLeft={<Users className="w-3.5 h-3.5 text-indigo-600" />}
                onClick={() => onViewStudents(course)}
                className="text-xs font-semibold text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100/80 border-indigo-200/80 hover:border-indigo-300 shadow-none cursor-pointer"
              >
                View Students
              </Button>

              <div className="flex items-center gap-1">
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => onEdit(course)}
                  className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                  title="Edit Course"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>

                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => onOpenDelete(course)}
                  className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                  title="Delete Course"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

// =============================================================================
// View Students Modal Content Component
// =============================================================================
function CourseStudentsModalContent({ course, onClose }) {
  const [page, setPage] = useState(1);
  const courseId = getCourseId(course);

  const {
    data: studentsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useAdminCourseStudents(
    courseId,
    { page, perPage: 10 },
    { enabled: Boolean(courseId) }
  );

  const students = studentsResponse?.data || [];
  const meta = studentsResponse?.meta || {};
  const total = meta.totalRecords ?? students.length;
  const totalPages = meta.totalPages ?? 1;

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
        <span className="text-slate-600 font-medium flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-indigo-500" />
          Enrolled Student Count:
        </span>
        <span className="px-2.5 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700">
          {isLoading ? "..." : `${total} ${total === 1 ? "Student" : "Students"}`}
        </span>
      </div>

      {/* Body States */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">
            Fetching enrolled students...
          </p>
        </div>
      ) : isError ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-center space-y-2">
          <AlertCircle className="w-6 h-6 text-rose-500 mx-auto" />
          <p className="text-xs text-rose-700">
            {error?.response?.data?.message ||
              "Failed to load students for this course."}
          </p>
          <Button size="xs" variant="outline" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      ) : students.length === 0 ? (
        <div className="py-10 text-center text-slate-400 space-y-2">
          <Users className="w-8 h-8 mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">
            No students enrolled yet
          </p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Once students register or are enrolled into batches for this course,
            they will be listed here.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
          {students.map((student) => {
            const studentId = student.id || student.userId;
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
                    <p className="text-[11px] text-slate-500 truncate">
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

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 flex justify-end">
        <Button size="sm" variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}

// =============================================================================
// Main CoursesView Component
// =============================================================================
export default function CoursesView() {
  const { openModal } = useUIStore();
  const { showToast } = useToast();

  // Search state
  const [localSearch, setLocalSearch] = useState("");
  const searchQuery = localSearch;
  const setSearchQuery = setLocalSearch;

  // Filter tabs: "All" (Active) | "Deleted"
  const [activeTab, setActiveTab] = useState("All");
  const [actioningId, setActioningId] = useState(null);

  // Modal tracking state
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [selectedCourseForStudents, setSelectedCourseForStudents] = useState(null);
  const [openMenuCourseId, setOpenMenuCourseId] = useState(null);

  // Close card menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".course-card-menu")) {
        setOpenMenuCourseId(null);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  // ---------------------------------------------------------------------------
  // 1. Fetch Courses
  // ---------------------------------------------------------------------------
  const {
    data: activeCoursesData,
    isLoading: isLoadingActive,
    isError: isErrorActive,
    error: errorActive,
    refetch: refetchActive,
  } = useAdminCourses({ isDeleted: false });

  const {
    data: deletedCoursesData,
    isLoading: isLoadingDeleted,
    isError: isErrorDeleted,
    error: errorDeleted,
    refetch: refetchDeleted,
  } = useAdminCourses({ isDeleted: true });

  const activeCourses = useMemo(() => {
    const list = normalizeCourses(activeCoursesData);
    return list.filter((c) => !isCourseDeleted(c));
  }, [activeCoursesData]);

  const deletedCourses = useMemo(() => {
    const list = normalizeCourses(deletedCoursesData);
    return list.filter((c) => isCourseDeleted(c));
  }, [deletedCoursesData]);

  const counts = useMemo(
    () => ({
      all: activeCourses.length,
      deleted: deletedCourses.length,
    }),
    [activeCourses, deletedCourses]
  );

  const currentCourses =
    activeTab === "Deleted" ? deletedCourses : activeCourses;

  const filteredCourses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return currentCourses;

    return currentCourses.filter((course) => {
      const code = (course.code || "").toLowerCase();
      const title = (course.title || "").toLowerCase();
      const desc = (course.description || "").toLowerCase();
      const instructor = (course.instructorName || "").toLowerCase();
      const dept = (course.department || "").toLowerCase();
      const id = String(getCourseId(course) || "").toLowerCase();

      return (
        title.includes(q) ||
        code.includes(q) ||
        desc.includes(q) ||
        instructor.includes(q) ||
        dept.includes(q) ||
        id.includes(q)
      );
    });
  }, [currentCourses, searchQuery]);

  // ---------------------------------------------------------------------------
  // 2. Mutations
  // ---------------------------------------------------------------------------
  const { mutate: deleteCourseMutation, isPending: isDeleting } =
    useDeleteCourse({
      onSuccess: () => {
        setCourseToDelete(null);
        showToast?.("Course moved to deleted bin.", "success");
      },
    });

  const { mutate: restoreCourseMutation } = useRestoreCourse({
    onSuccess: () => {
      setActioningId(null);
      showToast?.("Course restored successfully.", "success");
    },
    onError: () => setActioningId(null),
  });

  const handleOpenDeleteModal = (course) => setCourseToDelete(course);
  const handleCloseDeleteModal = () => !isDeleting && setCourseToDelete(null);

  const handleConfirmDelete = () => {
    if (!courseToDelete) return;
    const targetId = getCourseId(courseToDelete);
    if (targetId) deleteCourseMutation(targetId);
  };

  const handleRestore = (course) => {
    const targetId = getCourseId(course);
    if (!targetId) return;
    setActioningId(targetId);
    restoreCourseMutation(targetId);
  };

  // ---------------------------------------------------------------------------
  // 3. Loading & Error States
  // ---------------------------------------------------------------------------
  const isLoading =
    activeTab === "Deleted" ? isLoadingDeleted : isLoadingActive;
  const isError =
    activeTab === "Deleted" ? isErrorDeleted : isErrorActive;
  const currentError =
    activeTab === "Deleted" ? errorDeleted : errorActive;
  const currentRefetch =
    activeTab === "Deleted" ? refetchDeleted : refetchActive;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading courses...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="p-8 text-center max-w-lg mx-auto my-12 border-rose-200 bg-rose-50/40">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900">
          Failed to load courses
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          {currentError?.response?.data?.message ||
            currentError?.message ||
            "An error occurred while fetching courses."}
        </p>
        <Button
          variant="outline"
          size="sm"
          iconLeft={<RefreshCw className="w-4 h-4" />}
          onClick={() => currentRefetch()}
          className="mx-auto cursor-pointer"
        >
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Title with Orange Category Tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            Course Catalog & Curriculum
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Define course codes, syllabus definitions, credit weighting, and batch offerings.
          </p>
        </div>
      </div>

      {/* 2. Header controls & filter tabs */}
      <ScrollReveal delay={0.05}>
        <Card className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("All")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === "All"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>Active</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === "All"
                      ? "bg-amber-500/20 text-secondary-400 border border-amber-400/30"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {counts.all}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("Deleted")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === "Deleted"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>Deleted</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === "Deleted"
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {counts.deleted}
                </span>
              </button>
            </div>

            {/* Actions: Search & Add Course */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500 focus:outline-none transition-colors"
                />
              </div>

              {activeTab === "All" && (
                <Button
                  variant="accent"
                  size="sm"
                  iconLeft={<BookPlus className="w-4 h-4 text-slate-950" />}
                  onClick={() => openModal?.("add-course")}
                  className="shrink-0 cursor-pointer"
                >
                  Add New Course
                </Button>
              )}
            </div>
          </div>
        </Card>
      </ScrollReveal>

      {/* Courses Cards Grid */}
      {filteredCourses.length === 0 ? (
        <EmptyState
          title={
            activeTab === "Deleted"
              ? "No deleted courses"
              : searchQuery
              ? "No courses match search"
              : "No courses found"
          }
          description={
            activeTab === "Deleted"
              ? "There are no courses currently in the deleted bin."
              : searchQuery
              ? `No course found matching "${searchQuery}".`
              : "Get started by creating your first academic course."
          }
          actionLabel={
            activeTab === "Deleted"
              ? "View Active Courses"
              : searchQuery
              ? "Reset Search"
              : "Add New Course"
          }
          onAction={() => {
            if (activeTab === "Deleted") {
              setActiveTab("All");
            } else if (searchQuery) {
              setSearchQuery("");
            } else {
              openModal?.("add-course");
            }
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredCourses.map((course, index) => {
            const courseId = getCourseId(course);
            const isDel = isCourseDeleted(course);
            const isCurrentRestoring = actioningId === courseId;

            return (
              <ScrollReveal
                key={courseId || index}
                delay={0.08 + (index % 3) * 0.06}
              >
                <CourseCardItem
                  course={course}
                  isDel={isDel}
                  onOpenDelete={handleOpenDeleteModal}
                  onRestore={handleRestore}
                  onEdit={(c) => openModal?.("edit-course", c)}
                  onViewStudents={(c) => setSelectedCourseForStudents(c)}
                  isCurrentRestoring={isCurrentRestoring}
                  openMenuCourseId={openMenuCourseId}
                  setOpenMenuCourseId={setOpenMenuCourseId}
                />
              </ScrollReveal>
            );
          })}
        </div>
      )}

      {/* View Enrolled Students Modal */}
      <Modal
        isOpen={Boolean(selectedCourseForStudents)}
        onClose={() => setSelectedCourseForStudents(null)}
        title="Enrolled Students"
        subtitle={
          selectedCourseForStudents
            ? `${selectedCourseForStudents.code ? `${selectedCourseForStudents.code} - ` : ""}${selectedCourseForStudents.title}`
            : "Course Enrolled Students"
        }
      >
        {selectedCourseForStudents && (
          <CourseStudentsModalContent
            course={selectedCourseForStudents}
            onClose={() => setSelectedCourseForStudents(null)}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(courseToDelete)}
        onClose={handleCloseDeleteModal}
        title="Delete Course"
        subtitle="Confirm course removal"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-bold text-slate-900">
              {courseToDelete?.code ? `${courseToDelete.code}: ` : ""}
              {courseToDelete?.title}
            </span>
            ? This course will be moved to the{" "}
            <span className="font-semibold text-rose-600">Deleted</span> tab
            where it can be restored.
          </p>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={isDeleting}
              onClick={handleCloseDeleteModal}
              className="cursor-pointer"
            >
              No, Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              iconLeft={
                isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )
              }
              className="bg-rose-600 hover:bg-rose-700 text-white border-transparent cursor-pointer"
            >
              {isDeleting ? "Deleting..." : "Yes, Delete Course"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}