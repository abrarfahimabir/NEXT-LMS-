import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from "react-router-dom";

import "./App.css";
import CourseDetail from "./components/CourseDetail";
import CourseList from "./components/CourseList";
import CourseManagement from "./components/CourseManagement";
import Dashboard from "./components/Dashboard";
import EnrolledStudents from "./components/EnrolledStudents";
import GenerateReports from "./components/GenerateReports";
import Login from "./components/Login";
import ModuleManagement from "./components/ModuleManagement";
import Navbar from "./components/Navbar";
import Profile from "./components/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./components/Register";
import UserManagement from "./components/UserManagement";
import { AuthProvider, useAuth } from "./context/AuthContext";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <p className="footer-copyright">© {currentYear} SkillStream. All Rights Reserved</p>
        <p className="footer-credit">
          Developed by{" "}
          <motion.a
            href="#"
            className="gradient-link"
            animate={{
              backgroundPosition: ["0% center", "100% center", "0% center"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          > 
            Abrar Fahim
          </motion.a>
        </p>
      </div>
    </footer>
  );
};

const AppLayout = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <div className="app-shell">
      <div className="app-backdrop" />
      <div className="app-grid" />
      <div className="app-orb" />
      <Navbar />
      <main className="app-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            className="app-page"
            initial={{ opacity: 0, y: 28, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.995 }}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
          >
            <Routes>
              <Route path="/login" element={isAuthenticated ? <Navigate to="/courses" replace /> : <Login />} />
              <Route path="/register" element={isAuthenticated ? <Navigate to="/courses" replace /> : <Register />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses"
                element={
                  <ProtectedRoute>
                    <CourseList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses/:id"
                element={
                  <ProtectedRoute>
                    <CourseDetail />
                  </ProtectedRoute>
                }
              />
<Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
<Route
                path="/enrollments"
                element={
                  <ProtectedRoute>
                    <EnrolledStudents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/courses"
                element={
                  <ProtectedRoute>
                    <CourseManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/modules"
                element={
                  <ProtectedRoute>
                    <ModuleManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute>
                    <GenerateReports />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to={isAuthenticated ? "/courses" : "/login"} replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
