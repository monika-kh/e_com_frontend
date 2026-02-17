import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  withCredentials: true, // ⭐ IMPORTANT: Send cookies with every request
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * REQUEST INTERCEPTOR
 * Automatically adds JWT token to Authorization header from:
 * 1. localStorage (if token stored there)
 * 2. sessionStorage (if token stored there)
 * 3. Or relies on cookies (backend sets httpOnly cookies)
 */
api.interceptors.request.use(
  (config) => {
    // Try to get token from localStorage or sessionStorage
    const token = 
      localStorage.getItem("access_token") || 
      sessionStorage.getItem("access_token");

    // Add Authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * RESPONSE INTERCEPTOR
 * Handles authentication errors and redirects to login if needed
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.error("❌ Unauthorized - Authentication required");
      
      // Clear stored tokens if any
      localStorage.removeItem("access_token");
      sessionStorage.removeItem("access_token");
      
      // Redirect to login only if not already on login page
      if (window.location.pathname !== "/login") {
        console.log("🔄 Redirecting to login...");
        window.location.href = "/login";
      }
    }
    
    // Handle other errors
    if (error.response?.status === 403) {
      console.error("❌ Forbidden - You don't have permission");
    }
    
    if (error.response?.status === 500) {
      console.error("❌ Server Error");
    }

    return Promise.reject(error);
  }
);

export default api;
