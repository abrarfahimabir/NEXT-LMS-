import { motion } from "framer-motion";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { FiEdit2, FiPlus, FiSearch, FiTrash2, FiBookOpen, FiX, FiCheck, FiLoader, FiLayers, FiArrowRight, FiArrowLeft, FiBook } from "react-icons/fi";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { lmsApi } from "../lib/api";
import { modalVariants, moduleCardVariants, buttonPressVariants } from "../lib/animations";
import Card from "./ui/Card";
import SectionHeading from "./ui/SectionHeading";
import Skeleton from "./ui/Skeleton";
import ConfirmationDialog from "./ui/ConfirmationDialog";
import ToastContainer, { useToast } from "./ui/Toast";
import SelectDropdown from "./ui/SelectDropdown";

const ModuleManagement = () => {
  const { user: currentUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingModules, setLoadingModules] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    order: 1,
  });

  // Derived: convert courses to options format
  const courseOptions = useMemo(() => {
    return courses.map(course => ({
      value: course.id,
      label: course.title,
      group: course.instructor_name || "All Course",
      icon: <FiBook size={14} />,
    }));
  }, [courses]);

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState({ open: false, moduleId: null, moduleTitle: "" });
  const [deleting, setDeleting] = useState(false);

  // Loading states
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Toast
  const { toasts, removeToast, success, error: showError } = useToast();

  const isAdmin = currentUser?.role === "admin";
  const isInstructor = currentUser?.role === "instructor";
  const canManage = isAdmin || isInstructor;

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async (search = "") => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      
      const response = await lmsApi.courses(params);
      let coursesData = response.data?.results || response.data || [];
      
      // Filter courses for instructor (only show their own courses)
      if (isInstructor && !isAdmin) {
        coursesData = coursesData.filter(c => c.instructor === currentUser.id || c.instructor_name === currentUser.username);
      }
      
      setCourses(coursesData);
      setError("");
    } catch (err) {
      setError("Failed to load courses. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = async (courseId) => {
    const course = courses.find(c => c.id === parseInt(courseId));
    setSelectedCourse(course);
    if (courseId) {
      fetchModules(courseId);
    } else {
      setModules([]);
    }
  };

  const fetchModules = async (courseId) => {
    try {
      setLoadingModules(true);
      const response = await lmsApi.modules({ course: courseId });
      setModules(response.data || []);
    } catch (err) {
      console.error("Failed to load modules", err);
    } finally {
      setLoadingModules(false);
    }
  };

  const handleDeleteModule = async () => {
    if (!deleteDialog.moduleId) return;
    
    setDeleting(true);
    try {
      await lmsApi.deleteModule(deleteDialog.moduleId);
      setModules(modules.filter(m => m.id !== deleteDialog.moduleId));
      setDeleteDialog({ open: false, moduleId: null, moduleTitle: "" });
      success("Module deleted successfully", "Success");
    } catch (err) {
      showError(err.response?.data?.error || "Failed to delete module");
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = (module) => {
    setDeleteDialog({ open: true, moduleId: module.id, moduleTitle: module.title });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse) {
      showError("Please select a course first");
      return;
    }
    
    setLoadingSubmit(true);
    try {
      const payload = {
        ...formData,
        course: selectedCourse.id,
      };
      
      if (editingModule) {
        await lmsApi.updateModule(editingModule.id, payload);
        success("Module updated successfully", "Success");
      } else {
        await lmsApi.createModule(payload);
        success("Module created successfully", "Success");
      }
      setShowModal(false);
      setEditingModule(null);
      resetForm();
      fetchModules(selectedCourse.id);
    } catch (err) {
      showError(err.response?.data?.error || "Failed to save module");
    } finally {
      setLoadingSubmit(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      order: modules.length + 1,
    });
  };

  const openEditModal = (module) => {
    setEditingModule(module);
    setFormData({
      title: module.title,
      description: module.description || "",
      order: module.order,
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingModule(null);
    resetForm();
    setShowModal(true);
  };

  if (!canManage) {
    return (
      <div className="layout-stack">
        <SectionHeading
          eyebrow="Access Denied"
          title="Module Management"
          description="You do not have permission to access this page. Only admins and lead professionals can manage modules."
        />
      </div>
    );
  }

  return (
    <div className="layout-stack">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <SectionHeading
        eyebrow="Module Management"
        title="Manage Modules"
        description="Create, edit, and organize modules within programs. Admins can manage all programs, lead professionals can manage their own."
      />

      {/* Premium Program Selection Dropdown */}
      <Card className="selection-card ui-card--padding-md">
        <SelectDropdown
          label="Select Program"
          value={selectedCourse?.id || ""}
          onChange={(value) => handleCourseSelect(value)}
          options={courseOptions}
          placeholder="Choose a program..."
          searchable
          size="md"
          helperText="Select a program to manage its modules"
          prefix={<FiBook size={16} />}
        />
      </Card>

{/* Modules for Selected Course - Enhanced Card Grid Style */}
      {selectedCourse && (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="module-header">
            <div className="module-header__info">
              <h3 className="module-header__title">
                <FiBookOpen /> {selectedCourse.title}
              </h3>
              <p className="module-header__meta">
                {modules.length} module{modules.length !== 1 ? "s" : ""} • {selectedCourse.instructor_name}
              </p>
            </div>
            <button 
              onClick={openCreateModal} 
              className="ui-button ui-button--primary"
              disabled={!selectedCourse}
            >
              <FiPlus /> Add Module
            </button>
          </div>

          {loadingModules ? (
            <div className="module-list-admin">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="module-card-admin" style={{ height: "8rem" }} />
              ))}
            </div>
          ) : modules.length > 0 ? (
            <motion.div layout className="module-list-admin">
           {modules.map((module, index) => (
                 <motion.div
                   key={module.id}
                   layout
                   initial={{ opacity: 0, y: 18 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: index * 0.05 }}
                   whileHover={{ y: -8, scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   className="module-card-admin"
                 >
                  <div className="module-card-admin__number">
                    {index + 1}
                  </div>
                  <div className="module-card-admin__content">
                    <h4 className="module-card-admin__title">{module.title}</h4>
                    <p className="module-card-admin__desc">{module.description || "No description"}</p>
                    <div className="module-card-admin__meta">
                      <FiLayers />
                      <span>{module.lessons?.length || 0} unit{module.lessons?.length !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <div className="module-card-admin__actions">
                    <button
                      onClick={() => openEditModal(module)}
                      className="action-btn action-btn--edit"
                      title="Edit module"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => confirmDelete(module)}
                      className="action-btn action-btn--delete"
                      title="Delete module"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="empty-state">
              <FiLayers className="empty-icon" />
              <p>No modules yet</p>
              <button onClick={openCreateModal} className="ui-button ui-button--primary">
                <FiPlus /> Create First Module
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Empty State when no course selected */}
      {!loading && !selectedCourse && (
        <div className="empty-state">
          <FiBookOpen className="empty-icon" />
          <p>Select a program to manage its modules</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => !loadingSubmit && setShowModal(false)}>
          <motion.div
            className="modal-content modal-content--module"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{editingModule ? "Edit Module" : "Create New Module"}</h2>
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
                <label>Module Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  disabled={loadingSubmit}
                  placeholder="e.g., Getting Started"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  disabled={loadingSubmit}
                   placeholder="What will students learn in this module?"
                />
              </div>

              <div className="form-group">
                <label>Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  min={1}
                  disabled={loadingSubmit}
                />
                <span className="form-hint">Order in which this module appears in the program</span>
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
                  ) : editingModule ? (
                    <>
                      <FiCheck /> Save Changes
                    </>
                  ) : (
                    <>
                      <FiPlus /> Create Module
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
        onClose={() => setDeleteDialog({ open: false, moduleId: null, moduleTitle: "" })}
        onConfirm={handleDeleteModule}
        title="Delete Module"
        message={`Are you sure you want to delete "${deleteDialog.moduleTitle}"? All units in this module will also be deleted.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default ModuleManagement;
