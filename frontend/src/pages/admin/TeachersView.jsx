import React, { useState, useMemo } from "react";
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
} from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { Card } from "../../shared/components/Card";
import { Button } from "../../shared/components/Button";
import { Badge } from "../../shared/components/Badge";
import { Modal } from "../../shared/components/Modal";
import { ScrollReveal } from "../../shared/components/ScrollReveal";
import { EmptyState } from "../../shared/components/EmptyState";

// TanStack Query Hooks
import {
  useAdminTeachers,
  useDeleteTeacher,
  useRestoreTeacher,
} from "../../shared/hooks/useAdmin";

// Helper to reliably check if a teacher is deleted
const isTeacherDeleted = (teacher) =>
  Boolean(teacher.isDeleted || teacher.deletedAt || teacher.status === "Deleted");

export default function TeachersView() {
  const adminContext = useAdmin?.() || {};
  const { openModal } = adminContext;

  // Search query support
  const [localSearch, setLocalSearch] = useState("");
  const searchQuery = adminContext.searchQuery ?? localSearch;
  const setSearchQuery = adminContext.setSearchQuery ?? setLocalSearch;

  // Filter tabs: "All" | "Deleted"
  const [activeTab, setActiveTab] = useState("All");
  const [actioningId, setActioningId] = useState(null);

  // State to track which teacher is currently selected for deletion
  const [teacherToDelete, setTeacherToDelete] = useState(null);

  // ---------------------------------------------------------------------------
  // API Queries & Mutations
  // ---------------------------------------------------------------------------
  const {
    data: teachersData,
    isLoading,
    isError,
    error,
    refetch,
  } = useAdminTeachers();

  const { mutate: deleteTeacherMutation, isPending: isDeleting } =
    useDeleteTeacher({
      onSuccess: () => {
        setTeacherToDelete(null);
      },
      onSettled: () => setActioningId(null),
    });

  const { mutate: restoreTeacherMutation, isPending: isRestoring } =
    useRestoreTeacher({
      onSettled: () => setActioningId(null),
    });

  // Normalize API response safely
  const teachers = useMemo(() => {
    if (!teachersData) return [];
    if (Array.isArray(teachersData)) return teachersData;
    if (Array.isArray(teachersData.teachers)) return teachersData.teachers;
    if (Array.isArray(teachersData.data)) return teachersData.data;
    return [];
  }, [teachersData]);

  // Tab counters (Active vs Deleted)
  const counts = useMemo(() => {
    const deleted = teachers.filter(isTeacherDeleted).length;
    const active = teachers.length - deleted;
    return { all: active, deleted };
  }, [teachers]);

  // Filter teachers safely with null-checks and activeTab support
  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const q = searchQuery.toLowerCase().trim();
      const teacherName = (
        teacher.name ||
        `${teacher.firstName || ""} ${teacher.lastName || ""}`
      ).trim();
      const teacherCode = String(
        teacher.teacherId || teacher.id || teacher._id || ""
      );
      const dept = teacher.department || "";

      const matchesSearch =
        !q ||
        teacherName.toLowerCase().includes(q) ||
        dept.toLowerCase().includes(q) ||
        teacherCode.toLowerCase().includes(q);

      const isDel = isTeacherDeleted(teacher);
      const matchesTab = activeTab === "Deleted" ? isDel : !isDel;

      return matchesSearch && matchesTab;
    });
  }, [teachers, searchQuery, activeTab]);

  // ---------------------------------------------------------------------------
  // Action Handlers
  // ---------------------------------------------------------------------------
  const handleOpenDeleteModal = (teacher) => {
    setTeacherToDelete(teacher);
  };

  const handleCloseDeleteModal = () => {
    if (isDeleting) return;
    setTeacherToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (!teacherToDelete) return;
    const id =
      teacherToDelete._id || teacherToDelete.id || teacherToDelete.teacherId;
    setActioningId(id);
    deleteTeacherMutation(id);
  };

  const handleRestore = (teacher) => {
    const id = teacher._id || teacher.id || teacher.teacherId;
    setActioningId(id);
    restoreTeacherMutation(id);
  };

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
            "An error occurred while fetching teachers."}
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

            <Button
              variant="primary"
              size="sm"
              iconLeft={<UserPlus className="w-4 h-4" />}
              onClick={() => openModal?.("add-teacher")}
              className="shrink-0 self-end sm:self-auto cursor-pointer"
            >
              Add Teacher
            </Button>
          </div>
        </Card>
      </ScrollReveal>

      {/* Faculty Cards Grid */}
      {filteredTeachers.length === 0 ? (
        <EmptyState
          title={
            activeTab === "Deleted"
              ? "No deleted faculty members"
              : "No faculty members found"
          }
          description={
            activeTab === "Deleted"
              ? "Deleted faculty members will appear here where you can restore them."
              : "Try adjusting your search query or add a new faculty member."
          }
          actionLabel={
            activeTab === "Deleted"
              ? "View Active Faculty"
              : "Reset Search"
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
          {filteredTeachers.map((teacher, index) => {
            const currentId = teacher.id || teacher.teacherId || teacher._id;
            const isCurrentActioning =
              actioningId === currentId && (isDeleting || isRestoring);
            const teacherName =
              teacher.name ||
              `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim() ||
              "Faculty Member";

            const avatarSrc =
              teacher.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                teacherName
              )}&background=6366f1&color=fff&bold=true`;

            const isDel = isTeacherDeleted(teacher);

            return (
              <ScrollReveal
                key={currentId || index}
                delay={0.1 + (index % 3) * 0.07}
              >
                <Card
                  hoverEffect
                  className={`p-5 flex flex-col justify-between h-full group ${
                    isDel ? "opacity-75 bg-slate-50" : ""
                  }`}
                >
                  <div>
                    {/* Top card bar: Avatar, Name & Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={avatarSrc}
                          alt={teacherName}
                          className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 bg-slate-100"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {teacherName}
                          </h4>
                          <span className="text-[11px] font-mono text-slate-400 block">
                            {teacher.teacherId || `ID #${teacher.id || teacher._id}`}
                          </span>
                        </div>
                      </div>

                      <Badge
                        variant={
                          isDel
                            ? "rose"
                            : teacher.status === "Active"
                            ? "emerald"
                            : "amber"
                        }
                        size="sm"
                        dot
                      >
                        {isDel
                          ? "Deleted"
                          : teacher.status || "Active"}
                      </Badge>
                    </div>

                    {/* Department & Qualification */}
                    {(teacher.department || teacher.qualification) && (
                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                        {teacher.department && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-700">
                            <Briefcase className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span className="font-semibold">
                              {teacher.department}
                            </span>
                          </div>
                        )}
                        {teacher.qualification && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">
                              {teacher.qualification}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer bar with contacts and actions */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="space-y-0.5 text-[11px] text-slate-500">
                      {teacher.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[150px]">
                            {teacher.email}
                          </span>
                        </div>
                      )}
                      {teacher.classesCount !== undefined && (
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-slate-400" />
                          <span>{teacher.classesCount} Class Sections</span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons (Edit, Delete, Restore) */}
                    <div className="flex items-center gap-1">
                      {activeTab === "Deleted" ? (
                        <Button
                          size="xs"
                          variant="ghost"
                          disabled={isCurrentActioning}
                          onClick={() => handleRestore(teacher)}
                          className="text-slate-400 hover:text-emerald-600 cursor-pointer"
                          title="Restore teacher record"
                        >
                          {isCurrentActioning ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                          ) : (
                            <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => openModal?.("edit-teacher", teacher)}
                            className="text-slate-400 hover:text-indigo-600 cursor-pointer"
                            title="Edit faculty member"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            size="xs"
                            variant="ghost"
                            disabled={isCurrentActioning}
                            onClick={() => handleOpenDeleteModal(teacher)}
                            className="text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="Remove teacher record"
                          >
                            {isCurrentActioning ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
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
        isOpen={Boolean(teacherToDelete)}
        onClose={handleCloseDeleteModal}
        title="Remove Faculty Member"
        subtitle="Confirm teacher removal"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Are you sure you want to remove{" "}
            <span className="font-bold text-slate-900">
              {teacherToDelete?.name ||
                `${teacherToDelete?.firstName || ""} ${
                  teacherToDelete?.lastName || ""
                }`.trim() ||
                "this faculty member"}
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
              {isDeleting ? "Removing..." : "Yes, Remove"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}