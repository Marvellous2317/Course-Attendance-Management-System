import { useState, useMemo, useEffect, useDeferredValue } from "react";
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
  Calendar,
  BookOpen,
  User,
  ChevronRight,
  ChevronLeft,
  X,
  BookPlus,
} from "lucide-react";
import { useUIStore } from "../../shared/store/useUIStore";
import useToast from "../../shared/hooks/useToast";
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
  useEnrollStudentOfferings,
  useAdminOfferings,
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
// Main Students View
// ==============================================================================
export default function StudentsView() {
  const { openModal } = useUIStore();

  // Search query support
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

  // Tabs: "all" (Active) or "deleted" (Soft-Deleted)
  const [activeTab, setActiveTab] = useState("all");

  // State for Custom Delete Modal
  const [studentToDelete, setStudentToDelete] = useState(null);

  // State for inline restoring spinner
  const [restoringId, setRestoringId] = useState(null);


  // State for Enroll Student in Offerings Modal
  const [studentToEnroll, setStudentToEnroll] = useState(null);
  const [selectedOfferingIds, setSelectedOfferingIds] = useState([]);
  const [enrollSearch, setEnrollSearch] = useState("");

  const { showToast } = useToast();

  const perPage = 20;

  // ---------------------------------------------------------------------------
  // 1. Fetch Active Students
  // ---------------------------------------------------------------------------
  const {
    data: activeData,
    isLoading: isLoadingActive,
    isError: isErrorActive,
    error: activeError,
    refetch: refetchActive,
  } = useAdminStudents({ isDeleted: false, search: deferredSearch, page: activePage, perPage });

  // ---------------------------------------------------------------------------
  // 2. Fetch Soft-Deleted Students
  // ---------------------------------------------------------------------------
  const {
    data: deletedData,
    isLoading: isLoadingDeleted,
    isError: isErrorDeleted,
    error: deletedError,
    refetch: refetchDeleted,
  } = useAdminStudents({ isDeleted: true, search: deferredSearch, page: deletedPage, perPage });

  const activeStudents = useMemo(() => normalizeList(activeData), [activeData]);
  const deletedStudents = useMemo(() => normalizeList(deletedData), [deletedData]);

  const activeMeta = activeData?.meta || {};
  const deletedMeta = deletedData?.meta || {};

  // Selected dataset based on active tab
  const currentList = activeTab === "deleted" ? deletedStudents : activeStudents;
  const currentMeta = activeTab === "deleted" ? deletedMeta : activeMeta;
  const currentPage = activeTab === "deleted" ? deletedPage : activePage;
  const setCurrentPage = activeTab === "deleted" ? setDeletedPage : setActivePage;
  const totalPages = currentMeta.totalPages || 1;
  const isLoading = activeTab === "deleted" ? isLoadingDeleted : isLoadingActive;
  const isError = activeTab === "deleted" ? isErrorDeleted : isErrorActive;
  const error = activeTab === "deleted" ? deletedError : activeError;
  const refetch = activeTab === "deleted" ? refetchDeleted : refetchActive;

  const filteredStudents = currentList;

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

  // ---------------------------------------------------------------------------
  // 5. Enroll Student Mutation & Offerings Query
  // ---------------------------------------------------------------------------
  const deferredEnrollSearch = useDeferredValue(enrollSearch);
  const { data: offeringsData, isLoading: isLoadingOfferings } =
    useAdminOfferings(
      { search: deferredEnrollSearch, perPage: 50 },
      { enabled: Boolean(studentToEnroll) },
    );
  const offeringsList = useMemo(() => normalizeList(offeringsData), [offeringsData]);

  const { data: enrolledData } = useAdminStudentEnrollments(
    studentToEnroll ? getStudentId(studentToEnroll) : null,
    { perPage: 200 },
  );
  const alreadyEnrolledIds = useMemo(() => {
    const list = normalizeList(enrolledData);
    return new Set(list.map((e) => e.id));
  }, [enrolledData]);

  const { mutate: enrollMutation, isPending: isEnrolling } =
    useEnrollStudentOfferings({
      onSuccess: () => {
        showToast("Student enrolled successfully", "success");
        setStudentToEnroll(null);
        setSelectedOfferingIds([]);
        setEnrollSearch("");
      },
      onError: (err) => {
        showToast(
          err?.response?.data?.error || "Failed to enroll student",
          "error",
        );
      },
    });

  const handleToggleOffering = (offeringId) => {
    setSelectedOfferingIds((prev) =>
      prev.includes(offeringId)
        ? prev.filter((id) => id !== offeringId)
        : [...prev, offeringId],
    );
  };

  const handleEnroll = () => {
    if (!studentToEnroll || selectedOfferingIds.length === 0) return;
    enrollMutation({
      id: getStudentId(studentToEnroll),
      payload: selectedOfferingIds,
    });
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
                  {activeMeta.totalRecords ?? activeStudents.length}
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
                  {deletedMeta.totalRecords ?? deletedStudents.length}
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

                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                    {activeTab === "all" ? (
                      <>
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="xs"
                            variant="outline"
                            iconLeft={<Pencil className="w-3.5 h-3.5 text-indigo-600" />}
                            onClick={() => openModal?.("edit-student", student)}
                            className="text-xs font-semibold text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100/80 border-indigo-200/80 cursor-pointer"
                          >
                            Edit
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            iconLeft={<BookPlus className="w-3.5 h-3.5 text-emerald-600" />}
                            onClick={() => {
                              setStudentToEnroll(student);
                              setSelectedOfferingIds([]);
                              setEnrollSearch("");
                            }}
                            className="text-xs font-semibold text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100/80 border-emerald-200/80 cursor-pointer"
                          >
                            Enroll
                          </Button>
                        </div>

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

      {/* Pagination Controls */}
      {!isLoading && !isError && filteredStudents.length > 0 && (
        <Card className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing {filteredStudents.length} of {currentMeta.totalRecords ?? 0} &middot; Page {currentPage} of {totalPages}
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

      {/* Enroll Student in Offerings Modal */}
      <Modal
        isOpen={Boolean(studentToEnroll)}
        onClose={() => {
          if (!isEnrolling) {
            setStudentToEnroll(null);
            setSelectedOfferingIds([]);
            setEnrollSearch("");
          }
        }}
        title={`Enroll ${studentToEnroll ? getStudentName(studentToEnroll) : "Student"}`}
        subtitle="Select course offerings to enroll this student in"
      >
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by course, code, or batch..."
              value={enrollSearch}
              onChange={(e) => setEnrollSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-colors"
            />
          </div>

          {/* Offerings list */}
          <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
            {isLoadingOfferings ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
              </div>
            ) : offeringsList.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                {enrollSearch ? "No offerings match your search" : "No course offerings available"}
              </div>
            ) : (
              offeringsList.map((offering) => {
                const isAlreadyEnrolled = alreadyEnrolledIds.has(offering.id);
                const isSelected = selectedOfferingIds.includes(offering.id);
                const course = offering.course || {};
                const instructor = offering.instructor;

                return (
                  <label
                    key={offering.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      isAlreadyEnrolled
                        ? "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
                        : isSelected
                        ? "border-indigo-300 bg-indigo-50/50"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected || isAlreadyEnrolled}
                      disabled={isAlreadyEnrolled}
                      onChange={() => !isAlreadyEnrolled && handleToggleOffering(offering.id)}
                      className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {course.code && (
                          <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                            {course.code}
                          </span>
                        )}
                        {offering.batchCode && (
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {offering.batchCode}
                          </span>
                        )}
                        {isAlreadyEnrolled && (
                          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            Enrolled
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-slate-800 mt-0.5 truncate">
                        {course.title || "Untitled Course"}
                      </p>
                      {instructor && (
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {`${instructor.firstName || ""} ${instructor.lastName || ""}`.trim() || instructor.email}
                        </p>
                      )}
                    </div>
                  </label>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              {selectedOfferingIds.length} offering{selectedOfferingIds.length !== 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setStudentToEnroll(null);
                  setSelectedOfferingIds([]);
                  setEnrollSearch("");
                }}
                disabled={isEnrolling}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleEnroll}
                disabled={selectedOfferingIds.length === 0 || isEnrolling}
                iconLeft={
                  isEnrolling ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <BookPlus className="w-4 h-4" />
                  )
                }
                className="cursor-pointer"
              >
                {isEnrolling ? "Enrolling..." : "Enroll Student"}
              </Button>
            </div>
          </div>
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