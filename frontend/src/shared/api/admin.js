import axiosInstance from "./axios";

export const getCourse = async (id) => {
    const response = await axiosInstance.get(`/api/admin/courses/${id}`);
    return response.data;
};

export const getCourses = async () => {
    const response = await axiosInstance.get("/api/admin/courses");
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


