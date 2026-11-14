
import axios from "axios";

const BASE_URL = "/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Separate Axios instance so refresh requests don't trigger
// this instance's response interceptor.
const refreshApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

let refreshPromise = null;

// Attach access token to every normal API request.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Refresh expired access tokens and retry failed requests.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Do not attempt refresh for login, Google login,
    // or the refresh endpoint itself.
    const requestUrl = originalRequest.url || "";

    if (
      requestUrl.includes("/users/login") ||
      requestUrl.includes("/users/google-login") ||
      requestUrl.includes("/users/refresh-token")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // Reuse an ongoing refresh request if multiple API calls
      // fail at approximately the same time.
      if (!refreshPromise) {
        refreshPromise = (async () => {
          const refreshToken = localStorage.getItem("refreshToken");

          if (!refreshToken) {
            throw new Error("Refresh token not found");
          }

          const response = await refreshApi.post(
            "/users/refresh-token",
            { refreshToken }
          );

          const newAccessToken = response.data?.data?.accessToken;

          if (!newAccessToken) {
            throw new Error("New access token not received");
          }

          localStorage.setItem("accessToken", newAccessToken);

          return newAccessToken;
        })();
      }

      const newAccessToken = await refreshPromise;

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      window.location.href = "/login";

      return Promise.reject(refreshError);
    } finally {
      refreshPromise = null;
    }
  }
);

export default api;
