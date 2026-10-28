import React, { useState, useMemo, useEffect, useDeferredValue } from "react";
import {
  UserPlus,
  Mail,
  GraduationCap,
  BookOpen,
  Trash2,
  Briefcase,
  Pencil,
  RotateCcw,
  Loader2,
  AlertCircle,
  RefreshCw,
  Search,
  MoreVertical,
  BookPlus,
  BookMinus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUIStore } from "../../shared/store/useUIStore";
import useToast from "../../shared/hooks/useToast";
import { Card } from "../../shared/components/Card";
import { Button } from "../../shared/components/Button";
import { Badge } from "../../shared/components/Badge";
import { Modal } from "../../shared/components/Modal";
import { ScrollReveal } from "../../shared/components/ScrollReveal";
import { EmptyState } from "../../shared/components/EmptyState";

// TanStack Query Hooks (All mutations and invalidations live here)
import {
  useAdminTeachers,
  useAdminTeacher,
  useDeleteTeacher,
  useRestoreTeacher,
  useAdminCourses,
  useAssignCoursesToTeacher,
  useUnassignCoursesFromTeacher,
} from "../../shared/hooks/useAdmin";

// Defensive ID extractor
const getTeacherId = (t) =>
  t?.id ??
  t?.teacherId ??
  t?._id ??
  t?.userId ??
  t?.user_id ??
  t?.user?.id ??
  t?.User?.id;

// Defensive Name extractor
const getTeacherName = (t) => {
  const firstName = t?.firstName ?? t?.first_name ?? t?.user?.firstName ?? "";
  const lastName = t?.lastName ?? t?.last_name ?? t?.user?.lastName ?? "";
  const combined = `${firstName} ${lastName}`.trim();
  return combined || t?.name || t?.user?.name || "Faculty Member";
};

// Fallback avatar with initials
const getTeacherAvatar = (t, name) => {
  if (
    t?.avatar &&
    typeof t.avatar === "string" &&
    t.avatar.startsWith("http")
  ) {
    return t.avatar;
  }
  const encodedName = encodeURIComponent(name || "Teacher");
  return `https://ui-avatars.com/api/?name=${encodedName}&background=6366f1&color=fff&bold=true`;
};

// Extracts assigned courses for a teacher and resolves codes/titles from coursesList
const getTeacherCourses = (teacher, allCourses = []) => {
  const raw =
    teacher?.courses ??
    teacher?.Courses ??
    teacher?.assignedCourses ??
    teacher?.courseIds ??
    teacher?.offerings ??
    teacher?.CourseOfferings ??
    [];

  if (!Array.isArray(raw)) return [];

  return raw.map((item) => {
    if (typeof item === "object" && item !== null) {
      const courseObj = item.course || item.Course || item;
      return {
        id: courseObj.id ?? courseObj._id ?? item.id,
        code: courseObj.code ?? "",
        title:
          courseObj.title ??
          courseObj.name ??
          `Course #${courseObj.id || item.id}`,
      };
    }

    const match = allCourses.find(
      (c) => String(c.id ?? c._id) === String(item),
    );
    return {
      id: item,
      code: match?.code ?? "",
      title: match?.title ?? `Course #${item}`,
    };
  });
};

// Number of courses assigned to a teacher. List responses only carry
// assignedCourseCount, so fall back to the resolved course list when absent.
const getTeacherCourseCount = (teacher, allCourses = []) => {
  const count =
    teacher?.assignedCourseCount ??
    teacher?.assignedCoursesCount ??
    teacher?.courseCount;

  if (typeof count === "number") return count;

  return getTeacherCourses(teacher, allCourses).length;
};

// Safe normalizer for API list responses
const normalizeTeachers = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.teachers)) return data.teachers;
  if (Array.isArray(data.data)) return data.data;
  return [];
};

export default function TeachersView() {
  const { openModal } = useUIStore();
  const { showToast } = useToast();

  // Search query state
  const [localSearch, setLocalSearch] = useState("");
  const deferredSearch = useDeferredValue(localSearch);
  const searchQuery = localSearch;
  const setSearchQuery = setLocalSearch;

  // Pagination state
  const [activePage, setActivePage] = useState(1);
  const [deletedPage, setDeletedPage] = useState(1);

  // Reset to page 1 when search changes
  useEffect(() => {
    setActivePage(1);
    setDeletedPage(1);
  }, [deferredSearch]);

  // Filter tabs: "All" (Active) | "Deleted" (Soft-Deleted)
  const [activeTab, setActiveTab] = useState("All");
  const [restoringId, setRestoringId] = useState(null);
  const [teacherToDelete, setTeacherToDelete] = useState(null);

  // Card dropdown & course assignment modal state
  const [openMenuTeacherId, setOpenMenuTeacherId] = useState(null);
  const [teacherToAssign, setTeacherToAssign] = useState(null);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [assignError, setAssignError] = useState("");
  const [assignCourseSearch, setAssignCourseSearch] = useState("");

  const [teacherToUnassign, setTeacherToUnassign] = useState(null);
  const [unassignCourseId, setUnassignCourseId] = useState("");
  const [unassignError, setUnassignError] = useState("");
  const [teacherToView, setTeacherToView] = useState(null);

  // Close dropdown menu when clicking anywhere outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".teacher-card-menu")) {
        setOpenMenuTeacherId(null);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  // ---------------------------------------------------------------------------
  // 1. Queries
  // ---------------------------------------------------------------------------
  const perPage = 9;

  const {
    data: activeData,
    isLoading: isLoadingActive,
    isError: isErrorActive,
    error: activeError,
    refetch: refetchActive,
  } = useAdminTeachers({
    isDeleted: false,
    search: deferredSearch,
    page: activePage,
    perPage,
  });

  const {
    data: deletedData,
    isLoading: isLoadingDeleted,
    isError: isErrorDeleted,
    error: deletedError,
    refetch: refetchDeleted,
  } = useAdminTeachers({
    isDeleted: true,
    search: deferredSearch,
    page: deletedPage,
    perPage,
  });

  const { data: coursesData, isLoading: isLoadingCourses } = useAdminCourses({
    isDeleted: false,
  });

  const { data: teacherDetailData, isLoading: isLoadingDetail } =
    useAdminTeacher(teacherToView);

  // Teacher lists only carry assignedCourseCount, so the assign/unassign dialogs
  // fetch the detailed record to get the actual assigned course ids.
  const { data: assignTargetData, isLoading: isLoadingAssignTarget } =
    useAdminTeacher(getTeacherId(teacherToAssign));

  const { data: unassignTargetData, isLoading: isLoadingUnassignTarget } =
    useAdminTeacher(getTeacherId(teacherToUnassign));

  const deferredAssignSearch = useDeferredValue(assignCourseSearch);
  const { data: assignCoursesData, isLoading: isLoadingAssignCourses } =
    useAdminCourses(
      { isDeleted: false, search: deferredAssignSearch },
      { enabled: Boolean(teacherToAssign) },
    );

  const coursesList = useMemo(() => {
    if (!coursesData) return [];
    if (Array.isArray(coursesData)) return coursesData;
    if (Array.isArray(coursesData.courses)) return coursesData.courses;
    if (Array.isArray(coursesData.data)) return coursesData.data;
    return [];
  }, [coursesData]);

  const assignCoursesList = useMemo(() => {
    const src = assignCoursesData || coursesData;
    if (!src) return [];
    if (Array.isArray(src)) return src;
    if (Array.isArray(src.courses)) return src.courses;
    if (Array.isArray(src.data)) return src.data;
    return [];
  }, [assignCoursesData, coursesData]);

  // Assigned courses of the teacher in each dialog, taken from the detailed record.
  const assignTargetCourses = useMemo(
    () => getTeacherCourses(assignTargetData?.data ?? {}, coursesList),
    [assignTargetData, coursesList],
  );

  const unassignTargetCourses = useMemo(
    () => getTeacherCourses(unassignTargetData?.data ?? {}, coursesList),
    [unassignTargetData, coursesList],
  );

  const activeTeachers = useMemo(
    () => normalizeTeachers(activeData),
    [activeData],
  );
  const deletedTeachers = useMemo(
    () => normalizeTeachers(deletedData),
    [deletedData],
  );

  const activeMeta = activeData?.meta || {};
  const deletedMeta = deletedData?.meta || {};

  const counts = useMemo(
    () => ({
      all: activeMeta.totalRecords ?? activeTeachers.length,
      deleted: deletedMeta.totalRecords ?? deletedTeachers.length,
    }),
    [activeTeachers, deletedTeachers, activeMeta, deletedMeta],
  );

  const currentList =
    activeTab === "Deleted" ? deletedTeachers : activeTeachers;
  const currentMeta = activeTab === "Deleted" ? deletedMeta : activeMeta;
  const currentPage = activeTab === "Deleted" ? deletedPage : activePage;
  const setCurrentPage =
    activeTab === "Deleted" ? setDeletedPage : setActivePage;
  const totalPages = currentMeta.totalPages || 1;
  const isLoading =
    activeTab === "Deleted" ? isLoadingDeleted : isLoadingActive;
  const isError = activeTab === "Deleted" ? isErrorDeleted : isErrorActive;
  const error = activeTab === "Deleted" ? deletedError : activeError;
  const refetch = activeTab === "Deleted" ? refetchDeleted : refetchActive;

  // ---------------------------------------------------------------------------
  // 2. Clean Hooks Integration (No manual cache hacking)
  // ---------------------------------------------------------------------------
  const { mutate: deleteTeacherMutation, isPending: isDeleting } =
    useDeleteTeacher({
      onSuccess: () => {
        setTeacherToDelete(null);
        showToast?.("Teacher removed successfully.", "success");
      },
    });

  const { mutate: restoreTeacherMutation } = useRestoreTeacher({
    onSuccess: () => {
      setRestoringId(null);
      showToast?.("Teacher restored successfully.", "success");
    },
    onError: () => setRestoringId(null),
  });

  const { mutate: assignCoursesMutation, isPending: isAssigning } =
    useAssignCoursesToTeacher({
      onSuccess: () => {
        setTeacherToAssign(null);
        setSelectedCourseIds([]);
        setAssignError("");
        setAssignCourseSearch("");
        showToast?.("Courses assigned successfully.", "success");
      },
      onError: (err) => {
        setAssignError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to assign course. Please try again.",
        );
      },
    });

  const { mutate: unassignCoursesMutation, isPending: isUnassigning } =
    useUnassignCoursesFromTeacher({
      onSuccess: () => {
        setTeacherToUnassign(null);
        setUnassignCourseId("");
        setUnassignError("");
        showToast?.("Course unassigned successfully.", "success");
      },
      onError: (err) => {
        setUnassignError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to unassign course. Please try again.",
        );
      },
    });

  // ---------------------------------------------------------------------------
  // 3. Handlers
  // ---------------------------------------------------------------------------
  const handleConfirmDelete = () => {
    if (!teacherToDelete) return;
    const id = getTeacherId(teacherToDelete);
    if (id) deleteTeacherMutation(id);
  };

  const handleRestore = (teacher) => {
    const id = getTeacherId(teacher);
    if (!id) return;
    setRestoringId(id);
    restoreTeacherMutation(id);
  };

  const handleOpenAssignModal = (teacher) => {
    setTeacherToAssign(teacher);
    setSelectedCourseIds([]);
    setAssignError("");
    setAssignCourseSearch("");
  };

  const handleToggleCourseId = (courseId) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId],
    );
    setAssignError("");
  };

  const handleConfirmAssign = () => {
    if (!teacherToAssign) {
      setAssignError("No faculty selected.");
      return;
    }
    if (selectedCourseIds.length === 0) {
      setAssignError("Please select at least one course to assign.");
      return;
    }
    const teacherId = getTeacherId(teacherToAssign);
    if (!teacherId) {
      setAssignError("Unable to resolve faculty ID.");
      return;
    }
    if (isLoadingAssignTarget) {
      setAssignError("Still loading this teacher's courses. Please try again.");
      return;
    }

    const existingIds = assignTargetCourses
      .map((c) => Number(c.id))
      .filter(Boolean);
    const courseIds = Array.from(
      new Set([...existingIds, ...selectedCourseIds.map(Number)]),
    );

    setAssignError("");
    assignCoursesMutation({
      teacherId,
      courseIds,
    });
  };

  const handleOpenUnassignModal = (teacher) => {
    setTeacherToUnassign(teacher);
    setUnassignError("");
    // The first assigned course is preselected once the teacher record loads.
    setUnassignCourseId("");
  };

  const handleConfirmUnassign = () => {
    if (!teacherToUnassign) {
      setUnassignError("No faculty selected.");
      return;
    }
    const teacherId = getTeacherId(teacherToUnassign);
    if (!teacherId) {
      setUnassignError("Unable to resolve faculty ID.");
      return;
    }

    const assigned = unassignTargetCourses;
    let courseIds = [];

    if (unassignCourseId === "all") {
      courseIds = assigned.map((c) => Number(c.id)).filter(Boolean);
    } else if (unassignCourseId) {
      courseIds = [Number(unassignCourseId)];
    } else {
      courseIds = assigned.map((c) => Number(c.id)).filter(Boolean);
    }

    if (courseIds.length === 0) {
      setUnassignError("Please select a course to unassign.");
      return;
    }

    setUnassignError("");
    unassignCoursesMutation({
      teacherId,
      courseIds,
    });
  };

  // ---------------------------------------------------------------------------
  // 4. Filter List by Search Query
  // ---------------------------------------------------------------------------
  const filteredTeachers = currentList;

  // Set of courses already assigned to the teacher currently being assigned to
  const assignedCourseIds = useMemo(
    () => new Set(assignTargetCourses.map((c) => String(c.id))),
    [assignTargetCourses],
  );

  // Preselect the first assigned course in the unassign dialog once it loads.
  useEffect(() => {
    if (!teacherToUnassign || unassignCourseId) return;
    const firstAssignedId = unassignTargetCourses[0]?.id;
    if (firstAssignedId != null) setUnassignCourseId(String(firstAssignedId));
  }, [teacherToUnassign, unassignCourseId, unassignTargetCourses]);

  // ---------------------------------------------------------------------------
  // Loading & Error States
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">
          Loading faculty records...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="p-8 text-center max-w-lg mx-auto my-12 border-rose-200 bg-rose-50/40">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900">
          Failed to load faculty
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          {error?.response?.data?.message ||
            error?.message ||
            "An error occurred."}
        </p>
        <Button
          variant="outline"
          size="sm"
          iconLeft={<RefreshCw className="w-4 h-4" />}
          onClick={() => refetch()}
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
            Faculty Directory & Academic Staff
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage professors, assign teaching curricula, inspect batch courses,
            and manage faculty credentials.
          </p>
        </div>
      </div>

      {/* 2. Header controls & filter tabs: Active vs Deleted */}
      <ScrollReveal delay={0.05}>
        <Card className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
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

            <div className="flex items-center gap-2.5">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search teacher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500 focus:outline-none transition-colors"
                />
              </div>

              {activeTab === "All" && (
                <Button
                  variant="accent"
                  size="sm"
                  iconLeft={<UserPlus className="w-4 h-4 text-slate-950" />}
                  onClick={() => openModal?.("add-teacher")}
                  className="shrink-0 cursor-pointer"
                >
                  Add Teacher
                </Button>
              )}
            </div>
          </div>
        </Card>
      </ScrollReveal>

      {/* Faculty Cards Grid */}
      {filteredTeachers.length === 0 ? (
        <EmptyState
          title={
            activeTab === "Deleted"
              ? "No deleted faculty members"
              : searchQuery
                ? "No faculty members match search"
                : "No faculty members enrolled"
          }
          description={
            activeTab === "Deleted"
              ? "Deleted faculty records appear here where you can restore them."
              : searchQuery
                ? `No faculty member found matching "${searchQuery}".`
                : "Get started by registering your first faculty member."
          }
          actionLabel={
            activeTab === "Deleted"
              ? "View Active Faculty"
              : searchQuery
                ? "Reset Search"
                : "Add Teacher"
          }
          onAction={() => {
            if (activeTab === "Deleted") {
              setActiveTab("All");
            } else if (searchQuery) {
              setSearchQuery("");
            } else {
              openModal?.("add-teacher");
            }
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeachers.map((teacher, index) => {
            const currentId = getTeacherId(teacher);
            const teacherName = getTeacherName(teacher);
            const avatarSrc = getTeacherAvatar(teacher, teacherName);
            const isDel = activeTab === "Deleted";
            const isCurrentlyRestoring = restoringId === currentId;
            const teacherCourseCount = getTeacherCourseCount(teacher, coursesList);

            return (
              <ScrollReveal
                key={currentId || index}
                delay={0.03 * (index % 12)}
              >
                <Card
                  className="p-4 h-full flex flex-col justify-between hover:border-slate-300 transition-all group relative cursor-pointer"
                  onClick={() => setTeacherToView(getTeacherId(teacher))}
                >
                  <div className="space-y-3.5">
                    {/* Top card bar: Avatar, Name, Status & 3-dots Menu */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={avatarSrc}
                          alt={teacherName}
                          className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 bg-slate-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                            {teacherName}
                          </h4>
                          <span className="text-[11px] font-mono text-slate-400 block truncate">
                            {currentId ? `ID #${currentId}` : "ID #--"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge variant={isDel ? "danger" : "primary"} size="xs">
                          {isDel ? "Archived" : "Faculty"}
                        </Badge>

                        {/* Three dots More button (Assign and Unassign ONLY open from here) */}
                        {!isDel && (
                          <div
                            className="relative teacher-card-menu"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuTeacherId(
                                  openMenuTeacherId === currentId
                                    ? null
                                    : currentId,
                                );
                              }}
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Course Assignment Options"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {openMenuTeacherId === currentId && (
                              <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30 text-xs">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuTeacherId(null);
                                    handleOpenAssignModal(teacher);
                                  }}
                                  className="w-full text-left px-3 py-2 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <BookPlus className="w-3.5 h-3.5 text-indigo-500" />
                                  <span>Assign Course</span>
                                </button>

                                {teacherCourseCount > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuTeacherId(null);
                                      handleOpenUnassignModal(teacher);
                                    }}
                                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-rose-50 hover:text-rose-600 flex items-center gap-2 cursor-pointer transition-colors"
                                  >
                                    <BookMinus className="w-3.5 h-3.5 text-rose-500" />
                                    <span>Unassign Course</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Meta info: Department, Qualification, Email */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                      {teacher.department && (
                        <div className="flex items-center gap-2 truncate">
                          <Briefcase className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="font-semibold truncate">
                            {teacher.department}
                          </span>
                        </div>
                      )}
                      {teacher.qualification && (
                        <div className="flex items-center gap-2 text-slate-500 truncate">
                          <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {teacher.qualification}
                          </span>
                        </div>
                      )}
                      {teacher.email && (
                        <div className="flex items-center gap-2 truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{teacher.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Courses count badge */}
                    <div className="pt-2.5 border-t border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                        <span>
                          {teacherCourseCount}{" "}
                          {teacherCourseCount === 1 ? "Course" : "Courses"}{" "}
                          Assigned
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div
                    className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isDel ? (
                      <Button
                        size="xs"
                        variant="outline"
                        disabled={isCurrentlyRestoring}
                        iconLeft={
                          isCurrentlyRestoring ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                          )
                        }
                        onClick={() => handleRestore(teacher)}
                        className="w-full text-xs font-semibold text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100/80 border-emerald-200/80 cursor-pointer justify-center"
                      >
                        {isCurrentlyRestoring
                          ? "Restoring..."
                          : "Restore Teacher"}
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="xs"
                          variant="outline"
                          iconLeft={
                            <Pencil className="w-3.5 h-3.5 text-indigo-600" />
                          }
                          onClick={() => openModal?.("edit-teacher", teacher)}
                          className="text-xs font-semibold text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100/80 border-indigo-200/80 cursor-pointer"
                        >
                          Edit Profile
                        </Button>

                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => setTeacherToDelete(teacher)}
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Remove teacher record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {filteredTeachers.length > 0 && (
        <Card className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing {filteredTeachers.length} of {counts[activeTab === "Deleted" ? "deleted" : "all"]} &middot; Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                size="xs"
                variant="outline"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                iconLeft={<ChevronLeft className="w-3.5 h-3.5" />}
                className="cursor-pointer"
              >
                Previous
              </Button>
              <Button
                size="xs"
                variant="outline"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                iconLeft={<ChevronRight className="w-3.5 h-3.5" />}
                className="cursor-pointer"
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Assign Course Modal */}
      <Modal
        isOpen={Boolean(teacherToAssign)}
        onClose={() => !isAssigning && setTeacherToAssign(null)}
        title="Assign Courses"
        subtitle={`Assign academic courses to ${
          teacherToAssign ? getTeacherName(teacherToAssign) : "Faculty"
        }`}
      >
        <div className="space-y-4">
          {assignError && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{assignError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Courses to Assign *
            </label>
            <div className="relative mb-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search courses by name or code..."
                value={assignCourseSearch}
                onChange={(e) => setAssignCourseSearch(e.target.value)}
                disabled={isAssigning}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
              />
            </div>
            {isLoadingAssignCourses ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                <span className="ml-2 text-xs text-slate-400">
                  Searching courses...
                </span>
              </div>
            ) : assignCoursesList.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400 border border-slate-200 rounded-xl">
                {assignCourseSearch
                  ? "No courses match your search."
                  : "No courses available."}
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                {assignCoursesList.map((course) => {
                  const cId = course.id ?? course._id;
                  const isAlreadyAssigned = assignedCourseIds.has(String(cId));
                  const isSelected = selectedCourseIds.includes(String(cId));
                  const cTitle = course.code
                    ? `${course.code} - ${course.title}`
                    : course.title;
                  return (
                    <label
                      key={cId}
                      className={`flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                        isAlreadyAssigned
                          ? "opacity-50 cursor-not-allowed bg-slate-50"
                          : isSelected
                            ? "bg-indigo-50"
                            : "hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected || isAlreadyAssigned}
                        disabled={isAlreadyAssigned || isAssigning}
                        onChange={() => handleToggleCourseId(String(cId))}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span
                        className={
                          isAlreadyAssigned
                            ? "text-slate-400"
                            : "text-slate-700"
                        }
                      >
                        {cTitle}
                        {isAlreadyAssigned && (
                          <span className="ml-1.5 text-[10px] font-semibold text-slate-400">
                            (Already assigned)
                          </span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
            {selectedCourseIds.length > 0 && (
              <p className="text-xs text-indigo-600 font-medium mt-1.5">
                {selectedCourseIds.length} course
                {selectedCourseIds.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={isAssigning}
              onClick={() => setTeacherToAssign(null)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={isAssigning || isLoadingAssignTarget}
              onClick={handleConfirmAssign}
              iconLeft={
                isAssigning || isLoadingAssignTarget ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <BookPlus className="w-4 h-4" />
                )
              }
              className="cursor-pointer"
            >
              {isAssigning
                ? "Assigning..."
                : isLoadingAssignTarget
                  ? "Loading courses..."
                  : `Assign Course${selectedCourseIds.length > 1 ? "s" : ""}`}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Unassign Course Modal */}
      <Modal
        isOpen={Boolean(teacherToUnassign)}
        onClose={() => !isUnassigning && setTeacherToUnassign(null)}
        title="Unassign Course"
        subtitle="Confirm course unassignment"
      >
        <div className="space-y-4">
          {unassignError && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{unassignError}</span>
            </div>
          )}

          <p className="text-sm text-slate-600 leading-relaxed">
            Are you sure you want to unassign course assignments from{" "}
            <span className="font-bold text-slate-900">
              {teacherToUnassign
                ? getTeacherName(teacherToUnassign)
                : "this faculty member"}
            </span>
            ? The course itself will remain intact in the system catalog.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Course to Remove *
            </label>
            <select
              value={unassignCourseId}
              onChange={(e) => {
                setUnassignCourseId(e.target.value);
                setUnassignError("");
              }}
              disabled={isUnassigning || isLoadingUnassignTarget}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            >
              {isLoadingUnassignTarget ? (
                <option value="">Loading assigned courses...</option>
              ) : unassignTargetCourses.length === 0 ? (
                <option value="">No courses assigned</option>
              ) : (
                <>
                  {unassignTargetCourses.length > 1 && (
                    <option value="all">
                      All Assigned Courses ({unassignTargetCourses.length})
                    </option>
                  )}
                  {unassignTargetCourses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code ? `${course.code} - ` : ""}
                      {course.title}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={isUnassigning}
              onClick={() => setTeacherToUnassign(null)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={
                isUnassigning ||
                isLoadingUnassignTarget ||
                unassignTargetCourses.length === 0
              }
              onClick={handleConfirmUnassign}
              iconLeft={
                isUnassigning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <BookMinus className="w-4 h-4" />
                )
              }
              className="bg-rose-600 hover:bg-rose-700 text-white border-transparent cursor-pointer"
            >
              {isUnassigning ? "Unassigning..." : "Yes, Unassign"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Teacher Detail Modal */}
      <Modal
        isOpen={Boolean(teacherToView)}
        onClose={() => setTeacherToView(null)}
        title={
          teacherDetailData?.data
            ? getTeacherName(teacherDetailData.data)
            : "Faculty Details"
        }
        subtitle="Faculty profile and assigned courses"
      >
        {teacherToView && (
          isLoadingDetail ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
            </div>
          ) : !teacherDetailData?.data ? (
            <div className="py-8 text-center text-sm text-slate-400">
              Teacher not found
            </div>
          ) : (() => {
            const detail = teacherDetailData.data;
            const viewId = getTeacherId(detail);
            const viewName = getTeacherName(detail);
            const viewAvatar = getTeacherAvatar(detail, viewName);
            const viewCourses = detail.courses ?? [];

            return (
              <div className="space-y-5">
                {/* Profile Header */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <img
                    src={viewAvatar}
                    alt={viewName}
                    className="w-14 h-14 rounded-xl object-cover ring-1 ring-slate-200 bg-slate-100 shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-900">
                      {viewName}
                    </h3>
                    <span className="text-xs font-mono text-slate-400">
                      ID #{viewId}
                    </span>
                  </div>
                </div>

                {/* Info Fields */}
                <div className="space-y-2.5 text-sm">
                  {detail.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-slate-700">
                        {detail.email}
                      </span>
                    </div>
                  )}
                  {detail.department && (
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="text-slate-700 font-semibold">
                        {detail.department}
                      </span>
                    </div>
                  )}
                  {detail.qualification && (
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-slate-700">
                        {detail.qualification}
                      </span>
                    </div>
                  )}
                </div>

                {/* Assigned Courses */}
                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                    Assigned Courses ({viewCourses.length})
                  </h4>

                  {viewCourses.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                      No courses assigned yet
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {viewCourses.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors"
                        >
                          {c.code && (
                            <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 shrink-0">
                              {c.code}
                            </span>
                          )}
                          <span className="text-sm font-medium text-slate-800 truncate">
                            {c.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setTeacherToView(null)}
                    className="cursor-pointer"
                  >
                    Close
                  </Button>
                </div>
              </div>
            );
          })()
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(teacherToDelete)}
        onClose={() => !isDeleting && setTeacherToDelete(null)}
        title="Remove Faculty Member"
        subtitle="Confirm teacher removal"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Are you sure you want to remove{" "}
            <span className="font-bold text-slate-900">
              {teacherToDelete
                ? getTeacherName(teacherToDelete)
                : "this faculty member"}
            </span>
            ? This faculty record will be moved to the{" "}
            <span className="font-semibold text-rose-600">Deleted</span> tab
            where it can be restored.
          </p>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={isDeleting}
              onClick={() => setTeacherToDelete(null)}
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
              {isDeleting ? "Removing..." : "Yes, Remove"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
