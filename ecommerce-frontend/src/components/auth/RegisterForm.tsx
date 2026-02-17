import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

/* =====================
   TYPES
===================== */
interface RegisterFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

/* =====================
   COMPONENT
===================== */
const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  /* =====================
     VALIDATION HELPERS
  ===================== */
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isStrongPassword = (password: string) =>
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);

  /* =====================
     CHANGE HANDLER
  ===================== */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Phone: digits only, max 10
    if (name === "phone") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 10) return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  /* =====================
     BLUR VALIDATIONS
  ===================== */
  const handleFullNameBlur = () => {
    if (!formData.fullName.trim()) {
      setErrors((prev) => ({ ...prev, fullName: "Full name is required" }));
    }
  };

  const handleEmailBlur = () => {
    if (!formData.email) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
    } else if (!isValidEmail(formData.email)) {
      setErrors((prev) => ({ ...prev, email: "Enter valid email" }));
    }
  };

  const handlePhoneBlur = () => {
    if (!formData.phone) {
      setErrors((prev) => ({ ...prev, phone: "Contact is required" }));
    } else if (formData.phone.length !== 10) {
      setErrors((prev) => ({ ...prev, phone: "Contact must be 10 digits" }));
    }
  };

  const handlePasswordBlur = () => {
    if (!formData.password) {
      setErrors((prev) => ({ ...prev, password: "Password is required" }));
    } else if (!isStrongPassword(formData.password)) {
      setErrors((prev) => ({
        ...prev,
        password:
          "Password must be 8 chars with 1 letter, 1 number & 1 symbol",
      }));
    }
  };

  const handleConfirmPasswordBlur = () => {
    if (!formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Confirm password is required",
      }));
    } else if (formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
    }
  };

  /* =====================
     SUBMIT
  ===================== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Enter valid email";
    }

    if (!formData.phone) {
      newErrors.phone = "Contact is required";
    } else if (formData.phone.length !== 10) {
      newErrors.phone = "Contact must be 10 digits";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!isStrongPassword(formData.password)) {
      newErrors.password =
        "Password must be 8 chars with 1 letter, 1 number & 1 symbol";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      setSuccess("");

      await api.post("/users/register/", {
        username: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      setSuccess("Account created successfully! Please login.");
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
      setErrors({});
    } catch (err: any) {
      const backendErrors = err?.response?.data;

      setErrors({
        email: backendErrors?.email?.[0],
        phone: backendErrors?.phone?.[0],
      });
    } finally {
      setLoading(false);
    }
  };

  /* =====================
     JSX
  ===================== */
  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Account</h2>

      {success && <p style={{ color: "green" }}>{success}</p>}

      {/* Full Name */}
      <div>
        <label>Full Name</label>
        <input
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          onBlur={handleFullNameBlur}
        />
        {errors.fullName && <small style={{ color: "red" }}>{errors.fullName}</small>}
      </div>

      {/* Email */}
      <div>
        <label>Email</label>
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleEmailBlur}
        />
        {errors.email && <small style={{ color: "red" }}>{errors.email}</small>}
      </div>

      {/* Contact */}
      <div>
        <label>Contact</label>
        <input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          onBlur={handlePhoneBlur}
        />
        {errors.phone && <small style={{ color: "red" }}>{errors.phone}</small>}
      </div>

      {/* Password */}
      <div>
        <label>Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          onBlur={handlePasswordBlur}
        />
        {errors.password && <small style={{ color: "red" }}>{errors.password}</small>}
      </div>

      {/* Confirm Password */}
      <div>
        <label>Re-enter Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          onBlur={handleConfirmPasswordBlur}
        />
        {errors.confirmPassword && (
          <small style={{ color: "red" }}>{errors.confirmPassword}</small>
        )}
      </div>

       <button className="btn btn-primary" style={{ width: "100%" }} disabled={loading} > {loading ? "Registering..." : "Register"} </button>

      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </form>
  );
};

export default RegisterForm;
