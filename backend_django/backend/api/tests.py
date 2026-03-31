from rest_framework import status
from rest_framework.test import APITestCase

from api.models import User


class AuthMeApiTests(APITestCase):
    def test_auth_me_returns_email_backed_identity_for_custom_user_model(self):
        user = User.objects.create_user(
            email="student@example.com",
            password="password123",
            first_name="Stu",
            last_name="Dent",
            role="student",
        )
        self.client.force_authenticate(user=user)

        response = self.client.get("/api/auth/me/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["user_id"], user.id)
        self.assertEqual(response.data["username"], user.email)
        self.assertEqual(response.data["email"], user.email)
        self.assertEqual(response.data["role"], "student")
        self.assertTrue(response.data["is_authenticated"])
