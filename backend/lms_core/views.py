from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from authentication.models import User

from .models import Category, Course, Enrollment, Lesson, LessonProgress, Module, Notification
from .serializers import (
    CategorySerializer,
    CourseSerializer,
    EnrollmentSerializer,
    LessonProgressSerializer,
    ModuleSerializer,
    NotificationSerializer,
)


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.role == User.ROLE_ADMIN


class IsInstructorOrAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in {User.ROLE_INSTRUCTOR, User.ROLE_ADMIN}
        )


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.select_related("parent").prefetch_related("children")
    serializer_class = CategorySerializer
    permission_classes = (IsAdminOrReadOnly,)


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.select_related("parent").prefetch_related("children")
    serializer_class = CategorySerializer
    permission_classes = (IsAdminOrReadOnly,)


class CourseListCreateView(generics.ListCreateAPIView):
    serializer_class = CourseSerializer
    permission_classes = (IsInstructorOrAdminOrReadOnly,)

    def get_queryset(self):
        queryset = Course.objects.select_related("category", "instructor").prefetch_related("modules__lessons")
        user = self.request.user
        if not user.is_authenticated or user.role == User.ROLE_STUDENT:
            queryset = queryset.filter(status=Course.STATUS_PUBLISHED)

        search = self.request.query_params.get("search")
        category = self.request.query_params.get("category")
        status_value = self.request.query_params.get("status")

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(short_description__icontains=search)
                | Q(description__icontains=search)
            )
        if category:
            queryset = queryset.filter(category_id=category)
        if status_value:
            queryset = queryset.filter(status=status_value)
        return queryset

    def perform_create(self, serializer):
        if self.request.user.role not in {User.ROLE_INSTRUCTOR, User.ROLE_ADMIN}:
            raise PermissionDenied("Only instructors and admins can create courses.")
        serializer.save(instructor=self.request.user)


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CourseSerializer
    permission_classes = (IsInstructorOrAdminOrReadOnly,)

    def get_queryset(self):
        queryset = Course.objects.select_related("category", "instructor").prefetch_related("modules__lessons")
        user = self.request.user
        if not user.is_authenticated or user.role == User.ROLE_STUDENT:
            return queryset.filter(status=Course.STATUS_PUBLISHED)
        if user.role == User.ROLE_INSTRUCTOR:
            return queryset.filter(Q(status=Course.STATUS_PUBLISHED) | Q(instructor=user))
        return queryset

    def _ensure_owner_or_admin(self, course):
        if self.request.user.role == User.ROLE_ADMIN:
            return
        if self.request.user != course.instructor:
            raise PermissionDenied("You can only manage your own courses.")

    def perform_update(self, serializer):
        course = self.get_object()
        self._ensure_owner_or_admin(course)
        serializer.save()

    def perform_destroy(self, instance):
        self._ensure_owner_or_admin(instance)
        instance.delete()


class EnrollmentListCreateView(generics.ListCreateAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        queryset = Enrollment.objects.select_related("student", "course", "course__instructor")
        if self.request.user.role == User.ROLE_STUDENT:
            return queryset.filter(student=self.request.user)
        if self.request.user.role == User.ROLE_INSTRUCTOR:
            return queryset.filter(course__instructor=self.request.user)
        return queryset

    def perform_create(self, serializer):
        # Allow students, instructors, and admins to enroll
        if self.request.user.role not in [User.ROLE_STUDENT, User.ROLE_INSTRUCTOR, User.ROLE_ADMIN]:
            raise PermissionDenied("You do not have permission to enroll in courses.")

        course = serializer.validated_data["course"]
        if course.status != Course.STATUS_PUBLISHED:
            raise ValidationError({"course": "Only published courses can be enrolled in."})
        if Enrollment.objects.filter(student=self.request.user, course=course).exists():
            raise ValidationError({"course": "You are already enrolled in this course."})

        enrollment = serializer.save(student=self.request.user)
        lessons = Lesson.objects.filter(module__course=course)
        LessonProgress.objects.bulk_create(
            [LessonProgress(enrollment=enrollment, lesson=lesson) for lesson in lessons]
        )


class EnrollmentDetailView(generics.DestroyAPIView):
    queryset = Enrollment.objects.all()
    permission_classes = (permissions.IsAuthenticated,)

    def perform_destroy(self, instance):
        if self.request.user.role == User.ROLE_STUDENT and instance.student != self.request.user:
            raise PermissionDenied("You can only unenroll yourself.")
        if self.request.user.role == User.ROLE_INSTRUCTOR and instance.course.instructor != self.request.user:
            raise PermissionDenied("You can only manage enrollments on your own courses.")
        instance.delete()


class LessonProgressUpdateView(generics.UpdateAPIView):
    queryset = LessonProgress.objects.select_related("enrollment", "lesson")
    serializer_class = LessonProgressSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def perform_update(self, serializer):
        progress = self.get_object()
        enrollment = progress.enrollment
        user = self.request.user

        if user.role == User.ROLE_STUDENT and enrollment.student != user:
            raise PermissionDenied("You can only update your own lesson progress.")
        if user.role == User.ROLE_INSTRUCTOR and enrollment.course.instructor != user:
            raise PermissionDenied("You can only view progress for your own courses.")

        completed = serializer.validated_data.get("completed", progress.completed)
        serializer.save(completed_at=timezone.now() if completed else None)


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class MarkNotificationReadView(generics.UpdateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save(is_read=True)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def dashboard_summary(request):
    courses = Course.objects.all()
    if request.user.role == User.ROLE_INSTRUCTOR:
        courses = courses.filter(instructor=request.user)

    enrollments = Enrollment.objects.all()
    if request.user.role == User.ROLE_STUDENT:
        enrollments = enrollments.filter(student=request.user)
    elif request.user.role == User.ROLE_INSTRUCTOR:
        enrollments = enrollments.filter(course__instructor=request.user)

    top_courses = (
        courses.annotate(total_enrollments=Count("enrollments"))
        .order_by("-total_enrollments", "title")[:5]
    )

    recent_activity = [
        {
            "id": enrollment.id,
            "type": "enrollment",
            "message": f"{enrollment.student.username} enrolled in {enrollment.course.title}",
            "timestamp": enrollment.enrolled_at,
        }
        for enrollment in enrollments.select_related("student", "course")[:5]
    ]

    role_counts = User.objects.values("role").annotate(count=Count("role")).order_by("role")
    category_counts = Category.objects.annotate(total_courses=Count("courses")).values("name", "total_courses")

    has_unread_notifications = Notification.objects.filter(user=request.user, is_read=False).exists()

    return Response(
        {
            "total_users": User.objects.count(),
            "total_courses": courses.count(),
            "total_enrollments": enrollments.count(),
            "published_courses": courses.filter(status=Course.STATUS_PUBLISHED).count(),
            "has_unread_notifications": has_unread_notifications,
            "role_counts": list(role_counts),
            "category_counts": list(category_counts),
            "top_courses": [
                {
                    "id": course.id,
                    "title": course.title,
                    "enrollments": course.total_enrollments,
                    "status": course.status,
                }
                for course in top_courses
            ],
            "recent_activity": recent_activity,
        }
    )


# Admin-only Enrollment Management Views
class AdminEnrollmentListView(generics.ListAPIView):
    """Admin view all enrollments across all courses"""
    serializer_class = EnrollmentSerializer
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_queryset(self):
        queryset = Enrollment.objects.select_related("student", "course", "course__instructor").all()
        
        # Filter by course
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        # Filter by student
        student_id = self.request.query_params.get('student')
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        
        # Filter by instructor
        instructor_id = self.request.query_params.get('instructor')
        if instructor_id:
            queryset = queryset.filter(course__instructor_id=instructor_id)
        
        return queryset


class ForceUnenrollView(generics.DestroyAPIView):
    """Admin can force unenroll any student from any course"""
    queryset = Enrollment.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    
    def destroy(self, request, *args, **kwargs):
        # Only admins can force unenroll
        if request.user.role != User.ROLE_ADMIN:
            raise PermissionDenied("Only admins can force unenroll students.")
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"message": "Student successfully unenrolled."},
            status=status.HTTP_200_OK
        )


# Admin-only Course Management
class IsAdminOnly(permissions.BasePermission):
    """Only admin users can access"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == User.ROLE_ADMIN


# Report Generation (Admin only)
@api_view(["GET"])
@permission_classes([IsAdminOnly])
def generate_report(request):
    """Generate various reports for admin dashboard"""
    report_type = request.query_params.get("type", "overview")
    
    if report_type == "overview":
        # Platform overview report
        total_users = User.objects.count()
        total_courses = Course.objects.count()
        total_enrollments = Enrollment.objects.count()
        published_courses = Course.objects.filter(status=Course.STATUS_PUBLISHED).count()
        draft_courses = Course.objects.filter(status=Course.STATUS_DRAFT).count()
        
        # Role distribution
        role_stats = User.objects.values("role").annotate(count=Count("role"))
        
        # Category distribution
        category_stats = Category.objects.annotate(
            total_courses=Count("courses")
        ).values("name", "total_courses")
        
        # Top enrolled courses
        top_courses = Course.objects.annotate(
            enrollment_count=Count("enrollments")
        ).order_by("-enrollment_count")[:10].values("title", "enrollment_count", "status")
        
        return Response({
            "report_type": "overview",
            "generated_at": timezone.now().isoformat(),
            "total_users": total_users,
            "total_courses": total_courses,
            "total_enrollments": total_enrollments,
            "published_courses": published_courses,
            "draft_courses": draft_courses,
            "role_distribution": list(role_stats),
            "category_distribution": list(category_stats),
            "top_enrolled_courses": list(top_courses),
        })
    
    elif report_type == "users":
        # Detailed user report
        users = User.objects.select_related().order_by("date_joined")
        return Response({
            "report_type": "users",
            "generated_at": timezone.now().isoformat(),
            "total_users": users.count(),
            "users": list(users.values(
                "id", "username", "email", "role", "is_active", "date_joined"
            )[:100])
        })
    
    elif report_type == "courses":
        # Detailed course report
        courses = Course.objects.select_related("category", "instructor").annotate(
            enrollment_count=Count("enrollments"),
            module_count=Count("modules")
        ).order_by("-created_at")
        
        return Response({
            "report_type": "courses",
            "generated_at": timezone.now().isoformat(),
            "total_courses": courses.count(),
            "courses": list(courses.values(
                "id", "title", "status", "category__name", "instructor__username",
                "enrollment_count", "module_count", "created_at"
            )[:100])
        })
    
    elif report_type == "enrollments":
        # Detailed enrollment report
        enrollments = Enrollment.objects.select_related(
            "student", "course", "course__instructor"
        ).order_by("-enrolled_at")
        
        return Response({
            "report_type": "enrollments",
            "generated_at": timezone.now().isoformat(),
            "total_enrollments": enrollments.count(),
            "enrollments": list(enrollments.values(
                "id", "student__username", "course__title", 
                "course__instructor__username", "enrolled_at"
            )[:100])
        })
    
    else:
        return Response(
            {"error": "Invalid report type. Use: overview, users, courses, or enrollments"},
            status=status.HTTP_400_BAD_REQUEST
        )


class AdminCourseListCreateView(generics.ListCreateAPIView):
    """Admin-only course creation - no role restrictions for viewing"""
    serializer_class = CourseSerializer
    permission_classes = (IsAdminOnly,)

    def get_queryset(self):
        queryset = Course.objects.select_related("category", "instructor").prefetch_related("modules__lessons")
        
        search = self.request.query_params.get("search")
        category = self.request.query_params.get("category")
        status_value = self.request.query_params.get("status")

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(short_description__icontains=search)
                | Q(description__icontains=search)
            )
        if category:
            queryset = queryset.filter(category_id=category)
        if status_value:
            queryset = queryset.filter(status=status_value)
        return queryset

    def perform_create(self, serializer):
        """Admin can assign any instructor"""
        serializer.save()


class AdminCourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin-only course management (edit/delete)"""
    queryset = Course.objects.select_related("category", "instructor").prefetch_related("modules__lessons")
    serializer_class = CourseSerializer
    permission_classes = (IsAdminOnly,)


# Module Management (Admin & Instructors)
class IsAdminOrInstructor(permissions.BasePermission):
    """Admin or course instructor can manage modules"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in [User.ROLE_ADMIN, User.ROLE_INSTRUCTOR]


class ModuleListCreateView(generics.ListCreateAPIView):
    """List/Create modules for a course - Admin or course instructor only"""
    serializer_class = ModuleSerializer
    permission_classes = (IsAdminOrInstructor,)

    def get_queryset(self):
        course_id = self.request.query_params.get("course")
        if not course_id:
            return Module.objects.none()
        
        queryset = Module.objects.filter(course_id=course_id).prefetch_related("lessons")
        
        # Non-admins can only view their own course modules
        if self.request.user.role != User.ROLE_ADMIN:
            queryset = queryset.filter(course__instructor=self.request.user)
        
        return queryset

    def perform_create(self, serializer):
        course_id = self.request.data.get("course")
        if not course_id:
            raise ValidationError({"course": "Course ID is required."})
        
        course = Course.objects.get(id=course_id)
        
        # Check permission: admin or course instructor
        if self.request.user.role != User.ROLE_ADMIN and course.instructor != self.request.user:
            raise PermissionDenied("You can only manage modules for your own courses.")
        
        serializer.save(course=course)


class ModuleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Update/Delete a specific module"""
    serializer_class = ModuleSerializer
    permission_classes = (IsAdminOrInstructor,)

    def get_queryset(self):
        return Module.objects.select_related("course").prefetch_related("lessons")

    def _ensure_permission(self, module):
        course = module.course
        # Admins can manage any module
        if self.request.user.role == User.ROLE_ADMIN:
            return
        # Instructors can only manage their own course modules
        if course.instructor != self.request.user:
            raise PermissionDenied("You can only manage modules for your own courses.")

    def perform_update(self, serializer):
        module = self.get_object()
        self._ensure_permission(module)
        serializer.save()

    def perform_destroy(self, instance):
        self._ensure_permission(instance)
        instance.delete()
