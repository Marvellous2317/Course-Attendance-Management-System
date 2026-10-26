import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getStudentDashboard,
  getStudentAttendance,
  getStudentOfferings,
  getStudentEnrollments,
  enrollStudentOfferings,
  dropStudentOffering,
} from "../api/student";

// ----------------------------------------------------------------------------------
// Query Keys
// ----------------------------------------------------------------------------------
export const STUDENT_KEYS = {
  // Dashboard Key
  dashboard: ["studentDashboard"],

  // Attendance Keys
  attendance: (params = {}) => ["studentAttendance", params],
  allAttendance: ["studentAttendance"],

  // Course Offerings (Catalogue) Keys
  offerings: (params = {}) => ["studentOfferings", params],
  allOfferings: ["studentOfferings"],

  // Enrollments Keys
  enrollments: (params = {}) => ["studentEnrollments", params],
  allEnrollments: ["studentEnrollments"],
};

// ----------------------------------------------------------------------------------
// Cache Helpers (for Instant 0ms Optimistic UI Updates)
// ----------------------------------------------------------------------------------
const updateEnrollmentListCache = (oldData, updateFn) => {
  if (!oldData) return oldData;
  if (Array.isArray(oldData)) {
    return updateFn(oldData);
  }
  if (Array.isArray(oldData.data)) {
    return { ...oldData, data: updateFn(oldData.data) };
  }
  if (Array.isArray(oldData.enrollments)) {
    return { ...oldData, enrollments: updateFn(oldData.enrollments) };
  }
  return oldData;
};

const matchOfferingId = (item, targetId) =>
  String(item?.id || item?.offeringId || item?.courseOfferingId) === String(targetId);

// ----------------------------------------------------------------------------------
// 1. Dashboard & Analytics Hook
// ----------------------------------------------------------------------------------
/**
 * Fetches authenticated student's dashboard metrics:
 * - enrolledOfferings
 * - upcomingSessions
 * - attendanceMarked
 * - attendancePresent
 * - attendancePercentage
 */
export const useStudentDashboard = (options = {}) =>
  useQuery({
    queryKey: STUDENT_KEYS.dashboard,
    queryFn: getStudentDashboard,
    staleTime: 1000 * 60, // Keep fresh for 1 min
    ...options,
  });

// ----------------------------------------------------------------------------------
// 2. Attendance Hook
// ----------------------------------------------------------------------------------
/**
 * Fetches authenticated student's attendance records and percentages per offering
 * Supports pagination: { page: 1, perPage: 20 }
 */
export const useStudentAttendance = (params = {}, options = {}) => {
  const { page = 1, perPage = 20, ...restParams } = params;
  const queryParams = { page, perPage, ...restParams };

  return useQuery({
    queryKey: STUDENT_KEYS.attendance(queryParams),
    queryFn: () => getStudentAttendance(queryParams),
    ...options,
  });
};

// ----------------------------------------------------------------------------------
// 3. Browse Course Offerings Hook
// ----------------------------------------------------------------------------------
/**
 * Fetches the active course catalog offerings available for enrollment
 * Supports pagination: { page: 1, perPage: 20 }
 */
export const useStudentOfferings = (params = {}, options = {}) => {
  const { page = 1, perPage = 20, ...restParams } = params;
  const queryParams = { page, perPage, ...restParams };

  return useQuery({
    queryKey: STUDENT_KEYS.offerings(queryParams),
    queryFn: () => getStudentOfferings(queryParams),
    ...options,
  });
};

// ----------------------------------------------------------------------------------
// 4. Enrollments Hooks (Query, Enroll, Drop)
// ----------------------------------------------------------------------------------
/**
 * Fetches course offerings the student is currently enrolled in
 * Supports pagination: { page: 1, perPage: 20 }
 */
export const useStudentEnrollments = (params = {}, options = {}) => {
  const { page = 1, perPage = 20, ...restParams } = params;
  const queryParams = { page, perPage, ...restParams };

  return useQuery({
    queryKey: STUDENT_KEYS.enrollments(queryParams),
    queryFn: () => getStudentEnrollments(queryParams),
    ...options,
  });
};

/**
 * Enrolls student into course offerings
 * Payload: [1, 2, 3] or { offeringIds: [1, 2, 3] }
 */
export const useEnrollOfferings = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options; // Destructure to prevent overwrite

  return useMutation({
    mutationFn: enrollStudentOfferings,
    onSuccess: (data, variables, context) => {
      // 1. Invalidate my enrollments (all pages)
      queryClient.invalidateQueries({ queryKey: STUDENT_KEYS.allEnrollments });

      // 2. Invalidate dashboard stats (updates enrolledOfferings counter in real-time)
      queryClient.invalidateQueries({ queryKey: STUDENT_KEYS.dashboard });

      // 3. Invalidate attendance (new classes added to attendance tracking)
      queryClient.invalidateQueries({ queryKey: STUDENT_KEYS.allAttendance });

      onSuccess?.(data, variables, context);
    },
    ...restOptions,
  });
};

/**
 * Drops an enrolled course offering by offeringId
 */
export const useDropOffering = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options; // Destructure to prevent overwrite

  return useMutation({
    mutationFn: (offeringId) => dropStudentOffering(offeringId),
    onSuccess: (data, offeringId, context) => {
      // 1. INSTANT 0ms UI UPDATE: Remove dropped offering from local cache immediately
      queryClient.setQueriesData(
        { queryKey: STUDENT_KEYS.allEnrollments },
        (old) =>
          updateEnrollmentListCache(old, (list) =>
            list.filter((item) => !matchOfferingId(item, offeringId))
          )
      );

      // 2. Refetch queries in background to synchronize with the server
      queryClient.invalidateQueries({ queryKey: STUDENT_KEYS.allEnrollments });
      queryClient.invalidateQueries({ queryKey: STUDENT_KEYS.dashboard });
      queryClient.invalidateQueries({ queryKey: STUDENT_KEYS.allAttendance });

      onSuccess?.(data, offeringId, context);
    },
    ...restOptions,
  });
};

