from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import User


class AuthenticationApiTests(APITestCase):
    def test_register_blocks_admin_role(self):
        response = self.client.post(
            reverse("register"),
            {
                "username": "adminish",
                "email": "adminish@example.com",
                "password": "StrongPassword123!",
                "role": "admin",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("role", response.data)

    def test_change_password_rotates_session(self):
        user = User.objects.create_user(
            username="student1",
            email="student1@example.com",
            password="OldPassword123!",
            role=User.ROLE_STUDENT,
        )
        login_response = self.client.post(
            reverse("login"),
            {"username": "student1", "password": "OldPassword123!"},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login_response.data['access']}")

        response = self.client.post(
            reverse("change_password"),
            {"current_password": "OldPassword123!", "new_password": "NewPassword123!"},
            format="json",
        )

        user.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(user.check_password("NewPassword123!"))
        self.assertIsNone(user.session_key)

    def test_refresh_token_session_mismatch(self):
        user = User.objects.create_user(
            username="student2",
            email="student2@example.com",
            password="Password123!",
            role=User.ROLE_STUDENT,
        )
        
        # Login to get first set of tokens
        login_response1 = self.client.post(
            reverse("login"),
            {"username": "student2", "password": "Password123!"},
            format="json",
        )
        refresh_token1 = login_response1.data["refresh"]
        
        # Login again to simulate another session, rotating the session_key in DB
        self.client.post(
            reverse("login"),
            {"username": "student2", "password": "Password123!"},
            format="json",
        )
        
        # Try to refresh using the first refresh token
        response = self.client.post(
            reverse("token_refresh"),
            {"refresh": refresh_token1},
            format="json",
        )
        
        print(f"Response length: {len(response.content)}")
        print(f"Response content: {response.content}")
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data["detail"], "Session invalid or expired. Please log in again.")

    def test_refresh_token_works_with_correct_session(self):
        user = User.objects.create_user(
            username="student3",
            email="student3@example.com",
            password="Password123!",
            role=User.ROLE_STUDENT,
        )
        
        login_response = self.client.post(
            reverse("login"),
            {"username": "student3", "password": "Password123!"},
            format="json",
        )
        refresh_token = login_response.data["refresh"]
        
        response = self.client.post(
            reverse("token_refresh"),
            {"refresh": refresh_token},
            format="json",
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
