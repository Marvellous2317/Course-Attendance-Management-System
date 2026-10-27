import { useState, useMemo } from "react";
import {
  UserPlus,
  Mail,
  GraduationCap,
  Trash2,
  Pencil,
  RotateCcw,
  Loader2,
  AlertCircle,
  RefreshCw,
  Search,
  Shield,
  Calendar,
  BookOpen,
  User,
  Clock,
  Layers,
  ChevronRight,
  X,
} from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { Card } from "../../shared/components/Card";
import { Button } from "../../shared/components/Button";
import { Badge } from "../../shared/components/Badge";
import { ScrollReveal } from "../../shared/components/ScrollReveal";
import { EmptyState } from "../../shared/components/EmptyState";
import { Modal } from "../../shared/components/Modal";
import { formatCourseDate } from "../../shared/utils/date";

// TanStack Query Hooks
import {
  useAdminStudents,
  useDeleteStudent,
  useRestoreStudent,
  useAdminStudentEnrollments,
} from "../../shared/hooks/useAdmin";

// Defensive ID extractor
const getStudentId = (s) =>
  s?.id ?? s?.studentId ?? s?._id ?? s?.userId ?? s?.user_id;

// Defensive Name extractor
const getStudentName = (s) => {
  const firstName = s?.firstName ?? s?.first_name ?? "";
  const lastName = s?.lastName ?? s?.last_name ?? "";
  const combined = `${firstName} ${lastName}`.trim();
  return combined || s?.name || "Student";
};

// Generates fallback avatar with initials
const getStudentAvatar = (s, name) => {
  if (s?.avatar && typeof s.avatar === "string" && s.avatar.startsWith("http")) {
    return s.avatar;
  }
  const encodedName = encodeURIComponent(name || "Student");
  return `https://ui-avatars.com/api/?name=${encodedName}&background=6366f1&color=fff&bold=true`;
};

// Normalizes server array response
const normalizeList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.students)) return res.students;
  return [];
};

// ==============================================================================
// Sub-component: Student Enrolled Courses Badges
// ==============================================================================
function StudentEnrolledCourses({ studentId, onViewAll }) {
  const { data, isLoading, isError } = useAdminStudentEnrollments(studentId, {
    perPage: 50,
  });

  const enrollments = useMemo(() => normalizeList(data), [data]);

  if (isLoading) {
    return (
      <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-400">
        <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />
        <span>Loading enrolled courses...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="pt-2 border-t border-slate-100 text-[11px] text-rose-500">
        Could not load enrolled courses
      </div>
    );
  }

  return (
    <div className="pt-2.5 border-t border-slate-100 space-y-1.5">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-bold text-slate-600 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
          <span>Enrolled Courses</span>
        </span>
        <span
          onClick={() => enrollments.length > 0 && onViewAll?.(enrollments)}
          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
            enrollments.length > 0
              ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 cursor-pointer transition-colors"
              : "bg-slate-100 text-slate-500"
          }`}
          title={enrollments.length > 0 ? "Click to view full course details" : ""}
        >
          {enrollments.length} {enrollments.length === 1 ? "Course" : "Courses"}
        </span>
      </div>

      {enrollments.length === 0 ? (
        <p className="text-[11px] text-slate-400 italic">No course enrollments found</p>
      ) : (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {enrollments.slice(0, 3).map((enr) => {
            const course = enr.course || {};
            const code = course.code || `Course #${enr.courseId || enr.id}`;
            const title = course.title || enr.batchCode || "";

            return (
              <span
                key={enr.id}
                title={`${code}: ${title}${enr.batchCode ? ` (${enr.batchCode})` : ""}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-100 max-w-[130px] truncate"
              >
                <span className="font-mono">{code}</span>
                {enr.batchCode && (
                  <span className="text-[9px] text-indigo-500 font-semibold">
                    • {enr.batchCode}
                  </span>
                )}
              </span>
            );
          })}

          {enrollments.length > 3 && (
            <button
              type="button"
              onClick={() => onViewAll?.(enrollments)}
              className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
            >
              +{enrollments.length - 3} more
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ==============================================================================
// Main Students View
// ==============================================================================
export default function StudentsView() {
  const adminContext = useAdmin?.() || {};
  const { openModal } = adminContext;

  // Search query support
  const [localSearch, setLocalSearch] = useState("");
  const searchQuery = adminContext.searchQuery ?? localSearch;
  const setSearchQuery = adminContext.setSearchQuery ?? setLocalSearch;

  // Tabs: "all" (Active) or "deleted" (Soft-Deleted)
  const [activeTab, setActiveTab] = useState("all");

  // State for Custom Delete Modal
  const [studentToDelete, setStudentToDelete] = useState(null);

  // State for inline restoring spinner
  const [restoringId, setRestoringId] = useState(null);

  // State for Viewing Student's Full Enrolled Courses Modal
  const [activeStudentCourses, setActiveStudentCourses] = useState(null);

  // ---------------------------------------------------------------------------
  // 1. Fetch Active Students
  // ---------------------------------------------------------------------------
  const {
    data: activeData,
    isLoading: isLoadingActive,
    isError: isErrorActive,
    error: activeError,
    refetch: refetchActive,
  } = useAdminStudents({ isDeleted: false });

  // ---------------------------------------------------------------------------
  // 2. Fetch Soft-Deleted Students
  // ---------------------------------------------------------------------------
  const {
    data: deletedData,
    isLoading: isLoadingDeleted,
    isError: isErrorDeleted,
    error: deletedError,
    refetch: refetchDeleted,
  } = useAdminStudents({ isDeleted: true });

  const activeStudents = useMemo(() => normalizeList(activeData), [activeData]);
  const deletedStudents = useMemo(() => normalizeList(deletedData), [deletedData]);

  // Selected dataset based on active tab
  const currentList = activeTab === "deleted" ? deletedStudents : activeStudents;
  const isLoading = activeTab === "deleted" ? isLoadingDeleted : isLoadingActive;
  const isError = activeTab === "deleted" ? isErrorDeleted : isErrorActive;
  const error = activeTab === "deleted" ? deletedError : activeError;
  const refetch = activeTab === "deleted" ? refetchDeleted : refetchActive;

  // ---------------------------------------------------------------------------
  // 3. Filter Students via Search
  // ---------------------------------------------------------------------------
  const filteredStudents = useMemo(() => {
    return currentList.filter((student) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      const name = getStudentName(student).toLowerCase();
      const email = (student.email || "").toLowerCase();
      const id = String(getStudentId(student) || "").toLowerCase();

      return name.includes(q) || email.includes(q) || id.includes(q);
    });
  }, [currentList, searchQuery]);

  // ---------------------------------------------------------------------------
  // 4. Delete & Restore Mutations
  // ---------------------------------------------------------------------------
  const { mutate: deleteStudentMutation, isPending: isDeleting } =
    useDeleteStudent({
      onSuccess: () => {
        setStudentToDelete(null);
      },
    });

  const { mutate: restoreStudentMutation } = useRestoreStudent({
    onSuccess: () => {
      setRestoringId(null);
    },
    onError: () => {
      setRestoringId(null);
    },
  });

  const handleConfirmDelete = () => {
    if (!studentToDelete) return;
    const id = getStudentId(studentToDelete);
    if (!id) return;
    deleteStudentMutation(id);
  };

  const handleRestore = (student) => {
    const id = getStudentId(student);
    if (!id) return;
    setRestoringId(id);
    restoreStudentMutation(id);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            Student Directory & Admissions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage matriculated students, admissions roster, enrolled courses, and records.
          </p>
        </div>
      </div>

      {/* 2. Top Filter & Tab Bar */}
      <ScrollReveal delay={0.05}>
        <Card className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === "all"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>Active Students</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === "all"
                      ? "bg-amber-500/20 text-secondary-400 border border-amber-400/30"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {activeStudents.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("deleted")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === "deleted"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>Deleted</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === "deleted"
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {deletedStudents.length}
                </span>
              </button>
            </div>

            {/* Actions: Search & Add Student */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500 focus:outline-none transition-colors"
                />
              </div>

              {activeTab === "all" && (
                <Button
                  size="sm"
                  variant="accent"
                  iconLeft={<UserPlus className="w-4 h-4 text-slate-950" />}
                  onClick={() => openModal?.("add-student")}
                  className="cursor-pointer shrink-0"
                >
                  Enroll Student
                </Button>
              )}
            </div>
          </div>
        </Card>
      </ScrollReveal>

      {/* Loading State */}
      {isLoading && (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs text-slate-500">Loading student records...</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && isError && (
        <Card className="p-8 text-center max-w-md mx-auto">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">
            Failed to Load Students
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            {error?.response?.data?.message ||
              error?.message ||
              "Could not connect to the student database."}
          </p>
          <Button
            size="sm"
            variant="outline"
            iconLeft={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={() => refetch()}
            className="cursor-pointer mx-auto"
          >
            Retry Fetch
          </Button>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredStudents.length === 0 && (
        <EmptyState
          title={
            activeTab === "deleted"
              ? "No Deleted Students"
              : searchQuery
              ? "No Students Match Search"
              : "No Students Enrolled Yet"
          }
          description={
            activeTab === "deleted"
              ? "Deleted student records will appear here for archival or restoration."
              : searchQuery
              ? `No student record found matching "${searchQuery}".`
              : "Get started by registering and enrolling your first student into the institution."
          }
          action={
            activeTab === "all" && !searchQuery ? (
              <Button
                variant="primary"
                size="sm"
                iconLeft={<UserPlus className="w-4 h-4" />}
                onClick={() => openModal?.("add-student")}
              >
                Enroll First Student
              </Button>
            ) : null
          }
        />
      )}

      {/* Student Cards Grid */}
      {!isLoading && !isError && filteredStudents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student, index) => {
            const studentId = getStudentId(student);
            const studentName = getStudentName(student);
            const avatarUrl = getStudentAvatar(student, studentName);
            const isCurrentlyRestoring = restoringId === studentId;

            return (
              <ScrollReveal key={studentId || index} delay={0.03 * (index % 12)}>
                <Card className="p-4 h-full flex flex-col justify-between hover:border-slate-300 transition-all group">
                  <div className="space-y-3">
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={avatarUrl}
                          alt={studentName}
                          className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 bg-slate-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                            {studentName}
                          </h4>
                          <span className="text-[11px] font-mono text-slate-400 block truncate">
                            {studentId ? `ID #${studentId}` : "ID #--"}
                          </span>
                        </div>
                      </div>

                      <Badge
                        variant={activeTab === "deleted" ? "danger" : "primary"}
                        size="xs"
                      >
                        {activeTab === "deleted" ? "Archived" : "Enrolled"}
                      </Badge>
                    </div>

                    {/* Email and Joined Date Meta */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{student.email || "--"}</span>
                      </div>

                      {student.createdAt && (
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Joined {formatCourseDate(student.createdAt)}</span>
                        </div>
                      )}
                    </div>

                    {/* Live Enrolled Courses Section */}
                    {studentId && (
                      <StudentEnrolledCourses
                        studentId={studentId}
                        onViewAll={(enrollments) =>
                          setActiveStudentCourses({
                            student,
                            enrollments,
                          })
                        }
                      />
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                    {activeTab === "all" ? (
                      <>
                        <Button
                          size="xs"
                          variant="outline"
                          iconLeft={<Pencil className="w-3.5 h-3.5 text-indigo-600" />}
                          onClick={() => openModal?.("edit-student", student)}
                          className="text-xs font-semibold text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100/80 border-indigo-200/80 cursor-pointer"
                        >
                          Edit Profile
                        </Button>

                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => setStudentToDelete(student)}
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Delete Student"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    ) : (
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
                        onClick={() => handleRestore(student)}
                        className="w-full text-xs font-semibold text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100/80 border-emerald-200/80 cursor-pointer justify-center"
                      >
                        {isCurrentlyRestoring ? "Restoring..." : "Restore Student"}
                      </Button>
                    )}
                  </div>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      )}

      {/* Full Enrolled Courses Details Modal */}
      <Modal
        isOpen={Boolean(activeStudentCourses)}
        onClose={() => setActiveStudentCourses(null)}
        title={
          activeStudentCourses
            ? `${getStudentName(activeStudentCourses.student)}'s Courses`
            : "Enrolled Courses"
        }
        subtitle="Complete course offerings and cohorts assigned to this student."
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {activeStudentCourses?.enrollments?.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              No course enrollments on record.
            </p>
          ) : (
            activeStudentCourses?.enrollments?.map((enr) => {
              const course = enr.course || {};
              const instructor = enr.instructor;

              return (
                <div
                  key={enr.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {course.code || "COURSE"}
                        </span>
                        {enr.batchCode && (
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                            {enr.batchCode}
                          </span>
                        )}
                      </div>
                      <h5 className="font-bold text-sm text-slate-900 mt-1">
                        {course.title || "Untitled Course"}
                      </h5>
                    </div>

                    {enr.duration && (
                      <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{enr.duration} mins</span>
                      </span>
                    )}
                  </div>

                  {/* Instructor & Sessions Info */}
                  <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>
                        {instructor
                          ? `${instructor.firstName || ""} ${instructor.lastName || ""}`.trim() ||
                            instructor.email
                          : "Instructor Unassigned"}
                      </span>
                    </span>

                    {enr.sessions && (
                      <span className="font-semibold text-slate-600">
                        {enr.sessions} Sessions
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Modal>

      {/* Custom Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(studentToDelete)}
        onClose={() => !isDeleting && setStudentToDelete(null)}
        title="Delete Student Record"
        subtitle="Are you sure you want to delete this student?"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            This will soft-delete{" "}
            <span className="font-bold text-slate-800">
              {studentToDelete ? getStudentName(studentToDelete) : "this student"}
            </span>{" "}
            from the active student directory. The record can be restored anytime
            from the <span className="font-semibold text-indigo-600">Deleted</span> tab.
          </p>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStudentToDelete(null)}
              disabled={isDeleting}
            >
              No, Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              iconLeft={
                isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )
              }
            >
              {isDeleting ? "Deleting..." : "Yes, Delete Student"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export const Students = StudentsView;