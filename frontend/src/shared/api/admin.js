import axiosInstance from "./axios";

// ----------------------------------------------------------------------------------
// Courses
// ----------------------------------------------------------------------------------
export const getCourse = async (id) => {
    const response = await axiosInstance.get(`/api/admin/courses/${id}`);
    return response.data;
};

// Accepts { isDeleted: true/false }, defaults to false
export const getCourses = async ({ isDeleted = false } = {}) => {
    const response = await axiosInstance.get(`/api/admin/courses?isDeleted=${isDeleted}`);
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

// ----------------------------------------------------------------------------------
// Teachers
// ----------------------------------------------------------------------------------
export const getTeacher = async (teacherId) => {
    const response = await axiosInstance.get(`/api/admin/teachers/${teacherId}`);
    return response.data;
};

export const getTeachers = async () => {
    const response = await axiosInstance.get("/api/admin/teachers?isDeleted=false");
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


// ----------------------------------------------------------------------------------
// Roles
// ----------------------------------------------------------------------------------
export const getRole = async (roleId) => {
    const response = await axiosInstance.get(`/api/admin/roles/${roleId}`);
    return response.data;
};

export const getRoles = async () => {
    const response = await axiosInstance.get("/api/admin/roles");
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



