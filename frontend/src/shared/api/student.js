import axiosInstance from "./axios";

// ----------------------------------------------------------------------------------
// 1. Dashboard & Overview
// ----------------------------------------------------------------------------------

/**
 * Returns totals for the authenticated student's:
 * - enrolledOfferings
 * - upcomingSessions
 * - attendanceMarked
 * - attendancePresent
 * - attendancePercentage
 */
export const getStudentDashboard = async () => {
  const response = await axiosInstance.get("/api/student/dashboard");
  return response.data;
};

// ----------------------------------------------------------------------------------
// 2. Attendance
// ----------------------------------------------------------------------------------

/**
 * Returns authenticated student's attendance per enrolled offering and per session
 * Supports pagination: { page = 1, perPage = 20 }
 */
export const getStudentAttendance = async ({ page = 1, perPage = 20 } = {}) => {
  const response = await axiosInstance.get("/api/student/attendance", {
    params: { page, perPage },
  });
  return response.data;
};

// ----------------------------------------------------------------------------------
// 3. Browse Course Offerings
// ----------------------------------------------------------------------------------

/**
 * Returns every active course offering with course and instructor details
 * Supports pagination: { page = 1, perPage = 20 }
 */
export const getStudentOfferings = async ({ page = 1, perPage = 20 } = {}) => {
  const response = await axiosInstance.get("/api/student/offerings", {
    params: { page, perPage },
  });
  return response.data;
};

// ----------------------------------------------------------------------------------
// 4. Enrollments (List, Enroll, Drop)
// ----------------------------------------------------------------------------------

/**
 * Returns list of course offerings the authenticated student is currently enrolled in
 * Supports pagination: { page = 1, perPage = 20 }
 */
export const getStudentEnrollments = async ({ page = 1, perPage = 20 } = {}) => {
  const response = await axiosInstance.get("/api/student/enrollments", {
    params: { page, perPage },
  });
  return response.data;
};

/**
 * Enrolls the authenticated student into course offerings.
 * Accepts either an array [1, 2, 3] or an object { offeringIds: [1, 2, 3] }
 */
export const enrollStudentOfferings = async (payload) => {
  const body = Array.isArray(payload) ? { offeringIds: payload } : payload;
  const response = await axiosInstance.post("/api/student/enrollments", body);
  return response.data;
};

/**
 * Drops an enrolled course offering by offeringId
 */
export const dropStudentOffering = async (offeringId) => {
  const response = await axiosInstance.delete(`/api/student/enrollments/${offeringId}`);
  return response.data;
};

/**
 * Export authenticated student's full attendance history as a CSV file
 * GET /api/student/attendance/export
 */
export const exportStudentAttendanceCSV = async () => {
  const response = await axiosInstance.get('/api/student/attendance/export', {
    responseType: 'blob',
  });
  return response.data;
};