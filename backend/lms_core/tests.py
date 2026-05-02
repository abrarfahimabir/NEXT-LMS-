from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from authentication.models import User

from .models import Category, Course, Enrollment, Lesson, Module


class LmsApiTests(APITestCase):
    def setUp(self):
        self.instructor = User.objects.create_user(
            username="instructor1",
            email="instructor@example.com",
            password="StrongPassword123!",
            role=User.ROLE_INSTRUCTOR,
        )
        self.student = User.objects.create_user(
            username="student1",
            email="student@example.com",
            password="StrongPassword123!",
            role=User.ROLE_STUDENT,
        )
        self.category, _ = Category.objects.get_or_create(name="Development")
        self.course = Course.objects.create(
            title="API Testing Course",
            short_description="Testing course",
            description="Description",
            category=self.category,
            instructor=self.instructor,
            status=Course.STATUS_PUBLISHED,
        )
        self.module = Module.objects.create(course=self.course, title="Module 1", order=1)
        self.lesson = Lesson.objects.create(module=self.module, title="Lesson 1", order=1, duration_minutes=10)

    def authenticate(self, username, password):
        response = self.client.post(reverse("login"), {"username": username, "password": password}, format="json")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_anonymous_user_can_browse_categories(self):
        response = self.client.get(reverse("category-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(self.category.name, {category["name"] for category in response.data})

    def test_anonymous_user_can_browse_published_courses_only(self):
        Course.objects.create(
            title="Draft Course",
            short_description="Hidden draft",
            description="Draft description",
            category=self.category,
            instructor=self.instructor,
            status=Course.STATUS_DRAFT,
        )

        response = self.client.get(reverse("course-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        course_titles = {course["title"] for course in response.data}
        self.assertIn(self.course.title, course_titles)
        self.assertNotIn("Draft Course", course_titles)

    def test_student_cannot_duplicate_enrollment(self):
        self.authenticate("student1", "StrongPassword123!")
        first_response = self.client.post(reverse("enrollment-list"), {"course": self.course.id}, format="json")
        second_response = self.client.post(reverse("enrollment-list"), {"course": self.course.id}, format="json")

        self.assertEqual(first_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Enrollment.objects.filter(student=self.student, course=self.course).count(), 1)

    def test_instructor_can_only_update_own_course(self):
        another_instructor = User.objects.create_user(
            username="instructor2",
            email="instructor2@example.com",
            password="StrongPassword123!",
            role=User.ROLE_INSTRUCTOR,
        )
        self.authenticate("instructor2", "StrongPassword123!")
        response = self.client.patch(
            reverse("course-detail", kwargs={"pk": self.course.id}),
            {"title": "Unauthorized edit"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
