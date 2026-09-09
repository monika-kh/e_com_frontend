import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/auth";
import { useCart } from "../../context/CartContext";

interface Errors {
  email?: string;
  password?: string;
  general?: string;
}

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { fetchCart } = useCart();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  /* -------------------------
     VALIDATION
  --------------------------*/
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailBlur = () => {
    if (!isValidEmail(email)) {
      setErrors((prev) => ({
        ...prev,
        email: "Invalid email address",
      }));
    }
  };

  /* -------------------------
     SUBMIT
  --------------------------*/
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Errors = {};

    if (!isValidEmail(email)) {
      newErrors.email = "Invalid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const response = await loginUser({ email, password });

      // ✅ Store token if returned (JWT token might be in response or cookies)
      if (response?.access_token) {
        localStorage.setItem("access_token", response.access_token);
      }
      
      if (response?.refresh_token) {
        localStorage.setItem("refresh_token", response.refresh_token);
      }

      // ✅ Cookies are also set automatically by backend
      await fetchCart();
      navigate("/home");
    } catch (err: any) {
      setErrors({
        general:
          err?.response?.data?.message ||
          "Invalid email or password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ marginBottom: "1.5rem" }}>Login</h2>

      {errors.general && (
        <p style={{ color: "red", marginBottom: "1rem" }}>
          {errors.general}
        </p>
      )}

      {/* Email */}
      <div style={{ marginBottom: "1rem" }}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={handleEmailBlur}
          required
        />
        {errors.email && (
          <small style={{ color: "red" }}>{errors.email}</small>
        )}
      </div>

      {/* Password */}
      <div style={{ marginBottom: "1rem" }}>
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {errors.password && (
          <small style={{ color: "red" }}>{errors.password}</small>
        )}
      </div>

      <button
        className="btn btn-primary"
        style={{ width: "100%" }}
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <p className="text-muted" style={{ marginTop: "1rem" }}>
        Don’t have an account?{" "}
        <Link to="/register" className="text-accent">
          Register
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
