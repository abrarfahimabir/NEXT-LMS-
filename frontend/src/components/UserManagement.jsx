import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { FiEdit2, FiPlus, FiSearch, FiTrash2, FiUser, FiUsers, FiShield, FiBookOpen, FiX, FiCheck, FiLoader } from "react-icons/fi";

import { useAuth } from "../context/AuthContext";
import { authApi } from "../lib/api";
import Card from "./ui/Card";
import SectionHeading from "./ui/SectionHeading";
import Skeleton from "./ui/Skeleton";
import ConfirmationDialog from "./ui/ConfirmationDialog";
import ToastContainer, { useToast } from "./ui/Toast";
import Pagination from "./ui/Pagination";

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "student",
    bio: "",
    expertise: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const USERS_PER_PAGE = 10;

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState({ open: false, userId: null, userName: "" });
  const [deleting, setDeleting] = useState(false);

  // Loading states
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Toast
  const { toasts, removeToast, success, error: showError, warning } = useToast();

  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, currentPage]);

  const fetchUsers = async (search = "") => {
    try {
      setLoading(true);
      const params = { page: currentPage, page_size: USERS_PER_PAGE };
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;
      
      const response = await authApi.getUsers(params);
      setUsers(response.data.results || response.data);
      // Set total count if available
      const total = response.data.count || response.data.length || 0;
      setTotalUsers(total);
      setTotalPages(Math.ceil(total / USERS_PER_PAGE));
      setError("");
    } catch (err) {
      setError("Failed to load users. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(searchTerm);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await authApi.changeUserRole(userId, { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      success("Role updated successfully", "Success");
    } catch (err) {
      showError(err.response?.data?.error || "Failed to change role");
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteDialog.userId) return;
    
    setDeleting(true);
    try {
      await authApi.deleteUser(deleteDialog.userId);
      setUsers(users.filter(u => u.id !== deleteDialog.userId));
      setDeleteDialog({ open: false, userId: null, userName: "" });
      success("User deleted successfully", "Success");
    } catch (err) {
      showError(err.response?.data?.error || "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = (user) => {
    setDeleteDialog({ open: true, userId: user.id, userName: user.username });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);
    try {
      if (editingUser) {
        await authApi.updateUser(editingUser.id, formData);
        success("User updated successfully", "Success");
      } else {
        await authApi.createUser(formData);
        success("User created successfully", "Success");
      }
      setShowModal(false);
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (err) {
      showError(err.response?.data?.error || "Failed to save user");
    } finally {
      setLoadingSubmit(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      role: "student",
      bio: "",
      expertise: "",
    });
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      role: user.role,
      bio: user.bio || "",
      expertise: user.expertise || "",
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    resetForm();
    setShowModal(true);
  };

  const getRoleBadge = (role) => {
    const configs = {
      admin: {
        icon: <FiShield />,
        class: "role-badge--admin",
        label: "Admin"
      },
      instructor: {
        icon: <FiBookOpen />,
        class: "role-badge--instructor",
        label: "Lead Professional"
      },
      student: {
        icon: <FiUser />,
        class: "role-badge--student",
        label: "Learner"
      },
    };
    const config = configs[role] || configs.student;
    
    return (
      <span className={`role-badge ${config.class}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  return (
    <div className="layout-stack">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <SectionHeading
        eyebrow="User Management"
        title="Manage Users & Roles"
        description="Add, edit, and manage user roles across the platform. Only admins can access this page."
      />

      {error ? <div className="message-banner message-banner--error">{error}</div> : null}

      {/* Filters and Actions */}
      <div className="filters-bar">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrap">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </form>

        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
          className="filter-select"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="instructor">Lead Professional</option>
          <option value="student">Learner</option>
        </select>

        {isAdmin && (
          <button onClick={openCreateModal} className="ui-button ui-button--primary">
            <FiPlus /> Add User
          </button>
        )}
      </div>

      {/* Users Count */}
      {!loading && totalUsers > 0 && (
        <div className="table-stats">
          <span>Showing {users.length} of {totalUsers} users</span>
        </div>
      )}

      {/* Users Table */}
      {loading ? (
        <div className="users-grid">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} style={{ height: "5rem" }} />
          ))}
        </div>
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Email</th>
                <th>Programs</th>
                <th>Joined</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={user.id === currentUser?.id ? "row-highlight" : ""}
                  whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
                >
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar user-avatar--table">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.username} />
                        ) : (
                          <FiUser />
                        )}
                      </div>
                      <div className="user-info">
                        <span className="user-name">{user.username}</span>
                        <span className="user-fullname">
                          {user.first_name} {user.last_name}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    {isAdmin ? (
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="role-select"
                      >
                        <option value="student">Learner</option>
                        <option value="instructor">Lead Professional</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      getRoleBadge(user.role)
                    )}
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <div className="course-stats">
                      <span title="Enrolled programs" className="course-stat">
                        <FiBookOpen /> {user.enrolled_courses_count || 0}
                      </span>
                      {user.role !== "student" && (
                        <span title="Programs created" className="course-stat">
                          <FiShield /> {user.courses_created_count || 0}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    {user.date_joined
                      ? new Date(user.date_joined).toLocaleDateString()
                      : "N/A"}
                  </td>
                  {isAdmin && (
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => openEditModal(user)}
                          className="action-btn action-btn--edit"
                          title="Edit user"
                        >
                          <FiEdit2 />
                        </button>
                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() => confirmDelete(user)}
                            className="action-btn action-btn--delete"
                            title="Delete user"
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="empty-state">
              <FiUsers className="empty-icon" />
              <p>No users found</p>
              {roleFilter && (
                <button
                  onClick={() => setRoleFilter("")}
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => !loadingSubmit && setShowModal(false)}>
          <motion.div
            className="modal-content modal-content--user"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{editingUser ? "Edit User" : "Add New User"}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="modal-close"
                disabled={loadingSubmit}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                    disabled={editingUser || loadingSubmit}
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    disabled={loadingSubmit}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Password {!editingUser && "*"}</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required={!editingUser}
                    placeholder={editingUser ? "Leave blank to keep current" : ""}
                    disabled={loadingSubmit}
                  />
                </div>
                <div className="form-group">
                  <label>Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    disabled={loadingSubmit}
                  >
                    <option value="student">Learner</option>
                    <option value="instructor">Lead Professional</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    disabled={loadingSubmit}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    disabled={loadingSubmit}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows={3}
                  disabled={loadingSubmit}
                />
              </div>

              <div className="form-group">
                <label>Expertise</label>
                <input
                  type="text"
                  value={formData.expertise}
                  onChange={(e) =>
                    setFormData({ ...formData, expertise: e.target.value })
                  }
                  placeholder="e.g., Python, Machine Learning"
                  disabled={loadingSubmit}
                />
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
                  ) : editingUser ? (
                    <>
                      <FiCheck /> Save Changes
                    </>
                  ) : (
                    <>
                      <FiPlus /> Create User
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
        onClose={() => setDeleteDialog({ open: false, userId: null, userName: "" })}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete user "${deleteDialog.userName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default UserManagement;
