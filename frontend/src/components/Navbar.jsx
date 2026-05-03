import { AnimatePresence, motion } from "framer-motion";
import React, { useState, useRef, useEffect } from "react";
import {
  FiBookOpen,
  FiCompass,
  FiGrid,
  FiHeart,
  FiLogOut,
  FiChevronDown,
  FiUser,
  FiSettings,
  FiUsers,
  FiUserCheck,
} from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";

import "../styles/Navbar.css";
import { useAuth } from "../context/AuthContext";
import Button from "./ui/Button";

const navItems = [
  { to: "/courses", label: "Courses", icon: FiBookOpen },
  { to: "/dashboard", label: "Dashboard", icon: FiGrid },
  { to: "/users", label: "Users", icon: FiUsers, requiredRole: "admin" },
  { to: "/enrollments", label: "Enrollments", icon: FiUserCheck, requiredRole: ["admin", "instructor"] },
];

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();

  // Get avatar URL for display
  const getAvatarUrl = () => {
    if (user?.avatar_url) {
      return user.avatar_url.startsWith("http")
        ? user.avatar_url
        : `${API_BASE_URL}${user.avatar_url}`;
    }
    return null;
  };
  
  const avatarUrl = getAvatarUrl();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle responsive navbar visibility
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 769);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ");
  const displayName = fullName || user?.username || "User";
  const avatarLetter = displayName.slice(0, 1).toUpperCase();

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(({ requiredRole }) => {
    if (!requiredRole) return true;
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(user?.role);
  });

return (
    <>
      <motion.header 
        initial={{ y: -24, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        className="navbar"
        style={{
          background: "rgba(10, 10, 18, 0.72)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border-light)",
        }}
      >
        <div className="navbar__inner" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to={isAuthenticated ? "/courses" : "/login"} className="navbar__brand">
            <motion.div whileHover={{ rotate: -8, scale: 1.04 }} className="navbar__logo">
              <span className="navbar__logo-glow" />
              <FiBookOpen />
            </motion.div>
            <div>
              <span className="navbar__eyebrow">N E X T LMS</span>
              <span className="navbar__title">SkillStream</span>
            </div>
          </Link>

          {isAuthenticated && !isMobile ? (
            <nav className="navbar__nav" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {filteredNavItems.map(({ to, label, icon: Icon }) => {
                const active = location.pathname.startsWith(to);
                return (
                  <button
                    key={to}
                    onClick={() => navigate(to)}
                    className={`navbar__nav-button ${active ? "navbar__nav-button--active" : ""}`.trim()}
                    style={{
                      padding: "0.6rem 0.9rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid transparent",
                      background: active ? "rgba(255, 255, 255, 0.1)" : "transparent",
                      color: active ? "#fff" : "var(--muted-soft)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      transition: "all 200ms ease",
                    }}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                );
              })}
            </nav>
          ) : null}

          <div className="navbar__toolbar" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {isAuthenticated ? (
              <>
                {/* Profile - positioned first (left of hamburger) */}
                <div className="navbar__profile-wrapper" ref={dropdownRef} style={{ position: "relative" }}>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    className="navbar__profile"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    style={{ 
                      cursor: "pointer", 
                      border: "1px solid var(--border-light)", 
                      background: "rgba(255, 255, 255, 0.04)", 
                      padding: "0.35rem 0.5rem 0.35rem 0.35rem",
                      borderRadius: "999px",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                    }}
>
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt="Profile" 
                        className="navbar__avatar-img"
                      />
                    ) : (
                      <div className="navbar__avatar">{avatarLetter}</div>
                    )}
                    <div>
                      <span className="navbar__profile-name">{displayName}</span>
                       <span className="navbar__profile-role">
                         {user?.role === "instructor" ? "Instructor" : user?.role === "student" ? "Student" : user?.role || "student"}
                       </span>
                    </div>
                    <FiChevronDown style={{ marginLeft: "0.25rem", transition: "transform 0.2s ease", transform: profileDropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
                  </motion.button>

                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="navbar__profile-dropdown"
                        style={{
                          position: "absolute",
                          top: "100%",
                          right: 0,
                          marginTop: "0.5rem",
                          backgroundColor: "rgba(18, 18, 31, 0.95)",
                          border: "1px solid var(--border-light)",
                          borderRadius: "12px",
                          backdropFilter: "blur(20px)",
                          WebkitBackdropFilter: "blur(20px)",
                          minWidth: "220px",
                          zIndex: 100,
                          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
                        }}
                      >
                        <button
                          className="navbar__dropdown-item"
                          onClick={() => {
                            navigate("/profile");
                            setProfileDropdownOpen(false);
                          }}
                        >
                          <FiUser size={18} />
                          <span>My Profile</span>
                        </button>
                        <button
                          className="navbar__dropdown-item"
                          onClick={() => {
                            navigate("/profile");
                            setProfileDropdownOpen(false);
                          }}
                        >
                          <FiSettings size={18} />
                          <span>Settings</span>
                        </button>
                        <div className="navbar__dropdown-divider" style={{ height: "1px", background: "var(--border)", margin: "0.5rem 0" }} />
                        <button
                          className="navbar__dropdown-item navbar__dropdown-item--danger"
                          onClick={() => {
                            handleLogout();
                            setProfileDropdownOpen(false);
                          }}
                        >
                          <FiLogOut size={18} />
                          <span>Logout</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Hamburger Menu - positioned after Profile (far right) */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  className={`navbar__menu-button ${sidebarOpen ? "navbar__menu-button--open" : ""}`}
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  aria-label={sidebarOpen ? "Close menu" : "Open menu"}
                  style={{ 
                    width: "2.6rem", 
                    height: "2.6rem", 
                    border: "1px solid var(--border-light)", 
                    borderRadius: "var(--radius-md)",
                    background: "rgba(255, 255, 255, 0.04)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <div id="nav-icon1" className={sidebarOpen ? "open" : ""}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </motion.button>
              </>
            ) : (
              <Button variant="secondary" onClick={() => navigate("/login")}>
                Sign in
              </Button>
            )}
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {sidebarOpen ? (
          <>
            <motion.button
              type="button"
              className="sidebar-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu overlay"
            />
            <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="sidebar">
              <div>
                <div className="ui-badge">N E X T LMS</div>
                <h2 className="ui-heading__title" style={{ fontSize: "2rem", marginTop: "1rem" }}>
                  SkillStream
                </h2>
              </div>
              <div className="sidebar__intro">
                Explore your learning space with course management and progress tracking.
              </div>
              <nav className="sidebar__nav">
                {navItems.map(({ to, label, icon: Icon, requiredRole }) => {
                  // Filter items based on user role
                  if (requiredRole) {
                    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
                    if (!roles.includes(user?.role)) return null;
                  }
                  return (
                    <button
                      key={to}
                      className={`sidebar__link ${location.pathname.startsWith(to) ? "sidebar__link--active" : ""}`.trim()}
                      onClick={() => {
                        navigate(to);
                        setSidebarOpen(false);
                      }}
                    >
                      <Icon />
                      {label}
                    </button>
                  );
                })}
              </nav>
              <div className="sidebar__actions">
                <button className="sidebar__action">
                  <FiHeart />
                  My Courses
                </button>
                <button className="sidebar__action sidebar__action--accent">
                  <FiCompass />
                  Learning Paths
                </button>
                <button className="sidebar__action sidebar__action--danger" onClick={handleLogout}>
                  <FiLogOut />
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
