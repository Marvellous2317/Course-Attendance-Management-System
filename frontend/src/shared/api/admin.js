import axiosInstance from "./axios";


export const getAdminDashboard = async () => {
    const response = await axiosInstance.get("/api/admin/dashboard");
    return response.data;
};

// ----------------------------------------------------------------------------------
// Courses
// ----------------------------------------------------------------------------------
export const getCourse = async (id) => {
    const response = await axiosInstance.get(`/api/admin/courses/${id}`);
    return response.data;
};

// Accepts { isDeleted, search, page, perPage }
export const getCourses = async ({ isDeleted = false, search = "", page = 1, perPage = 20 } = {}) => {
    const params = { isDeleted, page, perPage };
    if (search) params.search = search;
    const response = await axiosInstance.get("/api/admin/courses", { params });
    return response.data;
};

export const createCourse = async (payload) => {
    const response = await axiosInstance.post("/api/admin/courses", payload);
    return response.data;
};

export const updateCourse = async (id, payload) => {
    const response = await axiosInstance.patch(`/api/admin/courses/${id}`, payload);
    return response.data;
};

export const deleteCourse = async (id) => {
    const response = await axiosInstance.delete(`/api/admin/courses/${id}`);
    return response.data;
};

export const restoreCourse = async (id) => {
    const response = await axiosInstance.patch(`/api/admin/courses/${id}/restore`);
    return response.data;
};

/**
 * List students enrolled in any offering of a specific course
 * GET /api/admin/courses/{id}/students?page=1&perPage=20
 */
export const getCourseStudents = async (courseId, params = {}) => {
  const response = await axiosInstance.get(`/api/admin/courses/${courseId}/students`, {
    params,
  });
  return response.data;
};
/**
 * List teachers associated with a course (creators, assigned, or offering instructors)
 * GET /api/admin/courses/{id}/teachers?page=1&perPage=20
 */
export const getCourseTeachers = async (courseId, params = {}) => {
  const response = await axiosInstance.get(`/api/admin/courses/${courseId}/teachers`, {
    params,
  });
  return response.data;
};


// ----------------------------------------------------------------------------------
// Teachers
// ----------------------------------------------------------------------------------
export const getTeacher = async (teacherId) => {
    const response = await axiosInstance.get(`/api/admin/teachers/${teacherId}`);
    return response.data;
};

export const getTeachers = async ({ isDeleted = false, search = "", page = 1, perPage = 20 } = {}) => {
    const params = { isDeleted, page, perPage };
    if (search) params.search = search;
    const response = await axiosInstance.get("/api/admin/teachers", { params });
    return response.data;
};

export const createTeacher = async (payload) => {
    const response = await axiosInstance.post("/api/admin/teachers", payload);
    return response.data;
};

export const updateTeacher = async (teacherId, payload) => {
    const response = await axiosInstance.patch(`/api/admin/teachers/${teacherId}`, payload);
    return response.data;
};

export const deleteTeacher = async (teacherId) => {
    const response = await axiosInstance.delete(`/api/admin/teachers/${teacherId}`);
    return response.data;
};

export const restoreTeacher = async (teacherId) => {
    const response = await axiosInstance.patch(`/api/admin/teachers/${teacherId}/restore`);
    return response.data;
};

// Assign courses to a teacher (Replaces existing assignments)
export const assignCoursesToTeacher = async (teacherId, payload) => {
    // Accepts either { courseIds: [1, 2] } or [1, 2] directly
    const body = Array.isArray(payload) ? { courseIds: payload } : payload;
    const response = await axiosInstance.patch(
        `/api/admin/teachers/${teacherId}/courses`,
        body
    );
    return response.data;
};

// Unassign courses from a teacher (Removes specified courses)
export const unassignCoursesFromTeacher = async (teacherId, payload) => {
    // Accepts either { courseIds: [1, 2] } or [1, 2] directly
    const body = Array.isArray(payload) ? { courseIds: payload } : payload;
    const response = await axiosInstance.delete(
        `/api/admin/teachers/${teacherId}/courses`,
        { data: body }
    );
    return response.data;
};

// ----------------------------------------------------------------------------------
// Students
// ----------------------------------------------------------------------------------
export const getStudent = async (id) => {
    const response = await axiosInstance.get(`/api/admin/students/${id}`);
    return response.data;
};

export const getStudents = async ({ page = 1, perPage = 20, isDeleted = false, search = "" } = {}) => {
    const params = { page, perPage, isDeleted };
    if (search) params.search = search;
    const response = await axiosInstance.get("/api/admin/students", { params });
    return response.data;
};

export const createStudent = async (payload) => {
    const response = await axiosInstance.post("/api/admin/students", payload);
    return response.data;
};

export const updateStudent = async (id, payload) => {
    const response = await axiosInstance.patch(`/api/admin/students/${id}`, payload);
    return response.data;
};

export const deleteStudent = async (id) => {
    const response = await axiosInstance.delete(`/api/admin/students/${id}`);
    return response.data;
};

export const restoreStudent = async (id) => {
    const response = await axiosInstance.patch(`/api/admin/students/${id}/restore`);
    return response.data;
};

export const enrollStudentOfferings = async (id, payload) => {
    const body = Array.isArray(payload) ? { offeringIds: payload } : payload;
    const response = await axiosInstance.patch(`/api/admin/students/${id}/offerings`, body);
    return response.data;
};

export const unenrollStudentOfferings = async (id, payload) => {
    const body = Array.isArray(payload) ? { offeringIds: payload } : payload;
    const response = await axiosInstance.delete(`/api/admin/students/${id}/offerings`, {
        data: body,
    });
    return response.data;
};

// ----------------------------------------------------------------------------------
// Roles
// ----------------------------------------------------------------------------------
export const getRole = async (roleId) => {
    const response = await axiosInstance.get(`/api/admin/roles/${roleId}`);
    return response.data;
};

export const getRoles = async ({ isDeleted = false } = {}) => {
    const response = await axiosInstance.get(`/api/admin/roles?isDeleted=${isDeleted}`);
    return response.data;
};

export const createRole = async (payload) => {
    const response = await axiosInstance.post("/api/admin/roles", payload);
    return response.data;
};

export const updateRole = async (roleId, payload) => {
    const response = await axiosInstance.patch(`/api/admin/roles/${roleId}`, payload);
    return response.data;
};

export const deleteRole = async (roleId) => {
    const response = await axiosInstance.delete(`/api/admin/roles/${roleId}`);
    return response.data;
};

export const restoreRole = async (roleId) => {
    const response = await axiosInstance.patch(`/api/admin/roles/${roleId}/restore`);
    return response.data;
};

export const getAdminOfferings = async ({ search = "", page = 1, perPage = 20 } = {}) => {
  const params = { page, perPage };
  if (search) params.search = search;
  const response = await axiosInstance.get("/api/admin/offerings", { params });
  return response.data;
};

export const getAdminStudentEnrollments = async (studentId, params = {}) => {
  const response = await axiosInstance.get(
    `/api/admin/students/${studentId}/enrollments`,
    { params }
  );
  return response.data;
};