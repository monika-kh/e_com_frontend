import React, { useCallback, useEffect, useState } from "react";
import Header from "../../components/layout/Header";
import AddressManager from "../../components/profile/AddressManager";
import { ProfileService } from "../../services/profileService";
import { Profile, ProfileUpdatePayload } from "../../types/profile";
import "../../styles/address.css";

const emptyProfile: ProfileUpdatePayload = {
  username: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
};

const getUsernameFromToken = (): string => {
  const token = localStorage.getItem("access_token");
  if (!token) return "";

  try {
    const tokenPayload = token.split(".")[1];
    if (!tokenPayload) return "";

    const base64 = tokenPayload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
    const payload: { username?: unknown } = JSON.parse(decoded);
    return typeof payload.username === "string" ? payload.username : "";
  } catch {
    return "";
  }
};

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<ProfileUpdatePayload>(emptyProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await ProfileService.get();
      setProfile(result);
      setForm({
        username: getUsernameFromToken() || result.username || "",
        first_name: result.first_name || "",
        last_name: result.last_name || "",
        email: result.email || "",
        phone: result.phone || "",
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load profile.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const resetFormFromProfile = () => {
    if (!profile) return;

    setForm({
      username: getUsernameFromToken() || profile.username || "",
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      email: profile.email || "",
      phone: profile.phone || "",
    });
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSaving) return;

    try {
      setIsSaving(true);
      setError(null);
      const username = getUsernameFromToken() || form.username.trim();
      const updated = await ProfileService.update({
        username,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });
      setProfile(updated);
      setIsEditing(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Header />
      <main className="profile-page">
        <div className="profile-container">
          <div className="profile-page-header">
            <div>
              <h1>Profile</h1>
              <p>Manage your account details and saved addresses.</p>
            </div>
          </div>

          <section className="profile-card" aria-labelledby="profile-details-heading">
            <div className="profile-section-header">
              <h2 id="profile-details-heading">Profile details</h2>
              {profile && !isEditing && (
                <button type="button" className="btn btn-outline" onClick={() => setIsEditing(true)}>
                  Edit
                </button>
              )}
            </div>

            {error && <div className="profile-error">{error}</div>}
            {isLoading ? (
              <div className="profile-loading">Loading profile...</div>
            ) : profile && isEditing ? (
              <form className="profile-form" onSubmit={saveProfile}>
                <div className="profile-fields">
                  <label>Username<input value={form.username} readOnly disabled={isSaving} /></label>
                  <label>First name<input value={form.first_name} onChange={(event) => setForm((current) => ({ ...current, first_name: event.target.value }))} disabled={isSaving} /></label>
                  <label>Last name<input value={form.last_name} onChange={(event) => setForm((current) => ({ ...current, last_name: event.target.value }))} disabled={isSaving} /></label>
                  <label>Email<input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} disabled={isSaving} /></label>
                  <label>Phone<input inputMode="numeric" maxLength={10} value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value.replace(/\D/g, "").slice(0, 10) }))} disabled={isSaving} /></label>
                </div>
                <div className="address-actions">
                  <button type="button" className="btn btn-outline" onClick={() => { resetFormFromProfile(); setIsEditing(false); }} disabled={isSaving}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={isSaving}>{isSaving ? "Saving..." : "Save changes"}</button>
                </div>
              </form>
            ) : profile ? (
              <div className="profile-details">
                {profile.profile_image && <img className="profile-photo" src={profile.profile_image} alt="Profile" />}
                <div><span>Username</span><strong>{profile.username}</strong></div>
                <div><span>Name</span><strong>{[profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Not provided"}</strong></div>
                <div><span>Email</span><strong>{profile.email}</strong></div>
                <div><span>Phone</span><strong>{profile.phone || "Not provided"}</strong></div>
              </div>
            ) : null}
          </section>

          <AddressManager />
        </div>
      </main>
    </>
  );
};

export default ProfilePage;

