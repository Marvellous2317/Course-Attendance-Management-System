import axiosInstance from "./axios";

export const login = async (payload) => {
  const response = await axiosInstance.post("/api/login", payload);
  return response.data;
};

export const register = async (payload) => {
  const response = await axiosInstance.post("/api/register", payload);
  return response.data;
};


export const changePassword = async (payload) => {
  const response = await axiosInstance.post("/api/change-password", payload);
  return response.data;
};


export const getUserProfile = async (headers = {}) => {
  const response = await axiosInstance.get('/api/profile', { headers });
  return response.data;
};