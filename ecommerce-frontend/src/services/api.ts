
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

// Allow adding a private `_retry` flag on request configs used internally
declare module "axios" {
  // augment AxiosRequestConfig so `originalRequest._retry` is accepted
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

// IMPORTANT:
// Cookie auth depends on the request host matching the cookie's host.
// In dev, people sometimes run the frontend on `localhost` *or* `127.0.0.1`.
// Default the API host to the current frontend hostname to keep cookies same-site.
const DEFAULT_API_HOST =
  typeof window !== "undefined" && window.location?.hostname
    ? window.location.hostname
    : "localhost";

const API_BASE =
  process.env.REACT_APP_API_BASE_URL || `http://${DEFAULT_API_HOST}:8000/api`;

// Backend refresh route (cookie-based). If your backend doesn't expose refresh, leave env var unset and we won't try.
const REFRESH_ENDPOINT = process.env.REACT_APP_AUTH_REFRESH || "/users/refresh/";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // send cookies (HttpOnly) with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// NOTE: We intentionally avoid reading HttpOnly cookies from JS.
// Do NOT rely on `localStorage` for access tokens when using HttpOnly cookies.

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error: any) => void;
  config: AxiosRequestConfig;
}> = [];

const processQueue = (error: any, tokenUpdated = false) => {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      // retry the original request
      p.resolve(api(p.config));
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError & { config?: AxiosRequestConfig }) => {
    const originalRequest = error.config;

    if (!originalRequest) return Promise.reject(error);

    // If Unauthorized, try to refresh session once and replay queued requests.
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Never try to refresh when the refresh call itself fails.
      const originalUrl = (originalRequest.url || "").toString();
      if (originalUrl.includes(REFRESH_ENDPOINT)) {
        return Promise.reject(error);
      }

      originalRequest._retry = true as any;

      if (isRefreshing) {
        // Queue the request until refresh finishes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      isRefreshing = true;

      try {
        // Attempt refresh; backend should set a new access_token cookie when successful.
        await api.post(REFRESH_ENDPOINT, {}, { withCredentials: true, _retry: true as any });

        processQueue(null, true);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, false);
        // Redirect to login (or emit an event) if refresh fails
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Other status handling for observability
    if (error.response?.status === 403) {
      console.error("Forbidden: you don't have access to this resource.");
    }

    if (error.response?.status === 500) {
      console.error("Server error");
    }

    return Promise.reject(error);
  }
);

export default api;
