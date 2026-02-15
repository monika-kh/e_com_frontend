import React from "react";
import authImage from "../../assets/auth/auth-illustration.png";
import Header from "../layout/Header";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
}) => {
  return (
    <>
      <Header />

      <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        // background: "linear-gradient(135deg, #ff7a6b, #ff9aa2)",
      }}
    >
      {/* LEFT IMAGE SECTION */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem",
        }}
      >
        <div style={{ maxWidth: "600px", color: "#fff" }}>
          <img
            src={authImage}
            alt="Auth illustration"
            style={{
              width: "100%",
              maxHeight: "500px",
              objectFit: "contain",
              marginBottom: "2rem",
              paddingTop: "92px",
              marginLeft: "50px"
            }}
          />

          <h1>{title}</h1>
          {subtitle && (
            <p style={{ color: "#fff", opacity: 0.9 }}>{subtitle}</p>
          )}
        </div>
      </div>

      {/* RIGHT FORM SECTION */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--bg-main)",
        }}
      >
        <div
          className="card auth-card"
          style={{
            width: "100%",
            maxWidth: "380px",
            padding: "2rem",
          }}
        >
          {children}
        </div>
      </div>
    </div>
    </>
  );
};

export default AuthLayout;
