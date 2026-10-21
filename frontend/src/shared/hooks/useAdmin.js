import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  // Courses
  getCourse,
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  restoreCourse,
  // Teachers
  getTeacher,
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  restoreTeacher,
  // Roles
  getRole,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  restoreRole,
} from "../api/admin";

// ----------------------------------------------------------------------------------
// Query Keys
// ----------------------------------------------------------------------------------
export const ADMIN_KEYS = {
  courses: (params = {}) => ["adminCourses", params],
  allCourses: ["adminCourses"], // Invalidation prefix matching both active & deleted
  course: (id) => ["adminCourse", id],
  teachers: (params = {}) => ["adminTeachers", params],
  allTeachers: ["adminTeachers"],
  teacher: (teacherId) => ["adminTeacher", teacherId],
  roles: ["adminRoles"],
  role: (roleId) => ["adminRole", roleId],
};
// // ----------------------------------------------------------------------------------
// // Courses Hooks
// // ----------------------------------------------------------------------------------

// Helper to extract course array safely from cache
const updateCourseListCache = (oldData, updateFn) => {
  if (!oldData) return oldData;
  if (Array.isArray(oldData)) {
    return updateFn(oldData);
  }
  if (oldData.courses && Array.isArray(oldData.courses)) {
    return { ...oldData, courses: updateFn(oldData.courses) };
  }
  if (oldData.data && Array.isArray(oldData.data)) {
    return { ...oldData, data: updateFn(oldData.data) };
  }
  return oldData;
};

// Helper to get matching ID (_id or id)
const matchId = (item, targetId) =>
  String(item?._id || item?.id) === String(targetId);

// ----------------------------------------------------------------------------------
// Courses Hooks (Instant Real-Time Updates)
// ----------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------
// Courses Hooks
// ----------------------------------------------------------------------------------
export const useAdminCourses = (params = {}, options = {}) => {
  const isDeleted = Boolean(params?.isDeleted);
  const queryOptions = { ...params, ...options };
  delete queryOptions.isDeleted;
  return useQuery({
    queryKey: ADMIN_KEYS.courses({ isDeleted }),
    queryFn: () => getCourses({ isDeleted }),
    ...queryOptions,
  });
};
export const useAdminCourse = (id, options = {}) =>
  useQuery({
    queryKey: ADMIN_KEYS.course(id),
    queryFn: () => getCourse(id),
    enabled: Boolean(id),
    ...options,
  });
export const useCreateCourse = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;
  return useMutation({
    mutationFn: createCourse,
    onSuccess: (data, variables, context) => {
      // Refetch all course queries (both active and deleted)
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.allCourses });
      onSuccess?.(data, variables, context);
    },
    ...restOptions,
  });
};
export const useUpdateCourse = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;
  return useMutation({
    mutationFn: ({ id, payload }) => updateCourse(id, payload),
    onSuccess: (data, variables, context) => {
      const { id } = variables;
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.allCourses });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.course(id) });
      onSuccess?.(data, variables, context);
    },
    ...restOptions,
  });
};
export const useDeleteCourse = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;
  return useMutation({
    mutationFn: (id) => deleteCourse(id),
    onSuccess: (data, id, context) => {
      // 1. Instant UI update: Remove from active courses cache immediately
      queryClient.setQueryData(ADMIN_KEYS.courses({ isDeleted: false }), (old) =>
        updateCourseListCache(old, (list) => list.filter((c) => !matchId(c, id)))
      );
      // 2. Refetch both active and deleted lists from server
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.allCourses });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.course(id) });
      onSuccess?.(data, id, context);
    },
    ...restOptions,
  });
};
export const useRestoreCourse = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;
  return useMutation({
    mutationFn: (id) => restoreCourse(id),
    onSuccess: (data, id, context) => {
      // 1. Instant UI update: Remove from deleted courses cache immediately
      queryClient.setQueryData(ADMIN_KEYS.courses({ isDeleted: true }), (old) =>
        updateCourseListCache(old, (list) => list.filter((c) => !matchId(c, id)))
      );
      // 2. Refetch both active and deleted lists from server
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.allCourses });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.course(id) });
      onSuccess?.(data, id, context);
    },
    ...restOptions,
  });
};

// export const useAdminCourses = (options = {}) =>
//   useQuery({
//     queryKey: ADMIN_KEYS.courses,
//     queryFn: getCourses,
//     ...options,
//   });

// export const useAdminCourse = (id, options = {}) =>
//   useQuery({
//     queryKey: ADMIN_KEYS.course(id),
//     queryFn: () => getCourse(id),
//     enabled: Boolean(id),
//     ...options,
//   });

// export const useCreateCourse = (options = {}) => {
//   const queryClient = useQueryClient();
//   const { onSuccess, ...restOptions } = options;

//   return useMutation({
//     mutationFn: createCourse,
//     onSuccess: (data, variables, context) => {
//       const newCourse = data?.course || data?.data || (data?.code ? data : null);

//       // 1. INSTANT UI UPDATE: Inject new course into cache immediately
//       if (newCourse) {
//         queryClient.setQueryData(ADMIN_KEYS.courses, (old) =>
//           updateCourseListCache(old, (list) => [newCourse, ...list])
//         );
//       }

//       // 2. Refetch in background to stay 100% in sync
//       queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.courses });

//       // 3. Trigger your modal close & form reset
//       onSuccess?.(data, variables, context);
//     },
//     ...restOptions,
//   });
// };

// export const useUpdateCourse = (options = {}) => {
//   const queryClient = useQueryClient();
//   const { onSuccess, ...restOptions } = options;

//   return useMutation({
//     mutationFn: ({ id, payload }) => updateCourse(id, payload),
//     onSuccess: (data, variables, context) => {
//       const { id, payload } = variables;
//       const updatedItem = data?.course || data?.data || data;

//       // 1. INSTANT UI UPDATE: Update course in cache immediately
//       queryClient.setQueryData(ADMIN_KEYS.courses, (old) =>
//         updateCourseListCache(old, (list) =>
//           list.map((c) =>
//             matchId(c, id) ? { ...c, ...payload, ...updatedItem } : c
//           )
//         )
//       );

//       // 2. Invalidate cache for background consistency
//       queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.courses });
//       queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.course(id) });

//       // 3. Trigger modal close
//       onSuccess?.(data, variables, context);
//     },
//     ...restOptions,
//   });
// };

// export const useDeleteCourse = (options = {}) => {
//   const queryClient = useQueryClient();
//   const { onSuccess, ...restOptions } = options;

//   return useMutation({
//     mutationFn: (id) => deleteCourse(id),
//     onSuccess: (data, id, context) => {
//       // 1. INSTANT UI UPDATE: Mark as deleted in cache immediately
//       queryClient.setQueryData(ADMIN_KEYS.courses, (old) =>
//         updateCourseListCache(old, (list) =>
//           list.map((c) =>
//             matchId(c, id) ? { ...c, isDeleted: true, status: "Deleted" } : c
//           )
//         )
//       );

//       // 2. Refetch from server
//       queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.courses });
//       queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.course(id) });

//       onSuccess?.(data, id, context);
//     },
//     ...restOptions,
//   });
// };

// export const useRestoreCourse = (options = {}) => {
//   const queryClient = useQueryClient();
//   const { onSuccess, ...restOptions } = options;

//   return useMutation({
//     mutationFn: (id) => restoreCourse(id),
//     onSuccess: (data, id, context) => {
//       // 1. INSTANT UI UPDATE: Mark as active in cache immediately
//       queryClient.setQueryData(ADMIN_KEYS.courses, (old) =>
//         updateCourseListCache(old, (list) =>
//           list.map((c) =>
//             matchId(c, id) ? { ...c, isDeleted: false, status: "Active" } : c
//           )
//         )
//       );

//       // 2. Refetch from server
//       queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.courses });
//       queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.course(id) });

//       onSuccess?.(data, id, context);
//     },
//     ...restOptions,
//   });
// };

// ----------------------------------------------------------------------------------
// Teachers Hooks
// ----------------------------------------------------------------------------------

export const useAdminTeachers = (options = {}) =>
  useQuery({
    queryKey: ADMIN_KEYS.teachers,
    queryFn: getTeachers,
    ...options,
  });

export const useAdminTeacher = (teacherId, options = {}) =>
  useQuery({
    queryKey: ADMIN_KEYS.teacher(teacherId),
    queryFn: () => getTeacher(teacherId),
    enabled: Boolean(teacherId),
    ...options,
  });

export const useCreateTeacher = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTeacher,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.teachers });
      options.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUpdateTeacher = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teacherId, payload }) => updateTeacher(teacherId, payload),
    onSuccess: (data, { teacherId }, context) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.teachers });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.teacher(teacherId) });
      options.onSuccess?.(data, { teacherId }, context);
    },
    ...options,
  });
};

export const useDeleteTeacher = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teacherId) => deleteTeacher(teacherId),
    onSuccess: (data, teacherId, context) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.teachers });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.teacher(teacherId) });
      options.onSuccess?.(data, teacherId, context);
    },
    ...options,
  });
};

export const useRestoreTeacher = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teacherId) => restoreTeacher(teacherId),
    onSuccess: (data, teacherId, context) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.teachers });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.teacher(teacherId) });
      options.onSuccess?.(data, teacherId, context);
    },
    ...options,
  });
};

// ----------------------------------------------------------------------------------
// Roles Hooks
// ----------------------------------------------------------------------------------

export const useAdminRoles = (options = {}) =>
  useQuery({
    queryKey: ADMIN_KEYS.roles,
    queryFn: getRoles,
    ...options,
  });

export const useAdminRole = (roleId, options = {}) =>
  useQuery({
    queryKey: ADMIN_KEYS.role(roleId),
    queryFn: () => getRole(roleId),
    enabled: Boolean(roleId),
    ...options,
  });

export const useCreateRole = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRole,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.roles });
      options.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUpdateRole = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, payload }) => updateRole(roleId, payload),
    onSuccess: (data, { roleId }, context) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.roles });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.role(roleId) });
      options.onSuccess?.(data, { roleId }, context);
    },
    ...options,
  });
};

export const useDeleteRole = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleId) => deleteRole(roleId),
    onSuccess: (data, roleId, context) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.roles });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.role(roleId) });
      options.onSuccess?.(data, roleId, context);
    },
    ...options,
  });
};

export const useRestoreRole = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleId) => restoreRole(roleId),
    onSuccess: (data, roleId, context) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.roles });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.role(roleId) });
      options.onSuccess?.(data, roleId, context);
    },
    ...options,
  });
};

// ----------------------------------------------------------------------------------
// Aliases (Optional convenience exports)
// ----------------------------------------------------------------------------------
export const useCourses = useAdminCourses;
export const useCourse = useAdminCourse;
export const useTeachers = useAdminTeachers;
export const useTeacher = useAdminTeacher;
export const useRoles = useAdminRoles;
export const useRole = useAdminRole;