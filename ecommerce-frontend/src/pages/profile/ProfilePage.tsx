import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/layout/Header";

const ProfilePage: React.FC = () => {
  return (
    <>
      <Header />
      <main className="bg-soft" style={{ padding: "2rem" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{ marginTop: 0 }}>Profile</h2>
          <p style={{ color: "#666" }}>Manage your account settings.</p>

          <div className="card" style={{ padding: "1rem" }}>
            <h3 style={{ marginTop: 0 }}>Address Management</h3>
            <p style={{ color: "#666" }}>
              Add and manage your saved addresses for a faster checkout.
            </p>
            <Link className="btn btn-primary" to="/profile/addresses">
              Manage Addresses
            </Link>
          </div>
        </div>
      </main>
    </>
  );
};

export default ProfilePage;

