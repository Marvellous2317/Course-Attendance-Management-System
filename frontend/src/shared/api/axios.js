import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const baseURL = import.meta.env.PUBLIC_API_BASE_URL || "";

const defaultHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

const axiosInstance = axios.create({
  baseURL,
  headers: defaultHeaders,
  withCredentials: true,
  timeout: 30000,
});

// Bare client with NO interceptors, used only for refreshing.
// If the refresh call went through axiosInstance and got a 401,
// it would trigger another refresh, forever.
const refreshClient = axios.create({
  baseURL,
  headers: defaultHeaders,
  withCredentials: true,
  timeout: 30000,
});

// 401s on these mean "wrong credentials", not "expired token"
const AUTH_URLS = ["/api/login", "/api/register", "/api/refresh", "/api/forgot-password"];
const isAuthUrl = (url = "") => AUTH_URLS.some((path) => url.includes(path));

// Shared promise: the "one person fetching the new keycard"
let refreshPromise = null;

const refreshAccessToken = () => {
  if (!refreshPromise) {
    const { refreshToken, setTokens } = useAuthStore.getState();

    refreshPromise = refreshClient
      .post("/api/refresh", { refreshToken, expireInMins: 30 })
      .then(({ data }) => {
        const payload = data?.data ?? data;
        const newToken = payload?.accessToken;
        if (!newToken) throw new Error("Refresh response had no access token");

        setTokens(newToken, payload?.refreshToken ?? refreshToken);
        return newToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

// Request interceptor: read the token from the store (single source of truth)
axiosInstance.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: on 401, refresh once, then retry the original request
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status !== 401 || !original || original._retry || isAuthUrl(original.url)) {
      return Promise.reject(error);
    }

    const { refreshToken, clearSession } = useAuthStore.getState();

    // Nothing to refresh with, so the session is over
    if (!refreshToken) {
      clearSession();
      return Promise.reject(error);
    }

    original._retry = true; // never retry the same request twice

    try {
      const newToken = await refreshAccessToken();
      original.headers.Authorization = `Bearer ${newToken}`;
      return axiosInstance(original);
    } catch (refreshError) {
      clearSession(); // refresh failed, so log out
      return Promise.reject(refreshError);
    }
  },
);

export default axiosInstance;