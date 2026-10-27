import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getTeacherDashboard,
  getTeacherCourses,
  getTeacherCourse,
  createTeacherCourse,
  getTeacherOfferings,
  createTeacherOffering,
  getTeacherOfferingStudents,
  getTeacherOfferingSessions,
  createTeacherSession,
  getTeacherSessionAttendance,
  markTeacherSessionAttendance,
  exportTeacherStudentsCSV
} from "../api/teacher"; // Adjust relative path to your teacher API file

// ----------------------------------------------------------------------------------
// Query Keys
// ----------------------------------------------------------------------------------
export const TEACHER_KEYS = {
  // Dashboard
  dashboard: ["teacherDashboard"],

  // Courses
  courses: (params = {}) => ["teacherCourses", params],
  allCourses: ["teacherCourses"],
  course: (id) => ["teacherCourse", id],

  // Course Offerings (Batches)
  offerings: (params = {}) => ["teacherOfferings", params],
  allOfferings: ["teacherOfferings"],
  offeringStudents: (offeringId, params = {}) => [
    "teacherOfferingStudents",
    offeringId,
    params,
  ],
  allOfferingStudents: (offeringId) => ["teacherOfferingStudents", offeringId],

  // Sessions
  offeringSessions: (offeringId, params = {}) => [
    "teacherOfferingSessions",
    offeringId,
    params,
  ],
  allOfferingSessions: (offeringId) => ["teacherOfferingSessions", offeringId],

  // Attendance
  sessionAttendance: (sessionId, params = {}) => [
    "teacherSessionAttendance",
    sessionId,
    params,
  ],
  allSessionAttendance: (sessionId) => ["teacherSessionAttendance", sessionId],
};

// ----------------------------------------------------------------------------------
// 1. Dashboard Hook
// ----------------------------------------------------------------------------------
/**
 * Fetches authenticated teacher's totals:
 * totalCourses, totalOfferings, totalStudents, totalSessions,
 * attendanceMarked, attendancePresent, attendancePercentage
 */
export const useTeacherDashboard = (options = {}) =>
  useQuery({
    queryKey: TEACHER_KEYS.dashboard,
    queryFn: getTeacherDashboard,
    staleTime: 1000 * 60, // 1 minute fresh
    ...options,
  });

// ----------------------------------------------------------------------------------
// 2. Courses Hooks (List, Single, Create)
// ----------------------------------------------------------------------------------
/**
 * Returns courses the teacher created or is assigned to (newest first)
 * Supports pagination: { page: 1, perPage: 20 }
 */
export const useTeacherCourses = (params = {}, options = {}) => {
  const { page = 1, perPage = 20, ...restParams } = params;
  const queryParams = { page, perPage, ...restParams };

  return useQuery({
    queryKey: TEACHER_KEYS.courses(queryParams),
    queryFn: () => getTeacherCourses(queryParams),
    placeholderData: (prev) => prev,
    ...options,
  });
};

/**
 * Returns one specific course the teacher created or is assigned to
 */
export const useTeacherCourse = (courseId, options = {}) =>
  useQuery({
    queryKey: TEACHER_KEYS.course(courseId),
    queryFn: () => getTeacherCourse(courseId),
    enabled: Boolean(courseId),
    ...options,
  });

/**
 * Creates a course owned by the authenticated teacher
 * Payload: { code: "GO101", title: "Introduction to Go", description: "..." }
 */
export const useCreateTeacherCourse = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;

  return useMutation({
    mutationFn: createTeacherCourse,
    onSuccess: (data, variables, context) => {
      // 1. Refetch courses list
      queryClient.invalidateQueries({ queryKey: TEACHER_KEYS.allCourses });

      // 2. Refresh dashboard metrics (totalCourses incremented)
      queryClient.invalidateQueries({ queryKey: TEACHER_KEYS.dashboard });

      onSuccess?.(data, variables, context);
    },
    ...restOptions,
  });
};

// ----------------------------------------------------------------------------------
// 3. Offerings Hooks (List, Create, Enrolled Students)
// ----------------------------------------------------------------------------------
/**
 * Returns course offerings the teacher instructs (newest first)
 * Supports pagination: { page: 1, perPage: 20 }
 */
export const useTeacherOfferings = (params = {}, options = {}) => {
  const { page = 1, perPage = 20, ...restParams } = params;
  const queryParams = { page, perPage, ...restParams };

  return useQuery({
    queryKey: TEACHER_KEYS.offerings(queryParams),
    queryFn: () => getTeacherOfferings(queryParams),
    placeholderData: (prev) => prev,
    ...options,
  });
};

/**
 * Schedules a batch/offering for a course
 * Variables: { courseId: 7, payload: { batchCode, classDate, duration, sessions, startTime } }
 */
export const useCreateTeacherOffering = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;

  return useMutation({
    mutationFn: ({ courseId, id, payload, ...rest }) => {
      const targetCourseId = courseId ?? id;
      const body = payload ?? rest;
      return createTeacherOffering(targetCourseId, body);
    },
    onSuccess: (data, variables, context) => {
      // 1. Invalidate teacher offerings list
      queryClient.invalidateQueries({ queryKey: TEACHER_KEYS.allOfferings });

      // 2. Invalidate dashboard (totalOfferings incremented)
      queryClient.invalidateQueries({ queryKey: TEACHER_KEYS.dashboard });

      onSuccess?.(data, variables, context);
    },
    ...restOptions,
  });
};

/**
 * Returns students enrolled in a specific course offering
 * Supports pagination: { page: 1, perPage: 20 }
 */
export const useTeacherOfferingStudents = (
  offeringId,
  params = {},
  options = {}
) => {
  const { page = 1, perPage = 20, ...restParams } = params;
  const queryParams = { page, perPage, ...restParams };

  return useQuery({
    queryKey: TEACHER_KEYS.offeringStudents(offeringId, queryParams),
    queryFn: () => getTeacherOfferingStudents(offeringId, queryParams),
    enabled: Boolean(offeringId),
    placeholderData: (prev) => prev,
    ...options,
  });
};

// ----------------------------------------------------------------------------------
// 4. Class Sessions Hooks (List, Create)
// ----------------------------------------------------------------------------------
/**
 * Returns class sessions of an offering in chronological order
 * Supports pagination: { page: 1, perPage: 20 }
 */
export const useTeacherOfferingSessions = (
  offeringId,
  params = {},
  options = {}
) => {
  const { page = 1, perPage = 20, ...restParams } = params;
  const queryParams = { page, perPage, ...restParams };

  return useQuery({
    queryKey: TEACHER_KEYS.offeringSessions(offeringId, queryParams),
    queryFn: () => getTeacherOfferingSessions(offeringId, queryParams),
    enabled: Boolean(offeringId),
    placeholderData: (prev) => prev,
    ...options,
  });
};

/**
 * Adds a new class session to an offering
 * Variables: { offeringId: 5, payload: { topic, startTime, endTime } }
 */
export const useCreateTeacherSession = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;

  return useMutation({
    mutationFn: ({ offeringId, id, payload, ...rest }) => {
      const targetOfferingId = offeringId ?? id;
      const body = payload ?? rest;
      return createTeacherSession(targetOfferingId, body);
    },
    onSuccess: (data, variables, context) => {
      const targetOfferingId = variables.offeringId ?? variables.id;

      // 1. Refetch sessions for this offering
      if (targetOfferingId) {
        queryClient.invalidateQueries({
          queryKey: TEACHER_KEYS.allOfferingSessions(targetOfferingId),
        });
      }

      // 2. Refresh dashboard metrics (totalSessions incremented)
      queryClient.invalidateQueries({ queryKey: TEACHER_KEYS.dashboard });

      onSuccess?.(data, variables, context);
    },
    ...restOptions,
  });
};

// ----------------------------------------------------------------------------------
// 5. Attendance Hooks (Get, Mark / Update)
// ----------------------------------------------------------------------------------
/**
 * Returns every student enrolled in the session's offering with their attendance status
 * (present is null if not yet marked)
 * Supports pagination: { page: 1, perPage: 20 }
 */
export const useTeacherSessionAttendance = (
  sessionId,
  params = {},
  options = {}
) => {
  const { page = 1, perPage = 20, ...restParams } = params;
  const queryParams = { page, perPage, ...restParams };

  return useQuery({
    queryKey: TEACHER_KEYS.sessionAttendance(sessionId, queryParams),
    queryFn: () => getTeacherSessionAttendance(sessionId, queryParams),
    enabled: Boolean(sessionId),
    placeholderData: (prev) => prev,
    ...options,
  });
};

/**
 * Sets present or absent for enrolled students in a session
 * Variables: { sessionId: 31, records: [{ studentId: 42, present: true }] }
 */
export const useMarkTeacherAttendance = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;

  return useMutation({
    mutationFn: ({ sessionId, id, records, payload }) => {
      const targetSessionId = sessionId ?? id;
      const body = records || payload;
      return markTeacherSessionAttendance(targetSessionId, body);
    },
    onSuccess: (data, variables, context) => {
      const targetSessionId = variables.sessionId ?? variables.id;

      // 1. Invalidate attendance cache for this session
      if (targetSessionId) {
        queryClient.invalidateQueries({
          queryKey: TEACHER_KEYS.allSessionAttendance(targetSessionId),
        });
      }

      // 2. Invalidate teacher dashboard (updates attendancePresent, attendanceMarked, attendancePercentage)
      queryClient.invalidateQueries({ queryKey: TEACHER_KEYS.dashboard });

      onSuccess?.(data, variables, context);
    },
    ...restOptions,
  });
};


/**
 * Downloads a CSV of every student enrolled across the authenticated teacher's course offerings
 */
export const useExportTeacherStudents = (options = {}) => {
  return useMutation({
    mutationFn: async () => {
      const blob = await exportTeacherStudentsCSV();
      // Create download link in browser
      const blobUrl = window.URL.createObjectURL(
        new Blob([blob], { type: 'text/csv' })
      );
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute(
        'download',
        `enrolled_students_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      return blob;
    },
    ...options,
  });
};