import { motion } from "framer-motion";
import React, { useEffect, useState, useRef } from "react";
import { FiCamera, FiEye, FiEyeOff, FiLock, FiSave, FiUpload, FiX } from "react-icons/fi";

import { useAuth } from "../context/AuthContext";
import { authApi, lmsApi } from "../lib/api";
import Button from "./ui/Button";
import Card from "./ui/Card";
import SectionHeading from "./ui/SectionHeading";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

const Profile = () => {
  const { refreshProfile, user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef(null);
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_new_password: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current_password: false,
    new_password: false,
    confirm_new_password: false,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileResponse, enrollmentResponse] = await Promise.all([authApi.profile(), lmsApi.enrollments()]);
        setProfile(profileResponse.data);
        setEnrollments(enrollmentResponse.data);
      } catch {
        setError("Failed to load profile details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setError("Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File too large. Maximum size is 5MB.");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setAvatarUploading(true);
    setError("");
    setMessage("");
    try {
      const response = await authApi.uploadAvatar(avatarFile);
      await refreshProfile();
      setProfile((current) => ({ ...current, avatar_url: response.data.avatar_url }));
      setAvatarFile(null);
      setMessage("Profile picture updated successfully.");
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Could not upload avatar.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarCancel = () => {
    if (avatarFile) {
      setAvatarFile(null);
    }
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
    }
  };

  const triggerAvatarInput = () => {
    avatarInputRef.current?.click();
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await authApi.updateProfile(profile);
      await refreshProfile();
      setMessage("Profile updated successfully.");
    } catch {
      setError("Could not save profile changes.");
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (passwordForm.new_password !== passwordForm.confirm_new_password) {
      setError("New password and retype password do not match.");
      return;
    }
    try {
      await authApi.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setMessage("Password updated. Please sign in again.");
      logout();
    } catch (requestError) {
      const payload = requestError.response?.data;
      const firstValue = payload ? Object.values(payload)[0] : null;
      setError(Array.isArray(firstValue) ? firstValue[0] : "Could not change password.");
    }
  };

  if (loading) {
    return <div className="status-panel">Loading profile workspace...</div>;
  }

  const passwordsMismatch =
    passwordForm.confirm_new_password.length > 0 &&
    passwordForm.new_password !== passwordForm.confirm_new_password;

  const togglePasswordVisibility = (field) => {
    setShowPasswords((current) => ({
      ...current,
      [field]: !current[field],
    }));
  };

  // Get avatar URL for display
  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview;
    if (profile?.avatar_url) {
      return profile.avatar_url.startsWith("http") 
        ? profile.avatar_url 
        : `${API_BASE_URL}${profile.avatar_url}`;
    }
    return null;
  };

  const avatarUrl = getAvatarUrl();

  return (
    <div className="layout-stack">
      <SectionHeading
        eyebrow="LMS Profile"
        title="Manage your learning profile and account settings."
        description="View your enrolled courses, update your credentials, and customize your learning experience."
      />

      {message ? <div className="message-banner message-banner--success">{message}</div> : null}
      {error ? <div className="message-banner message-banner--error">{error}</div> : null}

      <div className="profile-grid">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="chart-card">
            <div className="profile-header">
              <div 
                className="profile-avatar profile-avatar--uploadable"
                onClick={triggerAvatarInput}
                style={{ cursor: "pointer" }}
                title="Click to upload profile picture"
              >
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Profile" 
                    style={{ 
                      width: "100%", 
                      height: "100%", 
                      borderRadius: "50%", 
                      objectFit: "cover" 
                    }} 
                  />
                ) : (
                  <span>{(profile?.first_name || profile?.username || "U").slice(0, 1).toUpperCase()}</span>
                )}
                <div className="profile-avatar__badge">
                  <FiCamera />
                </div>
              </div>
              <div>
                <h2 style={{ margin: 0 }}>{profile?.first_name || profile?.username}</h2>
                <p className="subtle-text" style={{ textTransform: "capitalize" }}>{profile?.role === "instructor" ? "Instructor" : profile?.role}</p>
                <p className="status-note">{profile?.email}</p>
              </div>
            </div>

            {/* Hidden file input for avatar upload */}
            <input
              type="file"
              ref={avatarInputRef}
              accept="image/jpeg,image/png,image/gif,image/webp"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />

            {/* Avatar upload preview */}
            {avatarFile && (
              <div className="avatar-upload-preview">
                <div className="avatar-upload-preview__info">
                  <FiUpload style={{ marginRight: "0.5rem" }} />
                  <span>Selected: {avatarFile.name}</span>
                </div>
                <div className="avatar-upload-preview__actions">
                  <Button 
                    type="button" 
                    onClick={handleAvatarUpload} 
                    disabled={avatarUploading}
                    size="sm"
                  >
                    {avatarUploading ? "Uploading..." : "Upload"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={handleAvatarCancel}
                    size="sm"
                  >
                    <FiX /> Cancel
                  </Button>
                </div>
              </div>
            )}

            <form className="form-grid form-grid--2" onSubmit={handleSaveProfile}>
              {["first_name", "last_name", "username", "email", "avatar_url"].map((field) => (
                <label key={field} className="form-field">
                  <span className="form-field__label">{field.replaceAll("_", " ")}</span>
                  <input className="form-input" name={field} value={profile?.[field] || ""} onChange={handleProfileChange} />
                </label>
              ))}

              <label className="form-field" style={{ gridColumn: "1 / -1" }}>
                <span className="form-field__label">Bio</span>
                <textarea className="form-textarea" name="bio" value={profile?.bio || ""} onChange={handleProfileChange} />
              </label>

              {user?.role === "instructor" ? (
                <label className="form-field" style={{ gridColumn: "1 / -1" }}>
                  <span className="form-field__label">Professional Expertise</span>
                  <input className="form-input" name="expertise" value={profile?.expertise || ""} onChange={handleProfileChange} />
                </label>
              ) : null}

              <div style={{ gridColumn: "1 / -1" }}>
                <Button type="submit" size="lg">
                  <FiSave />
                  Save profile
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>

        <div className="layout-stack">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="side-card">
              <div className="inline-meta">
                <h3 style={{ margin: 0 }}>Change password</h3>
                <FiLock />
              </div>
              <p className="subtle-text">Secure your account and rotate credentials when needed.</p>
              <form className="form-stack" style={{ marginTop: "1rem" }} onSubmit={handlePasswordChange}>
                <label className="form-field">
                  <span className="form-field__label">Current password</span>
                  <div className="password-shell">
                    <input
                      className="form-input form-input--password"
                      type={showPasswords.current_password ? "text" : "password"}
                      placeholder="Current password"
                      value={passwordForm.current_password}
                      onChange={(event) =>
                        setPasswordForm((current) => ({ ...current, current_password: event.target.value }))
                      }
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePasswordVisibility("current_password")}
                      aria-label={showPasswords.current_password ? "Hide current password" : "Show current password"}
                    >
                      {showPasswords.current_password ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </label>
                <label className="form-field">
                  <span className="form-field__label">New password</span>
                  <div className="password-shell">
                    <input
                      className="form-input form-input--password"
                      type={showPasswords.new_password ? "text" : "password"}
                      placeholder="New password"
                      value={passwordForm.new_password}
                      onChange={(event) =>
                        setPasswordForm((current) => ({ ...current, new_password: event.target.value }))
                      }
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePasswordVisibility("new_password")}
                      aria-label={showPasswords.new_password ? "Hide new password" : "Show new password"}
                    >
                      {showPasswords.new_password ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </label>
                <label className="form-field">
                  <span className={`form-field__label ${passwordsMismatch ? "form-field__label--error" : ""}`}>
                    {passwordsMismatch ? "Retype new password - passwords do not match" : "Retype new password"}
                  </span>
                  <div className="password-shell">
                    <input
                      className={`form-input form-input--password ${passwordsMismatch ? "form-input--error" : ""}`}
                      type={showPasswords.confirm_new_password ? "text" : "password"}
                      placeholder="Retype new password"
                      value={passwordForm.confirm_new_password}
                      onChange={(event) =>
                        setPasswordForm((current) => ({ ...current, confirm_new_password: event.target.value }))
                      }
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePasswordVisibility("confirm_new_password")}
                      aria-label={showPasswords.confirm_new_password ? "Hide retype password" : "Show retype password"}
                    >
                      {showPasswords.confirm_new_password ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </label>
                <Button type="submit" variant="secondary">
                  Update password
                </Button>
              </form>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="side-card">
              <h3 style={{ marginTop: 0 }}>{user?.role === "student" ? "Enrolled courses" : "Account summary"}</h3>
              <div className="stack-list">
                {user?.role === "student" ? (
                  enrollments.length ? (
                    enrollments.map((enrollment) => (
                      <div key={enrollment.id} className="enrollment-box" style={{ padding: "1rem" }}>
                        <div style={{ fontWeight: 500 }}>{enrollment.course_title}</div>
                        <p className="subtle-text">Progress: {enrollment.progress_percent}% complete</p>
                      </div>
                    ))
                  ) : (
                    <p className="subtle-text">You have not enrolled in any courses yet.</p>
                  )
                ) : (
                  <>
                    <div className="summary-box">Email verified: {profile?.email_verified ? "Yes" : "No"}</div>
                    <div className="summary-box">Role: {profile?.role || "student"}</div>
                  </>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
