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


class ChangePasswordApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="recruiter@example.com",
            password="CurrentPass123!",
            first_name="Rec",
            last_name="Ruiter",
            role="company",
        )
        self.client.force_authenticate(user=self.user)

    def test_change_password_updates_password_when_current_password_is_valid(self):
        response = self.client.post(
            "/api/auth/change-password/",
            {
                "current_password": "CurrentPass123!",
                "new_password": "UpdatedPass456!",
                "confirm_new_password": "UpdatedPass456!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["detail"], "Password updated successfully.")
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("UpdatedPass456!"))
        self.assertFalse(self.user.check_password("CurrentPass123!"))

    def test_change_password_rejects_incorrect_current_password(self):
        response = self.client.post(
            "/api/auth/change-password/",
            {
                "current_password": "WrongPass123!",
                "new_password": "UpdatedPass456!",
                "confirm_new_password": "UpdatedPass456!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["current_password"][0],
            "Current password is incorrect.",
        )
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("CurrentPass123!"))

    def test_change_password_requires_matching_confirmation(self):
        response = self.client.post(
            "/api/auth/change-password/",
            {
                "current_password": "CurrentPass123!",
                "new_password": "UpdatedPass456!",
                "confirm_new_password": "UpdatedPass789!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["confirm_new_password"][0],
            "New password confirmation does not match.",
        )

    def test_change_password_rejects_reusing_current_password(self):
        response = self.client.post(
            "/api/auth/change-password/",
            {
                "current_password": "CurrentPass123!",
                "new_password": "CurrentPass123!",
                "confirm_new_password": "CurrentPass123!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["new_password"][0],
            "New password must be different from your current password.",
        )
