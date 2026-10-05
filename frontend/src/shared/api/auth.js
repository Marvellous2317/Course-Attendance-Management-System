import axiosInstance from "./axios";

export const login = async (payload) => {
  const response = await axiosInstance.post("/api/login", payload);
  return response.data;
};

export const register = async (payload) => {
  const response = await axiosInstance.post("/api/register", payload);
  return response.data;
};

export const refreshToken = async (refreshToken) => {
  const response = await axiosInstance.post("/api/refresh", {
    refreshToken,
    expireInMins: 30,
  });
  return response.data;
};

export const changePassword = async (payload) => {
  const response = await axiosInstance.post("/api/change-password", payload);
  return response.data;
};

// export const logout = async () => {
//   const response = await axiosInstance.post("/api/logout");
//   return response.data;
// };