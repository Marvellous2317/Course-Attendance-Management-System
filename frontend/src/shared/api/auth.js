import axiosInstance from "./axios";

export const login = async (payload) => {
  const response = await axiosInstance.post("/api/login", payload);
  return response.data;
};

export const register = async (payload) => {
  const response = await axiosInstance.post("/api/register", payload);
  return response.data;
};

// export const refreshToken = async (refreshToken) => {
//   const response = await axiosInstance.post("/api/refresh", {
//     refreshToken,
//     expireInMins: 30,
//   });
//   return response.data;
// };

export const changePassword = async (payload) => {
  const response = await axiosInstance.post("/api/change-password", payload);
  return response.data;
};

// export const forgotPassword = async (payload) => {
//   try {
//     const { data } = await axiosInstance.post("/api/forgot-password", payload);
//     return data;
//   } catch (err) {
//     // Graceful fallback if backend endpoint has not yet been registered
//     if (!err.response || err.response.status === 404 || err.response.status === 405) {
//       return { message: "Password reset link sent to your institutional email." };
//     }
//     throw err;
//   }
// };

// export const logout = async () => {
//   const response = await axiosInstance.post("/api/logout");
//   return response.data;
// };