import React, { useState, useMemo, useEffect } from "react";
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
  if (t?.avatar && typeof t.avatar === "string" && t.avatar.startsWith("http")) {
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
        title: courseObj.title ?? courseObj.name ?? `Course #${courseObj.id || item.id}`,
      };
    }

    const match = allCourses.find((c) => String(c.id ?? c._id) === String(item));
    return {
      id: item,
      code: match?.code ?? "",
      title: match?.title ?? `Course #${item}`,
    };
  });
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
  const searchQuery = localSearch;
  const setSearchQuery = setLocalSearch;

  // Filter tabs: "All" (Active) | "Deleted" (Soft-Deleted)
  const [activeTab, setActiveTab] = useState("All");
  const [restoringId, setRestoringId] = useState(null);
  const [teacherToDelete, setTeacherToDelete] = useState(null);

  // Card dropdown & course assignment modal state
  const [openMenuTeacherId, setOpenMenuTeacherId] = useState(null);
  const [teacherToAssign, setTeacherToAssign] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [assignError, setAssignError] = useState("");

  const [teacherToUnassign, setTeacherToUnassign] = useState(null);
  const [unassignCourseId, setUnassignCourseId] = useState("");
  const [unassignError, setUnassignError] = useState("");

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
  const {
    data: activeData,
    isLoading: isLoadingActive,
    isError: isErrorActive,
    error: activeError,
    refetch: refetchActive,
  } = useAdminTeachers({ isDeleted: false });

  const {
    data: deletedData,
    isLoading: isLoadingDeleted,
    isError: isErrorDeleted,
    error: deletedError,
    refetch: refetchDeleted,
  } = useAdminTeachers({ isDeleted: true });

  const { data: coursesData, isLoading: isLoadingCourses } = useAdminCourses({
    isDeleted: false,
  });

  const coursesList = useMemo(() => {
    if (!coursesData) return [];
    if (Array.isArray(coursesData)) return coursesData;
    if (Array.isArray(coursesData.courses)) return coursesData.courses;
    if (Array.isArray(coursesData.data)) return coursesData.data;
    return [];
  }, [coursesData]);

  const activeTeachers = useMemo(() => normalizeTeachers(activeData), [activeData]);
  const deletedTeachers = useMemo(() => normalizeTeachers(deletedData), [deletedData]);

  const counts = useMemo(
    () => ({
      all: activeTeachers.length,
      deleted: deletedTeachers.length,
    }),
    [activeTeachers, deletedTeachers]
  );

  const currentList = activeTab === "Deleted" ? deletedTeachers : activeTeachers;
  const isLoading = activeTab === "Deleted" ? isLoadingDeleted : isLoadingActive;
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
        setSelectedCourseId("");
        setAssignError("");
        showToast?.("Course assigned successfully.", "success");
      },
      onError: (err) => {
        setAssignError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to assign course. Please try again."
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
            "Failed to unassign course. Please try again."
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
    setSelectedCourseId("");
    setAssignError("");
  };

  const handleConfirmAssign = () => {
    if (!teacherToAssign) {
      setAssignError("No faculty selected.");
      return;
    }
    if (!selectedCourseId) {
      setAssignError("Please select a course to assign.");
      return;
    }
    const teacherId = getTeacherId(teacherToAssign);
    if (!teacherId) {
      setAssignError("Unable to resolve faculty ID.");
      return;
    }

    const newCourseId = Number(selectedCourseId);
    const existing = getTeacherCourses(teacherToAssign, coursesList);
    const existingIds = existing.map((c) => Number(c.id)).filter(Boolean);
    const courseIds = Array.from(new Set([...existingIds, newCourseId]));

    setAssignError("");
    assignCoursesMutation({
      teacherId,
      courseIds,
    });
  };

  const handleOpenUnassignModal = (teacher) => {
    setTeacherToUnassign(teacher);
    setUnassignError("");
    const assigned = getTeacherCourses(teacher, coursesList);
    setUnassignCourseId(assigned.length > 0 ? String(assigned[0].id) : "");
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

    const assigned = getTeacherCourses(teacherToUnassign, coursesList);
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
  const filteredTeachers = useMemo(() => {
    return currentList.filter((teacher) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      const teacherName = getTeacherName(teacher).toLowerCase();
      const teacherCode = String(getTeacherId(teacher) || "").toLowerCase();
      const dept = (teacher.department || "").toLowerCase();
      const email = (teacher.email || "").toLowerCase();
      const courses = getTeacherCourses(teacher, coursesList);
      const matchesCourse = courses.some(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.code?.toLowerCase().includes(q)
      );

      return (
        teacherName.includes(q) ||
        dept.includes(q) ||
        teacherCode.includes(q) ||
        email.includes(q) ||
        matchesCourse
      );
    });
  }, [currentList, searchQuery, coursesList]);

  // Set of courses already assigned to the teacher currently being assigned to
  const assignedCourseIds = useMemo(() => {
    if (!teacherToAssign) return new Set();
    const assigned = getTeacherCourses(teacherToAssign, coursesList);
    return new Set(assigned.map((c) => String(c.id)));
  }, [teacherToAssign, coursesList]);

  // ---------------------------------------------------------------------------
  // Loading & Error States
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading faculty records...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="p-8 text-center max-w-lg mx-auto my-12 border-rose-200 bg-rose-50/40">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900">Failed to load faculty</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          {error?.response?.data?.message || error?.message || "An error occurred."}
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
            Manage professors, assign teaching curricula, inspect batch courses, and manage faculty credentials.
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
                  placeholder="Search faculty or course..."
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
            const teacherCourses = getTeacherCourses(teacher, coursesList);

            return (
              <ScrollReveal key={currentId || index} delay={0.03 * (index % 12)}>
                <Card className="p-4 h-full flex flex-col justify-between hover:border-slate-300 transition-all group relative">
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
                          <div className="relative teacher-card-menu">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuTeacherId(
                                  openMenuTeacherId === currentId ? null : currentId
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

                                {teacherCourses.length > 0 && (
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
                          <span className="font-semibold truncate">{teacher.department}</span>
                        </div>
                      )}
                      {teacher.qualification && (
                        <div className="flex items-center gap-2 text-slate-500 truncate">
                          <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{teacher.qualification}</span>
                        </div>
                      )}
                      {teacher.email && (
                        <div className="flex items-center gap-2 truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{teacher.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Assigned Courses Section on Card (shows when assigned, disappears when unassigned) */}
                    <div className="pt-2.5 border-t border-slate-100 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3 text-indigo-500" />
                        <span>Assigned Courses ({teacherCourses.length})</span>
                      </span>

                      {teacherCourses.length === 0 ? (
                        <div className="py-2 px-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-400 italic">
                          No courses assigned yet
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                          {teacherCourses.map((c) => (
                            <div
                              key={c.id}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-indigo-50/90 border border-indigo-200/70 text-indigo-950 text-xs font-semibold"
                            >
                              {c.code && (
                                <span className="font-mono font-bold text-[10px] text-indigo-600 bg-white px-1 py-0.5 rounded border border-indigo-200">
                                  {c.code}
                                </span>
                              )}
                              <span className="truncate max-w-[150px]" title={c.title}>
                                {c.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
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
                        {isCurrentlyRestoring ? "Restoring..." : "Restore Faculty"}
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="xs"
                          variant="outline"
                          iconLeft={<Pencil className="w-3.5 h-3.5 text-indigo-600" />}
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

      {/* Assign Course Modal */}
      <Modal
        isOpen={Boolean(teacherToAssign)}
        onClose={() => !isAssigning && setTeacherToAssign(null)}
        title="Assign Course"
        subtitle={`Assign academic course to ${
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
              Select Course to Assign *
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setAssignError("");
              }}
              disabled={isLoadingCourses || isAssigning}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            >
              <option value="">
                {isLoadingCourses ? "Loading courses..." : "-- Select a course to assign --"}
              </option>
              {coursesList.map((course) => {
                const cId = course.id ?? course._id;
                const isAlreadyAssigned = assignedCourseIds.has(String(cId));
                const cTitle = course.code ? `${course.code} - ${course.title}` : course.title;
                return (
                  <option key={cId} value={cId} disabled={isAlreadyAssigned}>
                    {cTitle} {isAlreadyAssigned ? "(Already assigned)" : ""}
                  </option>
                );
              })}
            </select>
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
              disabled={isAssigning}
              onClick={handleConfirmAssign}
              iconLeft={
                isAssigning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <BookPlus className="w-4 h-4" />
                )
              }
              className="cursor-pointer"
            >
              {isAssigning ? "Assigning..." : "Assign Course"}
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
              {teacherToUnassign ? getTeacherName(teacherToUnassign) : "this faculty member"}
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
              disabled={isUnassigning}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            >
              {(() => {
                const assigned = getTeacherCourses(teacherToUnassign, coursesList);
                if (assigned.length === 0) {
                  return <option value="">No courses assigned</option>;
                }
                return (
                  <>
                    {assigned.length > 1 && (
                      <option value="all">All Assigned Courses ({assigned.length})</option>
                    )}
                    {assigned.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.code ? `${course.code} - ` : ""}
                        {course.title}
                      </option>
                    ))}
                  </>
                );
              })()}
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
              disabled={isUnassigning}
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
              {teacherToDelete ? getTeacherName(teacherToDelete) : "this faculty member"}
            </span>
            ? This faculty record will be moved to the{" "}
            <span className="font-semibold text-rose-600">Deleted</span> tab where it can be restored.
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