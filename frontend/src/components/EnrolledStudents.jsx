import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { FiBookOpen, FiSearch, FiTrash2, FiUsers, FiFilter, FiUserCheck, FiX, FiCheck, FiLoader, FiClock, FiCheckCircle } from "react-icons/fi";

import { useAuth } from "../context/AuthContext";
import { lmsApi } from "../lib/api";
import Card from "./ui/Card";
import SectionHeading from "./ui/SectionHeading";
import Skeleton from "./ui/Skeleton";
import ConfirmationDialog from "./ui/ConfirmationDialog";
import ToastContainer, { useToast } from "./ui/Toast";
import Pagination from "./ui/Pagination";
import { MiniProgressBar } from "./ui/ProgressBar";

const EnrolledStudents = () => {
  const { user: currentUser } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEnrollments, setTotalEnrollments] = useState(0);
  const ENROLLMENTS_PER_PAGE = 10;

  // Unenroll dialog
  const [unenrollDialog, setUnenrollDialog] = useState({ open: false, enrollmentId: null, studentName: "", courseTitle: "" });
  const [unenrolling, setUnenrolling] = useState(false);

  // Toast
  const { toasts, removeToast, success, error: showError } = useToast();

  const isAdmin = currentUser?.role === "admin";
  const isInstructor = currentUser?.role === "instructor";

  useEffect(() => {
    fetchEnrollments();
    if (isAdmin) {
      fetchCourses();
    }
  }, [courseFilter, currentPage, statusFilter]);

  const fetchCourses = async () => {
    try {
      const response = await lmsApi.courses();
      setCourses(response.data);
    } catch (err) {
      console.error("Failed to fetch courses", err);
    }
  };

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const params = { 
        page: currentPage, 
        page_size: ENROLLMENTS_PER_PAGE 
      };
      if (courseFilter) params.course = courseFilter;
      
      const response = await lmsApi.getAllEnrollments(params);
      setEnrollments(response.data.results || response.data);
      const total = response.data.count || response.data.length || 0;
      setTotalEnrollments(total);
      setTotalPages(Math.ceil(total / ENROLLMENTS_PER_PAGE));
      setError("");
    } catch (err) {
      setError("Failed to load enrollments. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async () => {
    if (!unenrollDialog.enrollmentId) return;
    
    setUnenrolling(true);
    try {
      await lmsApi.forceUnenroll(unenrollDialog.enrollmentId);
      setEnrollments(enrollments.filter(e => e.id !== unenrollDialog.enrollmentId));
      setUnenrollDialog({ open: false, enrollmentId: null, studentName: "", courseTitle: "" });
      success("Learner removed from program", "Success");
    } catch (err) {
      showError(err.response?.data?.error || "Failed to unenroll student");
    } finally {
      setUnenrolling(false);
    }
  };

  const confirmUnenroll = (enrollment) => {
    setUnenrollDialog({ 
      open: true, 
      enrollmentId: enrollment.id, 
      studentName: enrollment.student_name,
      courseTitle: enrollment.course_title 
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      if (
        !enrollment.student_name?.toLowerCase().includes(search) &&
        !enrollment.course_title?.toLowerCase().includes(search)
      ) {
        return false;
      }
    }
    // Status filter
    if (statusFilter) {
      const progress = enrollment.progress_percent || 0;
      if (statusFilter === "completed" && progress < 100) return false;
      if (statusFilter === "in_progress" && (progress === 0 || progress >= 100)) return false;
      if (statusFilter === "not_started" && progress > 0) return false;
    }
    return true;
  });

  const getStatusBadge = (progress) => {
    if (progress >= 100) {
      return (
        <span className="status-badge status-badge--completed">
          <FiCheckCircle /> Completed
        </span>
      );
    }
    if (progress > 0) {
      return (
        <span className="status-badge status-badge--in-progress">
          <FiClock /> In Progress
        </span>
      );
    }
    return (
      <span className="status-badge status-badge--not-started">
        <FiClock /> Not Started
      </span>
    );
  };

  // Stats calculations
  const completedCount = filteredEnrollments.filter(e => (e.progress_percent || 0) >= 100).length;
  const inProgressCount = filteredEnrollments.filter(e => (e.progress_percent || 0) > 0 && (e.progress_percent || 0) < 100).length;
  const notStartedCount = filteredEnrollments.filter(e => !e.progress_percent || e.progress_percent === 0).length;

  return (
    <div className="layout-stack">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <SectionHeading
        eyebrow="Enrollment Management"
        title="Enrolled Learners"
        description="View and manage all learner enrollments across programs."
      />

      {error ? <div className="message-banner message-banner--error">{error}</div> : null}

      {/* Filters */}
      <div className="filters-bar">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrap">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search enrollments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </form>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="in_progress">In Progress</option>
          <option value="not_started">Not Started</option>
        </select>

        {isAdmin && courses.length > 0 && (
          <select
            value={courseFilter}
            onChange={(e) => { setCourseFilter(e.target.value); setCurrentPage(1); }}
            className="filter-select"
          >
            <option value="">All Programs</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        )}

        <button onClick={() => { setCourseFilter(""); setStatusFilter(""); setSearchTerm(""); fetchEnrollments(); }} className="ui-button ui-button--secondary">
          <FiFilter /> Refresh
        </button>
      </div>

      {/* Enrollments Count */}
      {!loading && totalEnrollments > 0 && (
        <div className="table-stats">
          <span>Showing {filteredEnrollments.length} of {totalEnrollments} enrollments</span>
        </div>
      )}

      {/* Enrollments Table */}
      {loading ? (
        <div className="enrollments-grid">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} style={{ height: "5rem" }} />
          ))}
        </div>
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Learner</th>
                <th>Program</th>
                <th>Lead Professional</th>
                <th>Progress</th>
                <th>Enrolled Date</th>
                {(isAdmin || isInstructor) && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredEnrollments.map((enrollment) => (
                <motion.tr
                  key={enrollment.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
                >
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar user-avatar--table">
                        <FiUsers />
                      </div>
                      <div className="user-info">
                        <span className="user-name">{enrollment.student_name}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="course-cell">
                      <FiBookOpen className="course-icon" />
                      <span className="course-title">{enrollment.course_title}</span>
                    </div>
                  </td>
                  <td>{enrollment.course?.instructor_name || "N/A"}</td>
                  <td>
                    <div className="progress-cell">
                      {getStatusBadge(enrollment.progress_percent)}
                      <MiniProgressBar value={enrollment.progress_percent || 0} max={100} />
                    </div>
                  </td>
                  <td>
                    {enrollment.enrolled_at
                      ? new Date(enrollment.enrolled_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                  {(isAdmin || isInstructor) && (
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => confirmUnenroll(enrollment)}
                          className="action-btn action-btn--delete"
                          title="Remove learner"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredEnrollments.length === 0 && (
            <div className="empty-state">
              <FiUserCheck className="empty-icon" />
              <p>No enrollments found</p>
              {(courseFilter || statusFilter || searchTerm) && (
                <button
                  onClick={() => { setCourseFilter(""); setStatusFilter(""); setSearchTerm(""); }}
                  className="ui-button ui-button--secondary"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="pagination-wrap">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Summary Stats */}
      {!loading && filteredEnrollments.length > 0 && (
        <div className="stats-grid" style={{ marginTop: "2rem" }}>
          <Card className="stat-card">
            <div className="stat-card__label">Total Enrollments</div>
            <div className="stat-card__value">{filteredEnrollments.length}</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-card__label">Completed</div>
            <div className="stat-card__value stat-card__value--success">{completedCount}</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-card__label">In Progress</div>
            <div className="stat-card__value stat-card__value--info">{inProgressCount}</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-card__label">Not Started</div>
            <div className="stat-card__value">{notStartedCount}</div>
          </Card>
        </div>
      )}

      {/* Unenroll Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={unenrollDialog.open}
        onClose={() => setUnenrollDialog({ open: false, enrollmentId: null, studentName: "", courseTitle: "" })}
        onConfirm={handleUnenroll}
        title="Remove Learner"
        message={`Are you sure you want to remove "${unenrollDialog.studentName}" from "${unenrollDialog.courseTitle}"? This action cannot be undone.`}
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
        loading={unenrolling}
      />
    </div>
  );
};

export default EnrolledStudents;
