import api from "./api";

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token?: string;
  refresh_token?: string;
  user?: {
    id: number;
    email: string;
    first_name?: string;
  };
}

/**
 * Login user with email and password
 * Returns JWT tokens (if used) or sets httpOnly cookies
 */
export const loginUser = async (data: LoginPayload): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/users/login/", data);
  return response.data;
};

/**
 * Logout user - clears all authentication data
 */
export const logoutUser = async () => {
  try {
    // Call backend logout endpoint
    await api.post("/users/logout/");
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Clear tokens from localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");

    // Redirect to login
    window.location.href = "/login";
  }
};
