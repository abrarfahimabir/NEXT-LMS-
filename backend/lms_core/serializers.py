from rest_framework import serializers

from .models import Category, Course, Enrollment, Lesson, LessonProgress, Module, Notification


class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "description", "parent", "children"]

    def get_children(self, obj):
        return [{"id": child.id, "name": child.name} for child in obj.children.all()]


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ["id", "title", "content", "video_url", "order", "duration_minutes"]


class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = ["id", "title", "description", "order", "lessons"]


class CourseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    instructor_name = serializers.CharField(source="instructor.username", read_only=True)
    modules = ModuleSerializer(many=True, read_only=True)
    enrollment_count = serializers.IntegerField(source="enrollments.count", read_only=True)
    lesson_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "short_description",
            "description",
            "thumbnail_url",
            "status",
            "category",
            "category_name",
            "instructor",
            "instructor_name",
            "created_at",
            "updated_at",
            "enrollment_count",
            "lesson_count",
            "modules",
        ]
        read_only_fields = ["instructor", "created_at", "updated_at", "enrollment_count", "lesson_count"]

    def get_lesson_count(self, obj):
        return Lesson.objects.filter(module__course=obj).count()


class LessonProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source="lesson.title", read_only=True)

    class Meta:
        model = LessonProgress
        fields = ["id", "lesson", "lesson_title", "completed", "completed_at"]


class EnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.username", read_only=True)
    course_title = serializers.CharField(source="course.title", read_only=True)
    progress_percent = serializers.SerializerMethodField()
    course_details = CourseSerializer(source="course", read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            "id",
            "student",
            "student_name",
            "course",
            "course_title",
            "course_details",
            "enrolled_at",
            "progress_percent",
        ]
        read_only_fields = ["student", "enrolled_at", "progress_percent", "course_details"]

    def get_progress_percent(self, obj):
        total_lessons = Lesson.objects.filter(module__course=obj.course).count()
        if total_lessons == 0:
            return 0
        completed = obj.lesson_progress.filter(completed=True).count()
        return round((completed / total_lessons) * 100, 1)


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "message", "is_read", "created_at"]
        read_only_fields = ["id", "created_at"]
