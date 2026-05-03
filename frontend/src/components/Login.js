import { motion } from "framer-motion";
import React, { useState } from "react";
import { FiArrowRight, FiLock, FiMail, FiPlayCircle, FiTrendingUp } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import Button from "./ui/Button";
import Card from "./ui/Card";

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      navigate(location.state?.from?.pathname || "/courses", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split-layout">
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="auth-hero layout-stack">
        <div className="ui-badge">Learning Platform</div>
        <div className="ui-heading">
          <h1 className="ui-heading__title">
            <span className="ui-heading__title--gradient">SkillStream</span>
            <br />
            with interactive course delivery.
          </h1>
          <p className="ui-heading__text">
            Track progress, manage enrollments, and deliver engaging educational content through our comprehensive platform.
          </p>
        </div>

        <div className="metric-grid metric-grid--3">
          {[
             { label: "Learners", value: "5.4k active students", icon: FiTrendingUp },
            { label: "Courses", value: "120+ learning tracks", icon: FiPlayCircle },
            { label: "Success", value: "92% completion rate", icon: FiArrowRight },
          ].map((item) => (
            <Card key={item.label} className="metric-tile">
              <div className="metric-tile__row">
                <span className="metric-tile__label">{item.label}</span>
                <item.icon />
              </div>
              <div className="metric-tile__value">{item.value}</div>
            </Card>
          ))}
        </div>

        <Card className="preview-panel ui-card--noise">
          <div className="ui-card__body">
            <div className="ui-badge">Platform Preview</div>
            <h3 style={{ margin: "1rem 0 0.75rem", fontSize: "1.6rem" }}>
              Course management, student tracking, and interactive learning modules.
            </h3>
            <div className="preview-panel__chips">
              {["Interactive", "Trackable", "Effective"].map((label) => (
                <div key={label} className="preview-chip">
                  {label}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </motion.section>

      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="form-card ui-card--noise">
          <div className="ui-card__body">
            <div className="ui-badge">Welcome to SkillStream</div>
            <h2 style={{ margin: "1rem 0 0", fontSize: "2rem" }}>Sign in to your account</h2>

            {error ? <div className="message-banner message-banner--error" style={{ marginTop: "1.5rem" }}>{error}</div> : null}

            <form className="form-stack" style={{ marginTop: "1.5rem" }} onSubmit={handleSubmit}>
              <label className="form-field">
                <span className="form-field__label">Username</span>
<div className="input-shell">
                   <FiMail />
                   <input className="input-shell__field" name="username" placeholder="Enter your email or username" value={form.username} onChange={handleChange} required />
                 </div>
              </label>

              <label className="form-field">
                <span className="form-field__label">Password</span>
                <div className="input-shell">
                  <FiLock />
                  <input className="input-shell__field" type="password" name="password" placeholder="Enter your password" value={form.password} onChange={handleChange} required />
                </div>
              </label>

              <div className="form-actions">
<Button type="submit" size="lg" className="w-full" disabled={loading}>
                   {loading ? "Signing in..." : "Sign in to SkillStream"}
                   <FiArrowRight />
                 </Button>
                <Button type="button" variant="secondary" size="lg" className="w-full">
                  Continue with Google
                </Button>
              </div>
            </form>

<p className="subtle-text" style={{ marginTop: "1.5rem" }}>
               New to SkillStream? <Link className="auth-link" to="/register">Create an account</Link>
             </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
