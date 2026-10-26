import axiosInstance from "./axios";

// ----------------------------------------------------------------------------------
// 1. Dashboard & Analytics
// ----------------------------------------------------------------------------------

/**
 * Returns totals for the authenticated teacher's:
 * - totalCourses, totalOfferings, totalStudents, totalSessions
 * - attendanceMarked, attendancePresent, attendancePercentage
 * GET /api/teacher/dashboard
 */
export const getTeacherDashboard = async () => {
  const response = await axiosInstance.get("/api/teacher/dashboard");
  return response.data;
};

// ----------------------------------------------------------------------------------
// 2. Teacher Courses
// ----------------------------------------------------------------------------------

/**
 * Returns the courses the authenticated teacher created or is assigned to (newest first)
 * Supports pagination: { page = 1, perPage = 20 }
 * GET /api/teacher/courses
 */
export const getTeacherCourses = async ({ page = 1, perPage = 20 } = {}) => {
  const response = await axiosInstance.get("/api/teacher/courses", {
    params: { page, perPage },
  });
  return response.data;
};

/**
 * Returns a specific course the authenticated teacher created or is assigned to
 * GET /api/teacher/courses/{id}
 */
export const getTeacherCourse = async (courseId) => {
  const response = await axiosInstance.get(`/api/teacher/courses/${courseId}`);
  return response.data;
};

/**
 * Creates a new course owned by the authenticated teacher
 * Payload: { code: string, title: string, description: string }
 * POST /api/teacher/courses
 */
export const createTeacherCourse = async (payload) => {
  const response = await axiosInstance.post("/api/teacher/courses", payload);
  return response.data;
};

// ----------------------------------------------------------------------------------
// 3. Course Offerings (Batches)
// ----------------------------------------------------------------------------------

/**
 * Returns the course offerings the authenticated teacher instructs (newest first)
 * Supports pagination: { page = 1, perPage = 20 }
 * GET /api/teacher/offerings
 */
export const getTeacherOfferings = async ({ page = 1, perPage = 20 } = {}) => {
  const response = await axiosInstance.get("/api/teacher/offerings", {
    params: { page, perPage },
  });
  return response.data;
};

/**
 * Schedules a new batch/offering for a course. Teacher becomes the instructor.
 * Payload: { batchCode: string, classDate: string, duration: number, sessions: number, startTime: string }
 * POST /api/teacher/courses/{id}/offerings
 */
export const createTeacherOffering = async (courseId, payload) => {
  const response = await axiosInstance.post(
    `/api/teacher/courses/${courseId}/offerings`,
    payload
  );
  return response.data;
};

/**
 * Returns students enrolled in a specific offering instructed by the teacher
 * Supports pagination: { page = 1, perPage = 20 }
 * GET /api/teacher/offerings/{id}/students
 */
export const getTeacherOfferingStudents = async (
  offeringId,
  { page = 1, perPage = 20 } = {}
) => {
  const response = await axiosInstance.get(
    `/api/teacher/offerings/${offeringId}/students`,
    {
      params: { page, perPage },
    }
  );
  return response.data;
};

// ----------------------------------------------------------------------------------
// 4. Class Sessions
// ----------------------------------------------------------------------------------

/**
 * Returns class sessions of an offering in chronological order
 * Supports pagination: { page = 1, perPage = 20 }
 * GET /api/teacher/offerings/{id}/sessions
 */
export const getTeacherOfferingSessions = async (
  offeringId,
  { page = 1, perPage = 20 } = {}
) => {
  const response = await axiosInstance.get(
    `/api/teacher/offerings/${offeringId}/sessions`,
    {
      params: { page, perPage },
    }
  );
  return response.data;
};

/**
 * Creates and adds a class session to an offering
 * Payload: { startTime: string, endTime: string, topic: string }
 * POST /api/teacher/offerings/{id}/sessions
 */
export const createTeacherSession = async (offeringId, payload) => {
  const response = await axiosInstance.post(
    `/api/teacher/offerings/${offeringId}/sessions`,
    payload
  );
  return response.data;
};

// ----------------------------------------------------------------------------------
// 5. Attendance
// ----------------------------------------------------------------------------------

/**
 * Returns every student enrolled in the session's offering with their attendance status
 * (present is null if not yet marked)
 * Supports pagination: { page = 1, perPage = 20 }
 * GET /api/teacher/sessions/{id}/attendance
 */
export const getTeacherSessionAttendance = async (
  sessionId,
  { page = 1, perPage = 20 } = {}
) => {
  const response = await axiosInstance.get(
    `/api/teacher/sessions/${sessionId}/attendance`,
    {
      params: { page, perPage },
    }
  );
  return response.data;
};

/**
 * Sets present or absent for enrolled students in a class session
 * Accepts either { records: [{ studentId: 42, present: true }] } or [{ studentId: 42, present: true }]
 * PUT /api/teacher/sessions/{id}/attendance
 */
export const markTeacherSessionAttendance = async (sessionId, payload) => {
  const body = Array.isArray(payload) ? { records: payload } : payload;
  const response = await axiosInstance.put(
    `/api/teacher/sessions/${sessionId}/attendance`,
    body
  );
  return response.data;
};