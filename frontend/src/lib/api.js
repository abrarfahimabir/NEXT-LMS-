import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ? process.env.REACT_APP_API_BASE_URL.trim() : "https://next-lms.onrender.com";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

let authStore = {
  getAccessToken: () => null,
  getRefreshToken: () => null,
  updateTokens: () => {},
  logout: () => {},
};

export const registerAuthStore = (store) => {
  authStore = store;
};

api.interceptors.request.use((config) => {
  const token = authStore.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    config.headers["Content-Type"] = "multipart/form-data";
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = authStore.getRefreshToken();

    if (
      error.response?.status === 401 &&
      refreshToken &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/token/refresh/")
    ) {
      originalRequest._retry = true;
      try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/token/refresh/`, {
          refresh: refreshToken,
        });
        authStore.updateTokens(response.data);
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        authStore.logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  login: (payload) => api.post("/auth/login/", payload),
  register: (payload) => api.post("/auth/register/", payload),
  profile: () => api.get("/auth/profile/"),
  updateProfile: (payload) => api.put("/auth/profile/", payload),
  changePassword: (payload) => api.post("/auth/change-password/", payload),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return api.post("/auth/upload-avatar/", formData);
  },
  getUsers: (params) => api.get("/auth/users/", { params }),
  createUser: (payload) => api.post("/auth/users/create/", payload),
  getUser: (id) => api.get(`/auth/users/${id}/`),
  updateUser: (id, payload) => api.put(`/auth/users/${id}/`, payload),
  deleteUser: (id) => api.delete(`/auth/users/${id}/`),
  changeUserRole: (id, payload) => api.post(`/auth/users/${id}/change-role/`, payload),
};

export const lmsApi = {
  dashboard: () => api.get("/lms/dashboard/"),
  categories: () => api.get("/lms/categories/"),
  courses: (params) => api.get("/lms/courses/", { params }),
  course: (id) => api.get(`/lms/courses/${id}/`),
  enrollments: () => api.get("/lms/enrollments/"),
  enroll: (payload) => api.post("/lms/enrollments/", payload),
  unenroll: (id) => api.delete(`/lms/enrollments/${id}/`),
  updateProgress: (id, payload) => api.patch(`/lms/lesson-progress/${id}/`, payload),
  getAllEnrollments: (params) => api.get("/lms/enrollments/all/", { params }),
  forceUnenroll: (id) => api.delete(`/lms/enrollments/force-delete/${id}/`),
  adminCourses: (params) => api.get("/lms/admin/courses/", { params }),
  adminCourse: (id) => api.get(`/lms/admin/courses/${id}/`),
  createCourse: (payload) => api.post("/lms/admin/courses/", payload),
  updateCourse: (id, payload) => api.put(`/lms/admin/courses/${id}/`, payload),
  deleteCourse: (id) => api.delete(`/lms/admin/courses/${id}/`),
  modules: (params) => api.get("/lms/modules/", { params }),
  module: (id) => api.get(`/lms/modules/${id}/`),
  createModule: (payload) => api.post("/lms/modules/", payload),
  updateModule: (id, payload) => api.put(`/lms/modules/${id}/`, payload),
  deleteModule: (id) => api.delete(`/lms/modules/${id}/`),
  generateReport: (params) => api.get("/lms/reports/", { params }),
};

export default api;