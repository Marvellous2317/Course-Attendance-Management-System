import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  // Courses
  getCourse,
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  restoreCourse,
  getCourseStudents,
  getCourseTeachers,
  // Teachers
  getTeacher,
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  restoreTeacher,
  assignCoursesToTeacher,
  unassignCoursesFromTeacher,
  // Roles
  getRole,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  restoreRole,
  getStudent,
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  restoreStudent,
  enrollStudentOfferings,
  unenrollStudentOfferings,
  getAdminDashboard,
  getAdminStudentEnrollments,
  getAdminOfferings,
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

  roles: (params = {}) => ["adminRoles", params],
  allRoles: ["adminRoles"],
  role: (roleId) => ["adminRole", roleId],

  students: (params = {}) => ["adminStudents", params],
  allStudents: ["adminStudents"], // Prefix matching all active/deleted/paginated student queries
  student: (id) => ["adminStudent", id],

  dashboard: ["adminDashboard"],
  analytics: ["adminDashboard"],

  // Course Students
  courseStudents: (courseId, params = {}) => ["adminCourseStudents", courseId, params],
  allCourseStudents: (courseId) => ["adminCourseStudents", courseId],
  // Course Teachers
  courseTeachers: (courseId, params = {}) => ["adminCourseTeachers", courseId, params],
  allCourseTeachers: (courseId) => ["adminCourseTeachers", courseId],

  studentEnrollments: (studentId, params = {}) => [
    "adminStudentEnrollments",
    studentId,
    params,
  ],
  allStudentEnrollments: (studentId) => [
    "adminStudentEnrollments",
    studentId,
  ],

  offerings: (params = {}) => ["adminOfferings", params],
  allOfferings: ["adminOfferings"],
};


export const useAdminDashboard = (options = {}) =>
  useQuery({
    queryKey: ADMIN_KEYS.dashboard,
    queryFn: getAdminDashboard,
    // Optional sensible defaults: refetch when window refocuses or keep fresh for 1 min
    staleTime: 1000 * 60,
    ...options,
  });


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
  const search = params?.search || "";
  const page = params?.page || 1;
  const perPage = params?.perPage || 20;
  return useQuery({
    queryKey: ADMIN_KEYS.courses({ isDeleted, search, page, perPage }),
    queryFn: () => getCourses({ isDeleted, search, page, perPage }),
    placeholderData: (prev) => prev,
    ...options,
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
  const { onSuccess, ...restOptions } = options; // Prevents options from overwriting onSuccess
  return useMutation({
    mutationFn: (id) => deleteCourse(id),
    onSuccess: (data, id, context) => {
      queryClient.invalidateQueries({ queryKey: ["adminCourses"] });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.course(id) });
      onSuccess?.(data, id, context);
    },
    ...restOptions,
  });
};

export const useRestoreCourse = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options; // Prevents options from overwriting onSuccess
  return useMutation({
    mutationFn: (id) => restoreCourse(id),
    onSuccess: (data, id, context) => {
      queryClient.invalidateQueries({ queryKey: ["adminCourses"] });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.course(id) });
      onSuccess?.(data, id, context);
    },
    ...restOptions,
  });
};

// ----------------------------------------------------------------------------------
export const useAdminCourseStudents = (courseId, params = {}, options = {}) =>
  useQuery({
    queryKey: ADMIN_KEYS.courseStudents(courseId, params),
    queryFn: () => getCourseStudents(courseId, params),
    enabled: Boolean(courseId), // Prevents request if courseId is null or undefined
    placeholderData: (previousData) => previousData, // Keeps previous page data while fetching next page
    ...options,
  });
// ----------------------------------------------------------------------------------
// Course Teachers Hook
// ----------------------------------------------------------------------------------
export const useAdminCourseTeachers = (courseId, params = {}, options = {}) =>
  useQuery({
    queryKey: ADMIN_KEYS.courseTeachers(courseId, params),
    queryFn: () => getCourseTeachers(courseId, params),
    enabled: Boolean(courseId), // Prevents request if courseId is null or undefined
    placeholderData: (previousData) => previousData,
    ...options,
  });


// ----------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------
// Teacher Cache Helpers
// ----------------------------------------------------------------------------------
const updateTeacherListCache = (oldData, updateFn) => {
  if (!oldData) return oldData;
  if (Array.isArray(oldData)) {
    return updateFn(oldData);
  }
  if (oldData.teachers && Array.isArray(oldData.teachers)) {
    return { ...oldData, teachers: updateFn(oldData.teachers) };
  }
  if (oldData.data && Array.isArray(oldData.data)) {
    return { ...oldData, data: updateFn(oldData.data) };
  }
  return oldData;
};

const matchTeacherId = (item, targetId) =>
  String(item?._id || item?.id || item?.teacherId) === String(targetId);




// ----------------------------------------------------------------------------------
// Teachers Hooks (Instant Real-Time Updates)
// ----------------------------------------------------------------------------------

export const useAdminTeachers = (params = {}, options = {}) => {
  const queryParams = typeof params === "boolean" ? { isDeleted: params } : params;
  const { isDeleted = false, search = "", page = 1, perPage = 20, ...restParams } = queryParams;
  return useQuery({
    queryKey: ADMIN_KEYS.teachers({ isDeleted, search, page, perPage, ...restParams }),
    queryFn: () => getTeachers({ isDeleted, search, page, perPage, ...restParams }),
    placeholderData: (prev) => prev,
    ...options,
  });
};

export const useAdminTeacher = (teacherId, options = {}) =>
  useQuery({
    queryKey: ADMIN_KEYS.teacher(teacherId),
    queryFn: () => getTeacher(teacherId),
    enabled: Boolean(teacherId),
    ...options,
  });

export const useCreateTeacher = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options; // Destructure to prevent overwrite

  return useMutation({
    mutationFn: createTeacher,
    onSuccess: (data, variables, context) => {
      const newTeacher =
        data?.teacher || data?.data || (data?.email ? data : null);

      // 1. INSTANT UI UPDATE: Inject new teacher directly into cache immediately
      if (newTeacher) {
        queryClient.setQueryData(ADMIN_KEYS.teachers, (old) =>
          updateTeacherListCache(old, (list) => [newTeacher, ...list])
        );
      }

      // 2. Background sync with backend
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.teachers });

      // 3. Trigger modal close & form reset
      onSuccess?.(data, variables, context);
    },
    ...restOptions, // Safe spread
  });
};

export const useUpdateTeacher = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;

  return useMutation({
    mutationFn: ({ teacherId, payload }) => updateTeacher(teacherId, payload),
    onSuccess: (data, variables, context) => {
      const { teacherId, payload } = variables;
      const updatedItem = data?.teacher || data?.data || data;

      // 1. INSTANT UI UPDATE: Update teacher in cache
      queryClient.setQueryData(ADMIN_KEYS.teachers, (old) =>
        updateTeacherListCache(old, (list) =>
          list.map((t) =>
            matchTeacherId(t, teacherId)
              ? { ...t, ...payload, ...updatedItem }
              : t
          )
        )
      );

      // 2. Invalidate queries
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.teachers });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.teacher(teacherId) });

      onSuccess?.(data, variables, context);
    },
    ...restOptions,
  });
};

export const useDeleteTeacher = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options; // Prevents options from overwriting onSuccess!
  return useMutation({
    mutationFn: (teacherId) => deleteTeacher(teacherId),
    onSuccess: (data, teacherId, context) => {
      // Invalidate both Active and Deleted lists (prefix matching)
      queryClient.invalidateQueries({ queryKey: ["adminTeachers"] });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.teacher(teacherId) });
      onSuccess?.(data, teacherId, context);
    },
    ...restOptions,
  });
};


export const useRestoreTeacher = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options; // Prevents options from overwriting onSuccess!
  return useMutation({
    mutationFn: (teacherId) => restoreTeacher(teacherId),
    onSuccess: (data, teacherId, context) => {
      // Invalidate both Active and Deleted lists (prefix matching)
      queryClient.invalidateQueries({ queryKey: ["adminTeachers"] });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.teacher(teacherId) });
      onSuccess?.(data, teacherId, context);
    },
    ...restOptions,
  });
};

// ----------------------------------------------------------------------------------
// Student Cache Helpers
// ----------------------------------------------------------------------------------
const updateStudentListCache = (oldData, updateFn) => {
  if (!oldData) return oldData;
  if (Array.isArray(oldData)) {
    return updateFn(oldData);
  }
  if (oldData.students && Array.isArray(oldData.students)) {
    return { ...oldData, students: updateFn(oldData.students) };
  }
  if (oldData.data && Array.isArray(oldData.data)) {
    return { ...oldData, data: updateFn(oldData.data) };
  }
  return oldData;
};
const matchStudentId = (item, targetId) =>
  String(item?._id || item?.id || item?.studentId) === String(targetId);

// ----------------------------------------------------------------------------------
// Students Hooks
// ----------------------------------------------------------------------------------
// 1. Fetch Students (supports pagination: page, perPage, and isDeleted: true/false)
export const useAdminStudents = (params = {}, options = {}) => {
  const { page = 1, perPage = 20, isDeleted = false, search = "", ...restParams } = params;
  const queryParams = { page, perPage, isDeleted, search, ...restParams };
  return useQuery({
    queryKey: ADMIN_KEYS.students(queryParams),
    queryFn: () => getStudents(queryParams),
    placeholderData: (prev) => prev,
    ...options,
  });
};
// 2. Fetch Single Student by ID
export const useAdminStudent = (id, options = {}) =>
  useQuery({
    queryKey: ADMIN_KEYS.student(id),
    queryFn: () => getStudent(id),
    enabled: Boolean(id),
    ...options,
  });
// 3. Create Student
export const useCreateStudent = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;
  return useMutation({
    mutationFn: createStudent,
    onSuccess: (data, variables, context) => {
      // Invalidate all student list queries (prefix matching refreshes all tabs/pages)
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.allStudents });
      onSuccess?.(data, variables, context);
    },
    ...restOptions,
  });
};
// 4. Update Student
export const useUpdateStudent = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;
  return useMutation({
    mutationFn: ({ id, payload }) => updateStudent(id, payload),
    onSuccess: (data, variables, context) => {
      const { id, payload } = variables;
      const updatedItem = data?.student || data?.data || data;
      // 1. Instant UI update in cache
      queryClient.setQueryData(ADMIN_KEYS.allStudents, (old) =>
        updateStudentListCache(old, (list) =>
          list.map((s) =>
            matchStudentId(s, id) ? { ...s, ...payload, ...updatedItem } : s
          )
        )
      );
      // 2. Invalidate queries for background consistency
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.allStudents });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.student(id) });
      onSuccess?.(data, variables, context);
    },
    ...restOptions,
  });
};
// 5. Delete Student (Soft Delete)
export const useDeleteStudent = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;
  return useMutation({
    mutationFn: (id) => deleteStudent(id),
    onSuccess: (data, id, context) => {
      // Invalidate both active and deleted lists
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.allStudents });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.student(id) });
      onSuccess?.(data, id, context);
    },
    ...restOptions,
  });
};
// 6. Restore Student
export const useRestoreStudent = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;
  return useMutation({
    mutationFn: (id) => restoreStudent(id),
    onSuccess: (data, id, context) => {
      // Invalidate both active and deleted lists
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.allStudents });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.student(id) });
      onSuccess?.(data, id, context);
    },
    ...restOptions,
  });
};

// Resolves the course IDs touched by an assign/unassign mutation, whichever
// shape the caller used ({ courseIds } or { payload: { courseIds } }).
const getMutationCourseIds = (variables = {}) => {
  const raw = variables.payload?.courseIds ?? variables.courseIds ?? [];
  if (!Array.isArray(raw)) return [];
  return Array.from(new Set(raw.map(Number).filter(Boolean)));
};

// Invalidate every cached query that depends on teacher↔course assignments:
// the teacher lists (active, deleted, every page/search), the single teacher,
// and the teacher roster of each affected course.
const invalidateTeacherAssignmentQueries = (
  queryClient,
  { teacherId, courseIds = [] } = {},
) => {
  const invalidations = [
    queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.allTeachers }),
  ];

  if (teacherId) {
    invalidations.push(
      queryClient.invalidateQueries({
        queryKey: ADMIN_KEYS.teacher(teacherId),
      }),
    );
  }

  courseIds.forEach((courseId) => {
    invalidations.push(
      queryClient.invalidateQueries({
        queryKey: ADMIN_KEYS.allCourseTeachers(courseId),
      }),
    );
  });

  return Promise.all(invalidations);
};

export const useAssignCoursesToTeacher = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;
  return useMutation({
    mutationFn: ({ teacherId, id, payload, courseIds }) => {
      const targetId = teacherId ?? id;
      const body = payload ?? (courseIds ? { courseIds } : {});
      return assignCoursesToTeacher(targetId, body);
    },
    onSuccess: (data, variables, context) => {
      const targetId = variables.teacherId ?? variables.id;

      // Refresh teacher lists/records and the affected courses' teacher rosters.
      invalidateTeacherAssignmentQueries(queryClient, {
        teacherId: targetId,
        courseIds: getMutationCourseIds(variables),
      });

      onSuccess?.(data, variables, context);
    },
    ...restOptions,
  });
};
// ----------------------------------------------------------------------------------
// Unassign Courses from Teacher (Removes specified courses)
// ----------------------------------------------------------------------------------
export const useUnassignCoursesFromTeacher = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;
  return useMutation({
    mutationFn: ({ teacherId, id, payload, courseIds }) => {
      const targetId = teacherId ?? id;
      const body = payload ?? (courseIds ? { courseIds } : {});
      return unassignCoursesFromTeacher(targetId, body);
    },
    onSuccess: (data, variables, context) => {
      const targetId = variables.teacherId ?? variables.id;

      // Refresh teacher lists/records and the affected courses' teacher rosters.
      invalidateTeacherAssignmentQueries(queryClient, {
        teacherId: targetId,
        courseIds: getMutationCourseIds(variables),
      });

      onSuccess?.(data, variables, context);
    },
    ...restOptions,
  });
};


// 7. Enroll Student into Course Offerings
export const useEnrollStudentOfferings = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;
  return useMutation({
    mutationFn: ({ id, payload }) => enrollStudentOfferings(id, payload),
    onSuccess: (data, variables, context) => {
      const { id } = variables;
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.allStudents });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.student(id) });
      onSuccess?.(data, variables, context);
    },
    ...restOptions,
  });
};
// 8. Unenroll Student from Course Offerings
export const useUnenrollStudentOfferings = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;
  return useMutation({
    mutationFn: ({ id, payload }) => unenrollStudentOfferings(id, payload),
    onSuccess: (data, variables, context) => {
      const { id } = variables;
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.allStudents });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.student(id) });
      onSuccess?.(data, variables, context);
    },
    ...restOptions,
  });
};

// ----------------------------------------------------------------------------------
// Roles Hooks
// ----------------------------------------------------------------------------------

export const useAdminRoles = (params = {}, options = {}) => {
  const isDeleted = Boolean(params?.isDeleted);
  const queryOptions = { ...params, ...options };
  delete queryOptions.isDeleted;
  const key =
    typeof ADMIN_KEYS.roles === "function"
      ? ADMIN_KEYS.roles({ isDeleted })
      : ["adminRoles", { isDeleted }];
  return useQuery({
    queryKey: key,
    queryFn: () => getRoles({ isDeleted }),
    ...queryOptions,
  });
};

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
      queryClient.invalidateQueries({ queryKey: ["adminRoles"] });
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
      queryClient.invalidateQueries({ queryKey: ["adminRoles"] });
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
      queryClient.invalidateQueries({ queryKey: ["adminRoles"] });
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
      queryClient.invalidateQueries({ queryKey: ["adminRoles"] });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.role(roleId) });
      options.onSuccess?.(data, roleId, context);
    },
    ...options,
  });
};

export const useAdminStudentEnrollments = (
  studentId,
  params = {},
  options = {}
) => {
  return useQuery({
    queryKey: ADMIN_KEYS.studentEnrollments(studentId, params),
    queryFn: () => getAdminStudentEnrollments(studentId, params),
    enabled: Boolean(studentId),
    placeholderData: (prev) => prev,
    ...options,
  });
};

export const useAdminOfferings = (queryParams = {}, options = {}) => {
  const { search = "", page = 1, perPage = 20, ...rest } = queryParams;
  return useQuery({
    queryKey: ADMIN_KEYS.offerings({ search, page, perPage, ...rest }),
    queryFn: () => getAdminOfferings({ search, page, perPage, ...rest }),
    placeholderData: (prev) => prev,
    ...options,
  });
};

