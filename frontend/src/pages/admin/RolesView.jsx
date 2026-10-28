import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldPlus,
  Lock,
  Pencil,
  Trash2,
  RotateCcw,
  Search,
  Users,
  GraduationCap,
  KeyRound,
  Clock,
  AlertCircle,
  Loader2,
  Sparkles,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import useToast from "../../shared/hooks/useToast";
import { Card } from "../../shared/components/Card";
import { Button } from "../../shared/components/Button";
import { Badge } from "../../shared/components/Badge";
import { Modal } from "../../shared/components/Modal";
import { EmptyState } from "../../shared/components/EmptyState";
import { formatCourseDate } from "../../shared/utils/date";

// TanStack Query Hooks for Roles
import {
  useAdminRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useRestoreRole,
  ADMIN_KEYS,
} from "../../shared/hooks/useAdmin";

// Defensive ID extractor
const getRoleId = (role) =>
  role?.id ?? role?._id ?? role?.roleId;

// Defensive Name extractor
const getRoleName = (role) =>
  role?.name ?? role?.roleName ?? "Unnamed Role";

// Helper to determine if a role is soft-deleted
const isRoleDeleted = (role) => {
  if (!role) return false;
  return Boolean(
    role.deletedAt ||
    role.deleted_at ||
    role.isDeleted === true ||
    role.is_deleted === true ||
    role.status === "Deleted" ||
    role.status === "Archived"
  );
};

// Defensive normalizer for API responses
const normalizeRoles = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.roles)) return data.roles;
  return [];
};

// System role check (IDs 1, 2, 3 or names matching admin/instructor/teacher/student)
const isSystemRole = (role) => {
  const id = Number(getRoleId(role));
  const name = String(getRoleName(role)).toLowerCase();
  return (
    id === 1 ||
    id === 2 ||
    id === 3 ||
    name === "admin" ||
    name === "administrator" ||
    name === "instructor" ||
    name === "teacher" ||
    name === "student"
  );
};

// Cache helpers for instant UI manipulation
const removeRoleFromCache = (oldData, id) => {
  if (!oldData) return oldData;
  const filterFn = (r) => String(getRoleId(r)) !== String(id);
  if (Array.isArray(oldData)) return oldData.filter(filterFn);
  if (Array.isArray(oldData.data))
    return { ...oldData, data: oldData.data.filter(filterFn) };
  if (Array.isArray(oldData.roles))
    return { ...oldData, roles: oldData.roles.filter(filterFn) };
  return oldData;
};

const addRoleToCache = (oldData, role) => {
  if (!oldData || !role) return oldData;
  if (Array.isArray(oldData)) return [role, ...oldData];
  if (Array.isArray(oldData.data))
    return { ...oldData, data: [role, ...oldData.data] };
  if (Array.isArray(oldData.roles))
    return { ...oldData, roles: [role, ...oldData.roles] };
  return oldData;
};

const updateRoleInCache = (oldData, id, updatedFields) => {
  if (!oldData) return oldData;
  const mapFn = (r) =>
    String(getRoleId(r)) === String(id) ? { ...r, ...updatedFields } : r;
  if (Array.isArray(oldData)) return oldData.map(mapFn);
  if (Array.isArray(oldData.data))
    return { ...oldData, data: oldData.data.map(mapFn) };
  if (Array.isArray(oldData.roles))
    return { ...oldData, roles: oldData.roles.map(mapFn) };
  return oldData;
};

// Styling helper for Role Theme / Icons
const getRoleTheme = (role) => {
  const name = String(getRoleName(role)).toLowerCase();
  const id = Number(getRoleId(role));

  if (id === 1 || name.includes("admin")) {
    return {
      title: "Administrator",
      icon: Shield,
      badgeVariant: "purple",
      iconBg: "bg-indigo-50 text-indigo-600 border-indigo-200/80",
      accentBorder: "border-indigo-100 hover:border-indigo-300",
      pillBg: "bg-indigo-50/60 text-indigo-700",
    };
  }
  if (id === 2 || name.includes("teach") || name.includes("instruct") || name.includes("faculty")) {
    return {
      title: "Faculty / Instructor",
      icon: GraduationCap,
      badgeVariant: "emerald",
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200/80",
      accentBorder: "border-emerald-100 hover:border-emerald-300",
      pillBg: "bg-emerald-50/60 text-emerald-700",
    };
  }
  if (id === 3 || name.includes("student") || name.includes("learner")) {
    return {
      title: "Student Matriculant",
      icon: Users,
      badgeVariant: "amber",
      iconBg: "bg-amber-50 text-amber-600 border-amber-200/80",
      accentBorder: "border-amber-100 hover:border-amber-300",
      pillBg: "bg-amber-50/60 text-amber-700",
    };
  }
  return {
    title: getRoleName(role),
    icon: KeyRound,
    badgeVariant: "blue",
    iconBg: "bg-blue-50 text-blue-600 border-blue-200/80",
    accentBorder: "border-slate-200 hover:border-blue-300",
    pillBg: "bg-blue-50/60 text-blue-700",
  };
};

export default function RolesView() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Tab State: "All" (Active Roles) | "Deleted" (Soft-Deleted Roles)
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState(null);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [restoringId, setRestoringId] = useState(null);

  // Forms state
  const [createForm, setCreateForm] = useState({ name: "", description: "" });
  const [createError, setCreateError] = useState("");

  const [editForm, setEditForm] = useState({ id: null, name: "", description: "" });
  const [editError, setEditError] = useState("");

  const [deleteError, setDeleteError] = useState("");

  // ---------------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------------
  // 1. Fetch Active Roles (isDeleted = false)
  const {
    data: activeRolesData,
    isLoading: isLoadingActive,
    isError: isErrorActive,
    error: activeError,
    refetch: refetchActive,
  } = useAdminRoles({ isDeleted: false });

  // 2. Fetch Soft-Deleted Roles (isDeleted = true)
  const {
    data: deletedRolesData,
    isLoading: isLoadingDeleted,
    isError: isErrorDeleted,
    error: deletedError,
    refetch: refetchDeleted,
  } = useAdminRoles({ isDeleted: true });

  // Guarantee strict separation between Active and Deleted datasets
  const activeRoles = useMemo(() => {
    const list = normalizeRoles(activeRolesData);
    return list.filter((r) => !isRoleDeleted(r));
  }, [activeRolesData]);

  const deletedRoles = useMemo(() => {
    const list = normalizeRoles(deletedRolesData);
    return list.filter((r) => isRoleDeleted(r));
  }, [deletedRolesData]);

  // Tab counts
  const counts = useMemo(
    () => ({
      all: activeRoles.length,
      deleted: deletedRoles.length,
      system: activeRoles.filter(isSystemRole).length,
      custom: activeRoles.filter((r) => !isSystemRole(r)).length,
    }),
    [activeRoles, deletedRoles]
  );

  // Current list based on active tab
  const currentList = activeTab === "Deleted" ? deletedRoles : activeRoles;
  const isLoading = activeTab === "Deleted" ? isLoadingDeleted : isLoadingActive;
  const isError = activeTab === "Deleted" ? isErrorDeleted : isErrorActive;
  const error = activeTab === "Deleted" ? deletedError : activeError;
  const refetch = activeTab === "Deleted" ? refetchDeleted : refetchActive;

  // Filter current list with search query
  const filteredRoles = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return currentList;

    return currentList.filter((role) => {
      const name = String(getRoleName(role) || "").toLowerCase();
      const desc = String(role.description || "").toLowerCase();
      const id = String(getRoleId(role) || "").toLowerCase();
      return name.includes(q) || desc.includes(q) || id.includes(q);
    });
  }, [currentList, searchQuery]);

  // Query Keys for Instant Cache Updates
  const activeKey =
    typeof ADMIN_KEYS?.roles === "function"
      ? ADMIN_KEYS.roles({ isDeleted: false })
      : ["adminRoles", { isDeleted: false }];

  const deletedKey =
    typeof ADMIN_KEYS?.roles === "function"
      ? ADMIN_KEYS.roles({ isDeleted: true })
      : ["adminRoles", { isDeleted: true }];

  // ---------------------------------------------------------------------------
  // Mutations
  // ---------------------------------------------------------------------------
  // 1. Create Role
  const { mutate: createRoleMutation, isPending: isCreating } = useCreateRole({
    onSuccess: (response) => {
      const newRole = response?.data || response;
      if (newRole) {
        queryClient.setQueryData(activeKey, (old) => addRoleToCache(old, newRole));
      }
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.allRoles });
      showToast?.(`Role "${createForm.name}" created successfully!`, "success");
      setIsCreateModalOpen(false);
      setCreateForm({ name: "", description: "" });
      setCreateError("");
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Failed to create role. Please try again.";
      setCreateError(msg);
      showToast?.(msg, "error");
    },
  });

  // 2. Update Role
  const { mutate: updateRoleMutation, isPending: isUpdating } = useUpdateRole({
    onSuccess: (response, variables) => {
      const { roleId, payload } = variables;
      const updated = response?.data || response || payload;
      queryClient.setQueryData(activeKey, (old) =>
        updateRoleInCache(old, roleId, updated)
      );
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.allRoles });
      showToast?.("Role updated successfully!", "success");
      setRoleToEdit(null);
      setEditError("");
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Failed to update role. Please try again.";
      setEditError(msg);
      showToast?.(msg, "error");
    },
  });

  // 3. Delete Role (Soft-Delete)
  const { mutate: deleteRoleMutation, isPending: isDeleting } = useDeleteRole({
    onSuccess: (_data, roleId) => {
      const id = roleId || getRoleId(roleToDelete);
      const targetRole = roleToDelete;
      setRoleToDelete(null);
      setDeleteError("");

      // Instant optimistic cache manipulation
      if (id) {
        queryClient.setQueryData(activeKey, (old) =>
          removeRoleFromCache(old, id)
        );
        if (targetRole) {
          queryClient.setQueryData(deletedKey, (old) =>
            addRoleToCache(old, {
              ...targetRole,
              isDeleted: true,
              deletedAt: new Date().toISOString(),
            })
          );
        }
      }
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.allRoles });
      showToast?.("Role moved to Deleted tab. You can restore it anytime.", "success");
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Failed to delete role. It may still be in use by active accounts.";
      setDeleteError(msg);
      showToast?.(msg, "error");
    },
  });

  // 4. Restore Role
  const { mutate: restoreRoleMutation } = useRestoreRole({
    onSuccess: (_data, roleId) => {
      const id = roleId || restoringId;
      const restored = deletedRoles.find(
        (r) => String(getRoleId(r)) === String(id)
      );
      setRestoringId(null);

      // Instant optimistic cache manipulation
      if (id) {
        queryClient.setQueryData(deletedKey, (old) =>
          removeRoleFromCache(old, id)
        );
        if (restored) {
          queryClient.setQueryData(activeKey, (old) =>
            addRoleToCache(old, {
              ...restored,
              isDeleted: false,
              deletedAt: null,
            })
          );
        }
      }
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.allRoles });
      showToast?.("Role restored to Active list successfully!", "success");
    },
    onError: (err) => {
      setRestoringId(null);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Failed to restore role.";
      showToast?.(msg, "error");
    },
  });

  // ---------------------------------------------------------------------------
  // Action Handlers
  // ---------------------------------------------------------------------------
  const handleOpenCreate = () => {
    setCreateForm({ name: "", description: "" });
    setCreateError("");
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    setCreateError("");
    if (!createForm.name.trim()) {
      setCreateError("Role name is required.");
      return;
    }
    createRoleMutation({
      name: createForm.name.trim().toLowerCase(),
      description: createForm.description.trim(),
    });
  };

  const handleOpenEdit = (role) => {
    setEditError("");
    setRoleToEdit(role);
    setEditForm({
      id: getRoleId(role),
      name: getRoleName(role),
      description: role.description || "",
      createdAt: role.createdAt || role.created_at || "",
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setEditError("");
    if (!editForm.name.trim()) {
      setEditError("Role name cannot be empty.");
      return;
    }
    updateRoleMutation({
      roleId: editForm.id,
      payload: {
        name: editForm.name.trim().toLowerCase(),
        description: editForm.description.trim(),
      },
    });
  };

  const handleOpenDelete = (role) => {
    setDeleteError("");
    setRoleToDelete(role);
  };

  const handleDeleteConfirm = () => {
    if (!roleToDelete) return;
    const id = getRoleId(roleToDelete);
    deleteRoleMutation(id);
  };

  const handleRestore = (role) => {
    const id = getRoleId(role);
    setRestoringId(id);
    restoreRoleMutation(id);
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------- */}
      {/* Page Header */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Roles & Access Management
            </h1>
            <Badge variant="indigo" size="sm">
              {counts.all} Active
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Define organizational roles, configure authorization levels, and manage account privileges.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            iconLeft={<ShieldPlus className="w-4 h-4" />}
          >
            Create Role
          </Button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* Summary Stat Pills */}
      {/* ------------------------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900 leading-tight">
              {counts.all}
            </div>
            <div className="text-xs text-slate-500 font-medium">Active Roles</div>
          </div>
        </Card>

        <Card className="p-4 border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/60 flex items-center justify-center text-purple-600 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900 leading-tight">
              {counts.system}
            </div>
            <div className="text-xs text-slate-500 font-medium">System Core Roles</div>
          </div>
        </Card>

        <Card className="p-4 border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600 shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900 leading-tight">
              {counts.custom}
            </div>
            <div className="text-xs text-slate-500 font-medium">Custom Roles</div>
          </div>
        </Card>

        <Card className="p-4 border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-600 shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900 leading-tight">
              {counts.deleted}
            </div>
            <div className="text-xs text-slate-500 font-medium">Soft-Deleted Roles</div>
          </div>
        </Card>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* Tab Navigation & Search Bar */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Active vs Deleted Tabs */}
        <div className="inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveTab("All")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "All"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Active Roles</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "All"
                  ? "bg-indigo-50 text-indigo-700"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("Deleted")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "Deleted"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Deleted Roles</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                counts.deleted > 0
                  ? "bg-rose-100 text-rose-700 font-bold"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {counts.deleted}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search roles by title, keyword, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* Content Area: Loading / Error / Empty / Grid */}
      {/* ------------------------------------------------------------------- */}
      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-600">
            Loading institutional roles...
          </p>
        </div>
      ) : isError ? (
        <Card className="p-8 text-center border-rose-200 bg-rose-50/50">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-rose-900">
            Failed to Load Roles
          </h3>
          <p className="text-xs text-rose-600 mt-1 max-w-md mx-auto">
            {error?.response?.data?.error ||
              error?.message ||
              "Could not communicate with the roles authorization service."}
          </p>
          <div className="mt-4">
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        </Card>
      ) : filteredRoles.length === 0 ? (
        activeTab === "Deleted" ? (
          <EmptyState
            icon={<RotateCcw className="w-8 h-8 text-slate-400" />}
            title="Recycle Bin is Empty"
            description="There are currently no soft-deleted roles in the archive. Deleting a role from the active list will place it here for recovery."
          />
        ) : (
          <EmptyState
            icon={<ShieldAlert className="w-8 h-8 text-slate-400" />}
            title={searchQuery ? "No Matching Roles Found" : "No Roles Defined"}
            description={
              searchQuery
                ? `No role records matched "${searchQuery}". Check for typos or reset your search filter.`
                : "Get started by creating your institution's initial governance roles."
            }
            actionLabel={searchQuery ? "Clear Search" : "+ Create First Role"}
            onAction={searchQuery ? () => setSearchQuery("") : handleOpenCreate}
          />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          <AnimatePresence mode="popLayout">
            {filteredRoles.map((role) => {
              const id = getRoleId(role);
              const name = getRoleName(role);
              const theme = getRoleTheme(role);
              const Icon = theme.icon;
              const isSys = isSystemRole(role);
              const isDeleted = isRoleDeleted(role);
              const isRestoring = restoringId === id;

              return (
                <motion.div
                  key={id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    hoverEffect
                    className={`p-5 flex flex-col justify-between h-full border ${theme.accentBorder} transition-all duration-200 relative overflow-hidden group`}
                  >
                    {/* Top Section */}
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-xs ${theme.iconBg} shrink-0`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-slate-900 capitalize leading-snug">
                                {name}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-[11px] font-semibold text-slate-400">
                                ID #{id}
                              </span>
                              <span className="text-slate-300">•</span>
                              {isSys ? (
                                <Badge variant={theme.badgeVariant} size="sm">
                                  System Default
                                </Badge>
                              ) : (
                                <Badge variant="blue" size="sm">
                                  Custom Role
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        {isDeleted ? (
                          <Badge variant="rose" size="sm" dot>
                            Deleted
                          </Badge>
                        ) : (
                          <Badge variant="emerald" size="sm" dot>
                            Active
                          </Badge>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed min-h-[3rem]">
                        {role.description ||
                          (isSys
                            ? `Primary institutional account role for ${name} permissions across the platform.`
                            : "Custom organizational role with tailored application privileges.")}
                      </p>
                    </div>

                    {/* Middle: Audit Info */}
                    <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col gap-1.5 text-[11px] text-slate-400">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Created:
                        </span>
                        <span className="font-mono text-slate-700 font-medium">
                          {formatCourseDate(role.createdAt || role.created_at)}
                        </span>
                      </div>

                      {isDeleted && (
                        <div className="flex items-center justify-between text-rose-600">
                          <span className="flex items-center gap-1.5 font-medium">
                            <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                            Archived:
                          </span>
                          <span className="font-mono text-rose-700 font-medium">
                            {formatCourseDate(role.deletedAt || role.deleted_at)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3.5 mt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                      {isDeleted ? (
                        <Button
                          size="sm"
                          variant="subtle"
                          onClick={() => handleRestore(role)}
                          disabled={isRestoring}
                          loading={isRestoring}
                          iconLeft={!isRestoring && <RotateCcw className="w-3.5 h-3.5" />}
                          className="w-full text-indigo-700 font-semibold"
                        >
                          {isRestoring ? "Restoring..." : "Restore Role"}
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenEdit(role)}
                            iconLeft={<Pencil className="w-3.5 h-3.5 text-slate-500" />}
                            className="text-slate-600 hover:text-slate-900"
                          >
                            Edit
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenDelete(role)}
                            iconLeft={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 1. Create Role Modal */}
      {/* ------------------------------------------------------------------- */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Role"
        subtitle="Establish an authorization role and define access responsibilities"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {createError && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{createError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Role Name *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. Dean of Admissions, Lab Coordinator"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm({ ...createForm, name: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all shadow-xs"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Role name will be normalized for secure identity routing.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Role Description
            </label>
            <textarea
              rows={3}
              placeholder="Outline the scope, governance authority, and operational responsibilities for this role..."
              value={createForm.description}
              onChange={(e) =>
                setCreateForm({ ...createForm, description: e.target.value })
              }
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all shadow-xs resize-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isCreating}
              iconLeft={isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldPlus className="w-4 h-4" />}
            >
              {isCreating ? "Creating Role..." : "Create Role"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ------------------------------------------------------------------- */}
      {/* 2. Edit Role Modal */}
      {/* ------------------------------------------------------------------- */}
      <Modal
        isOpen={Boolean(roleToEdit)}
        onClose={() => setRoleToEdit(null)}
        title="Edit Role Details"
        subtitle={`Update attributes for role #${editForm.id} (${editForm.name})`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {editError && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{editError}</span>
            </div>
          )}

          {/* Audit banner */}
          <div className="p-3.5 bg-slate-50/90 border border-slate-200/80 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600 font-medium">
              <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Security & Role Information
              </span>
              <span className="font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200/80">
                Role ID: #{editForm.id}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600">
              <div className="flex items-center gap-2 bg-white px-2.5 py-2 rounded-lg border border-slate-200/70">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <div className="truncate">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    Created At
                  </span>
                  <span className="font-mono font-medium text-slate-800">
                    {formatCourseDate(editForm.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white px-2.5 py-2 rounded-lg border border-slate-200/70">
                <Lock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <div className="truncate">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    Hierarchy Tier
                  </span>
                  <span className="font-mono font-medium text-slate-800">
                    {isSystemRole(roleToEdit) ? "Protected System Role" : "Custom Application Role"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Role Name *
            </label>
            <input
              type="text"
              required
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Role Description
            </label>
            <textarea
              rows={3}
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all shadow-xs resize-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setRoleToEdit(null)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isUpdating}
              iconLeft={isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ------------------------------------------------------------------- */}
      {/* 3. Delete Confirmation Modal */}
      {/* ------------------------------------------------------------------- */}
      <Modal
        isOpen={Boolean(roleToDelete)}
        onClose={() => setRoleToDelete(null)}
        title="Soft-Delete Role"
        subtitle="Archive role and move to deleted tab"
      >
        <div className="space-y-4">
          {deleteError ? (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Unable to delete this role:</p>
                <p className="mt-0.5">{deleteError}</p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-900">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-semibold">
                  Are you sure you want to delete the "{getRoleName(roleToDelete)}" role?
                </p>
                <p className="text-rose-700">
                  This role will be soft-deleted and moved into the <strong>Deleted Roles</strong> tab. You can restore it at any time.
                </p>
              </div>
            </div>
          )}

          {isSystemRole(roleToDelete) && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>System Safety Rule:</strong> Roles actively assigned to enrolled users or teachers cannot be deleted by design until users are reassigned.
              </span>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setRoleToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              iconLeft={isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            >
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
