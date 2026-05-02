import { motion } from "framer-motion";
import React, { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import Button from "./ui/Button";
import Card from "./ui/Card";

const initialForm = {
  username: "",
  email: "",
  password: "",
  first_name: "",
  last_name: "",
  avatar_url: null,
  bio: "",
};

const Register = () => {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value, type, files } = event.target;
    if (type === "file") {
      setForm((current) => ({ ...current, [name]: files[0] }));
    } else {
      setForm((current) => ({ ...current, [name]: value }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (form[key] !== null && form[key] !== "") {
          formData.append(key, form[key]);
        }
      });
      await register(formData);
      navigate("/login", {
        replace: true,
        state: { successMessage: "Account created successfully. You can sign in now." },
      });
    } catch (requestError) {
      const payload = requestError.response?.data;
      if (!payload) {
        setError("Registration failed. Please try again.");
      } else {
        const messages = Object.entries(payload)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
          .join(" ");
        setError(messages);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="register-layout">
      <Card className="register-side">
        <div className="ui-card__body" style={{ padding: "2rem" }}>
          <div className="ui-badge">Onboard smart</div>
          <h1 className="ui-heading__title" style={{ marginTop: "1rem" }}>Create a role-aware LMS account.</h1>
           <p className="ui-heading__text">
             Students can explore and enroll, while instructors get profile-first program ownership from day one.
           </p>
          <div className="stack-list" style={{ marginTop: "1.5rem" }}>
            {[
              "JWT auth with refresh-token flow",
              "Profile fields for bios, expertise, and avatar URLs",
              "Role-based dashboards and protected routes",
            ].map((item) => (
              <div key={item} className="summary-box">{item}</div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="form-card">
        <div className="ui-card__body">
          <div className="ui-badge">Join SkillStream</div>
          <h2 style={{ margin: "1rem 0 0", fontSize: "2rem" }}>Create your account</h2>
          {error ? <div className="message-banner message-banner--error" style={{ marginTop: "1.5rem" }}>{error}</div> : null}

          <form className="form-grid form-grid--2" style={{ marginTop: "1.5rem" }} onSubmit={handleSubmit}>
            {[
              { name: "first_name", label: "First name" },
              { name: "last_name", label: "Last name" },
              { name: "username", label: "Username" },
              { name: "email", label: "Email", type: "email" },
              { name: "password", label: "Password", type: "password" },
            ].map((field) => (
              <label key={field.name} className="form-field">
                <span className="form-field__label">{field.label}</span>
                <input
                  className="form-input"
                  name={field.name}
                  type={field.type || "text"}
                  value={form[field.name]}
                  onChange={handleChange}
                  required={["username", "email", "password"].includes(field.name)}
                />
              </label>
            ))}

<label className="form-field" style={{ gridColumn: "1 / -1" }}>
              <span className="form-field__label">Upload your profile picture</span>
              <input
                className="form-input"
                name="avatar_url"
                type="file"
                accept="image/*"
                onChange={handleChange}
              />
            </label>

            <label className="form-field" style={{ gridColumn: "1 / -1" }}>
              <span className="form-field__label">Bio</span>
              <textarea className="form-textarea" name="bio" value={form.bio} onChange={handleChange} placeholder="Share a short intro" />
            </label>

            <div className="form-actions" style={{ gridColumn: "1 / -1" }}>
              <Button type="submit" size="lg" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
                <FiArrowRight />
              </Button>
              <p className="subtle-text">
                Already registered? <Link className="auth-link" to="/login">Sign in</Link>
              </p>
            </div>
          </form>
        </div>
      </Card>
    </motion.div>
  );
};

export default Register;
