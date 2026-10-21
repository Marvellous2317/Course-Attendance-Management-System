import { useState, useMemo } from "react";
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
} from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
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
} from "../../shared/hooks/useAdmin";

// Helper to reliably check if a course is deleted
const isCourseDeleted = (course) =>
  Boolean(course.isDeleted || course.deletedAt || course.status === "Deleted");

export default function CoursesView() {
  const adminContext = useAdmin?.() || {};
  const { openModal } = adminContext;

  // Search query support
  const [localSearch, setLocalSearch] = useState("");
  const searchQuery = adminContext.searchQuery ?? localSearch;
  const setSearchQuery = adminContext.setSearchQuery ?? setLocalSearch;

  // Filter tabs: "All" (Active) | "Deleted"
  const [activeTab, setActiveTab] = useState("All");
  const [actioningId, setActioningId] = useState(null);

  // State to track which course is currently selected for deletion
  const [courseToDelete, setCourseToDelete] = useState(null);

  // ---------------------------------------------------------------------------
  // API Queries & Mutations (Separate queries for Active and Deleted)
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

  const { mutate: deleteCourseMutation, isPending: isDeleting } =
    useDeleteCourse({
      onSuccess: () => {
        setCourseToDelete(null); // Close modal on success
      },
    });

  const { mutate: restoreCourseMutation, isPending: isRestoring } =
    useRestoreCourse({
      onSettled: () => setActioningId(null),
    });

  // Normalize API responses safely
  const normalizeCourses = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.courses)) return data.courses;
    if (Array.isArray(data.data)) return data.data;
    return [];
  };

  const activeCourses = useMemo(
    () => normalizeCourses(activeCoursesData),
    [activeCoursesData]
  );

  const deletedCourses = useMemo(
    () => normalizeCourses(deletedCoursesData),
    [deletedCoursesData]
  );

  // Tab counters (All/Active vs Deleted)
  const counts = useMemo(
    () => ({
      all: activeCourses.length,
      deleted: deletedCourses.length,
    }),
    [activeCourses, deletedCourses]
  );

  // The courses for the currently selected tab
  const currentCourses =
    activeTab === "Deleted" ? deletedCourses : activeCourses;

  // Filter courses based on search query
  const filteredCourses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return currentCourses;

    return currentCourses.filter((course) => {
      return (
        (course.title && course.title.toLowerCase().includes(q)) ||
        (course.code && course.code.toLowerCase().includes(q)) ||
        (course.description && course.description.toLowerCase().includes(q)) ||
        (course.instructorName &&
          course.instructorName.toLowerCase().includes(q)) ||
        (course.department && course.department.toLowerCase().includes(q))
      );
    });
  }, [currentCourses, searchQuery]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleOpenDeleteModal = (course) => {
    setCourseToDelete(course);
  };

  const handleCloseDeleteModal = () => {
    if (isDeleting) return;
    setCourseToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (!courseToDelete) return;
    const targetId = courseToDelete._id || courseToDelete.id;
    deleteCourseMutation(targetId);
  };

  const handleRestore = (course) => {
    const targetId = course._id || course.id;
    setActioningId(targetId);
    restoreCourseMutation(targetId);
  };

  // ---------------------------------------------------------------------------
  // Loading & Error States
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
      {/* Header controls & filter tabs: Active vs Deleted */}
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
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>Active</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === "All"
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {counts.all}
                </span>
              </button>

              {/* <button
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
              </button> */}
            </div>

            <Button
              variant="primary"
              size="sm"
              iconLeft={<BookPlus className="w-4 h-4" />}
              onClick={() => openModal?.("add-course")}
              className="shrink-0 self-end sm:self-auto cursor-pointer"
            >
              Add New Course
            </Button>
          </div>
        </Card>
      </ScrollReveal>

      {/* Courses Cards Grid */}
      {filteredCourses.length === 0 ? (
        <EmptyState
          title={
            activeTab === "Deleted"
              ? "No deleted courses"
              : "No courses found"
          }
          description={
            activeTab === "Deleted"
              ? "There are no courses currently in the deleted bin."
              : "Try adjusting your search term or add a new course."
          }
          actionLabel={
            activeTab === "Deleted" ? "View Active Courses" : "Reset Search"
          }
          onAction={() => {
            if (activeTab === "Deleted") {
              setActiveTab("All");
            }
            setSearchQuery("");
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredCourses.map((course, index) => {
            const courseId = course._id || course.id;
            const isDel =
              activeTab === "Deleted" || isCourseDeleted(course);
            const hasCapacity =
              course.enrolledCount !== undefined && course.maxCapacity;
            const fillPercentage = hasCapacity
              ? Math.round((course.enrolledCount / course.maxCapacity) * 100)
              : 0;
            const isFull = hasCapacity
              ? course.enrolledCount >= course.maxCapacity
              : false;

            const isCurrentRestoring =
              actioningId === courseId && isRestoring;

            return (
              <ScrollReveal
                key={courseId || index}
                delay={0.08 + (index % 3) * 0.06}
              >
                <Card
                  hoverEffect
                  className={`p-5 flex flex-col justify-between h-full group border-slate-200/90 shadow-xs hover:shadow-md transition-all ${
                    isDel ? "opacity-75 bg-slate-50/60" : ""
                  }`}
                >
                  <div>
                    {/* Header: Code, ID Badge, Credits & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/60 shadow-xs">
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

                    {/* Instructor & Location info */}
                    {(course.instructorName ||
                      course.schedule ||
                      course.room) && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                        {course.instructorName && (
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span className="font-semibold text-slate-800">
                              {course.instructorName}
                            </span>
                          </div>
                        )}
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
                    )}
                  </div>

                  {/* Lower Section: Capacity, Tracking Details & Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                    {/* Enrollment Capacity Progress Bar */}
                    {hasCapacity && (
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                          <span className="text-slate-500">
                            Enrollment Capacity
                          </span>
                          <span
                            className={`font-bold ${
                              isFull ? "text-amber-600" : "text-slate-800"
                            }`}
                          >
                            {course.enrolledCount} / {course.maxCapacity} seats (
                            {fillPercentage}%)
                          </span>
                        </div>

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
                      </div>
                    )}

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
                      {activeTab === "Deleted" ? (
                        /* When in Deleted tab: Restore Course button */
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
                          onClick={() => handleRestore(course)}
                          className="w-full text-xs font-semibold text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100 border-emerald-200/80 hover:border-emerald-300 shadow-none cursor-pointer justify-center"
                        >
                          {isCurrentRestoring
                            ? "Restoring..."
                            : "Restore Course"}
                        </Button>
                      ) : (
                        /* When in Active tab: Edit and Delete buttons */
                        <>
                          <Button
                            size="xs"
                            variant="outline"
                            iconLeft={
                              <Pencil className="w-3.5 h-3.5 text-indigo-600" />
                            }
                            onClick={() => openModal?.("edit-course", course)}
                            className="text-xs font-semibold text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100/80 border-indigo-200/80 hover:border-indigo-300 shadow-none cursor-pointer"
                          >
                            Edit Course
                          </Button>

                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => handleOpenDeleteModal(course)}
                            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Delete Course"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      )}

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
              No
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              iconLeft={
                isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null
              }
              className="bg-rose-600 hover:bg-rose-700 text-white border-transparent cursor-pointer"
            >
              {isDeleting ? "Deleting..." : "Yes"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}