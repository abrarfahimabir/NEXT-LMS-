import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { FiEdit2, FiPlus, FiSearch, FiTrash2, FiBookOpen, FiX, FiCheck, FiLoader, FiEye, FiUsers, FiStar, FiGrid } from "react-icons/fi";

import { useAuth } from "../context/AuthContext";
import { authApi, lmsApi } from "../lib/api";
import Card from "./ui/Card";
import SectionHeading from "./ui/SectionHeading";
import Skeleton from "./ui/Skeleton";
import ConfirmationDialog from "./ui/ConfirmationDialog";
import ToastContainer, { useToast } from "./ui/Toast";
import Pagination from "./ui/Pagination";

const CourseManagement = () => {
  const { user: currentUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    short_description: "",
    description: "",
    thumbnail_url: "",
    status: "draft",
    category: "",
    instructor: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const COURSES_PER_PAGE = 10;

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState({ open: false, courseId: null, courseTitle: "" });
  const [deleting, setDeleting] = useState(false);

  // Loading states
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Toast
  const { toasts, removeToast, success, error: showError } = useToast();

  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    fetchCourses();
    fetchCategories();
    fetchInstructors();
  }, [statusFilter, currentPage]);

  const fetchCourses = async (search = "") => {
    try {
      setLoading(true);
      const params = { page: currentPage, page_size: COURSES_PER_PAGE };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      
      const response = await lmsApi.adminCourses(params);
      setCourses(response.data.results || response.data);
      const total = response.data.count || response.data.length || 0;
      setTotalCourses(total);
      setTotalPages(Math.ceil(total / COURSES_PER_PAGE));
      setError("");
    } catch (err) {
      setError("Failed to load programs. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

const fetchCategories = async () => {
    try {
      const response = await lmsApi.categories();
      setCategories(response.data || []);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  const fetchInstructors = async () => {
    try {
      // Fetch users with instructor role - using auth API with proper auth headers
      const response = await authApi.getUsers({ role: "instructor" });
      const data = response.data;
      // Ensure we always set an array, even if API returns error or unexpected format
      const instructorsArray = Array.isArray(data) 
        ? data 
        : Array.isArray(data.results) 
          ? data.results 
          : [];
      setInstructors(instructorsArray);
    } catch (err) {
      console.error("Failed to load instructors", err);
      setInstructors([]); // Fallback to empty array on error
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCourses(searchTerm);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDeleteCourse = async () => {
    if (!deleteDialog.courseId) return;
    
    setDeleting(true);
    try {
      await lmsApi.deleteCourse(deleteDialog.courseId);
      setCourses(courses.filter(c => c.id !== deleteDialog.courseId));
      setDeleteDialog({ open: false, courseId: null, courseTitle: "" });
      success("Program deleted successfully", "Success");
    } catch (err) {
      showError(err.response?.data?.error || "Failed to delete program");
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = (course) => {
    setDeleteDialog({ open: true, courseId: course.id, courseTitle: course.title });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);
    try {
      const payload = {
        ...formData,
        category: formData.category,
        instructor: formData.instructor,
      };
      
      if (editingCourse) {
        await lmsApi.updateCourse(editingCourse.id, payload);
        success("Program updated successfully", "Success");
      } else {
        await lmsApi.createCourse(payload);
        success("Program created successfully", "Success");
      }
      setShowModal(false);
      setEditingCourse(null);
      resetForm();
      fetchCourses();
    } catch (err) {
      showError(err.response?.data?.error || "Failed to save program");
    } finally {
      setLoadingSubmit(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      short_description: "",
      description: "",
      thumbnail_url: "",
      status: "draft",
      category: "",
      instructor: "",
    });
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      short_description: course.short_description || "",
      description: course.description || "",
      thumbnail_url: course.thumbnail_url || "",
      status: course.status,
      category: course.category,
      instructor: course.instructor,
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingCourse(null);
    resetForm();
    // Set default instructor to current user if they're an instructor
    if (currentUser?.role === "instructor") {
      setFormData(prev => ({ ...prev, instructor: currentUser.id }));
    }
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    return (
      <span className={`status-badge ${status === "published" ? "status-badge--published" : "status-badge--draft"}`}>
        {status === "published" ? <FiCheck /> : <FiGrid />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (!isAdmin) {
    return (
      <div className="layout-stack">
        <SectionHeading
          eyebrow="Access Denied"
          title="Admin Only"
          description="You do not have permission to access this page."
        />
      </div>
    );
  }

  return (
    <div className="layout-stack">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <SectionHeading
        eyebrow="Program Management"
        title="Manage Learning Programs"
        description="Create, edit, and manage all educational programs on the platform. Only admins can access this page."
      />

      {error ? <div className="message-banner message-banner--error">{error}</div> : null}

      {/* Filters and Actions */}
      <div className="filters-bar">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrap">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search programs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>

        <button onClick={openCreateModal} className="ui-button ui-button--primary">
          <FiPlus /> Create Program
        </button>
      </div>

      {/* Programs Count */}
      {!loading && totalCourses > 0 && (
        <div className="table-stats">
          <span>Showing {courses.length} of {totalCourses} programs</span>
        </div>
      )}

{/* Courses List - Enhanced Bento Grid Style */}
      {loading ? (
        <div className="course-list-admin">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="course-card-admin-bento" style={{ height: "22rem" }} />
          ))}
        </div>
      ) : (
        <motion.div layout className="course-list-admin">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              layout
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="course-card-admin-bento"
            >
              <div className="course-card-admin-bento__media">
                <img 
                  src={course.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400"} 
                  alt={course.title} 
                />
                <div className="course-card-admin-bento__overlay" />
                <div className="course-card-admin-bento__status">
                  {getStatusBadge(course.status)}
                </div>
              </div>
              
              <div className="course-card-admin-bento__content">
                <div>
                  <h3 className="course-card-admin-bento__title">{course.title}</h3>
                  <p className="course-card-admin-bento__desc">{course.short_description || course.description}</p>
                </div>
                
                <div className="course-card-admin-bento__meta">
                  <div className="course-card-admin-bento__meta-item">
                    <FiGrid />
                    <span>{course.category_name || "Uncategorized"}</span>
                  </div>
                  <div className="course-card-admin-bento__meta-item">
                    <FiUsers />
                    <span>{course.enrollment_count || 0} students</span>
                  </div>
                </div>
                
                <div className="course-card-admin-bento__instructor">
                  <div className="course-card-admin-bento__instructor-avatar">
                    {course.instructor_name?.charAt(0).toUpperCase() || "L"}
                  </div>
                  <span className="course-card-admin-bento__instructor-name">{course.instructor_name}</span>
                </div>
              </div>
              
              <div className="course-card-admin-bento__actions">
                <button
                  onClick={() => openEditModal(course)}
                  className="action-btn action-btn--edit"
                  title="Edit program"
                >
                  <FiEdit2 />
                </button>
                <button
                  onClick={() => confirmDelete(course)}
                  className="action-btn action-btn--delete"
                  title="Delete program"
                >
                  <FiTrash2 />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && courses.length === 0 && (
        <div className="empty-state">
          <FiBookOpen className="empty-icon" />
          <p>No programs found</p>
          <button onClick={openCreateModal} className="ui-button ui-button--primary">
            <FiPlus /> Create Your First Program
          </button>
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => !loadingSubmit && setShowModal(false)}>
          <motion.div
            className="modal-content modal-content--course"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{editingCourse ? "Edit Program" : "Create New Program"}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="modal-close"
                disabled={loadingSubmit}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Program Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  disabled={loadingSubmit}
                  placeholder="e.g., Enterprise Strategy"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    disabled={loadingSubmit}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                 <div className="form-group">
                   <label>Instructor *</label>
                   <select
                     value={formData.instructor}
                     onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                     required
                     disabled={loadingSubmit}
                   >
                     <option value="">Select Instructor</option>
                    {instructors.map((inst) => (
                      <option key={inst.id} value={inst.id}>{inst.username}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Short Description</label>
                <input
                  type="text"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  disabled={loadingSubmit}
                  placeholder="Brief overview (max 240 characters)"
                  maxLength={240}
                />
              </div>

              <div className="form-group">
                <label>Full Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  disabled={loadingSubmit}
                  placeholder="Detailed program overview..."
                />
              </div>

              <div className="form-group">
                <label>Thumbnail URL</label>
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  disabled={loadingSubmit}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="form-group">
                <label>Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  disabled={loadingSubmit}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="ui-button ui-button--secondary"
                  disabled={loadingSubmit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ui-button ui-button--primary"
                  disabled={loadingSubmit}
                >
                  {loadingSubmit ? (
                    <FiLoader className="spinner" />
                  ) : editingCourse ? (
                    <>
                      <FiCheck /> Save Changes
                    </>
                  ) : (
                    <>
                      <FiPlus /> Create Program
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, courseId: null, courseTitle: "" })}
        onConfirm={handleDeleteCourse}
        title="Delete Program"
        message={`Are you sure you want to delete "${deleteDialog.courseTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default CourseManagement;
