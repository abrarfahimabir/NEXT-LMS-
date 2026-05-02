from django.urls import path

from .views import (
    AdminCourseDetailView,
    AdminCourseListCreateView,
    AdminEnrollmentListView,
    CategoryDetailView,
    CategoryListCreateView,
    CourseDetailView,
    CourseListCreateView,
    EnrollmentDetailView,
    EnrollmentListCreateView,
    ForceUnenrollView,
    LessonProgressUpdateView,
    ModuleDetailView,
    ModuleListCreateView,
    NotificationListView,
    MarkNotificationReadView,
    dashboard_summary,
    generate_report,
)

urlpatterns = [
    path("categories/", CategoryListCreateView.as_view(), name="category-list"),
    path("categories/<int:pk>/", CategoryDetailView.as_view(), name="category-detail"),
    path("courses/", CourseListCreateView.as_view(), name="course-list"),
    path("courses/<int:pk>/", CourseDetailView.as_view(), name="course-detail"),
    path("enrollments/", EnrollmentListCreateView.as_view(), name="enrollment-list"),
    path("enrollments/<int:pk>/", EnrollmentDetailView.as_view(), name="enrollment-detail"),
    path("lesson-progress/<int:pk>/", LessonProgressUpdateView.as_view(), name="lesson-progress"),
    path("notifications/", NotificationListView.as_view(), name="notification-list"),
    path("notifications/<int:pk>/read/", MarkNotificationReadView.as_view(), name="notification-read"),
    path("dashboard/", dashboard_summary, name="dashboard"),
    # Admin enrollment management
    path("enrollments/all/", AdminEnrollmentListView.as_view(), name="admin-enrollment-list"),
    path("enrollments/force-delete/<int:pk>/", ForceUnenrollView.as_view(), name="force-unenroll"),
    # Admin Course Management (CRUD - Admin only)
    path("admin/courses/", AdminCourseListCreateView.as_view(), name="admin-course-list"),
path("admin/courses/<int:pk>/", AdminCourseDetailView.as_view(), name="admin-course-detail"),
    # Module Management (Admin & Instructors)
    path("modules/", ModuleListCreateView.as_view(), name="module-list"),
    path("modules/<int:pk>/", ModuleDetailView.as_view(), name="module-detail"),
    # Report Generation (Admin only)
    path("reports/", generate_report, name="generate-report"),
]
