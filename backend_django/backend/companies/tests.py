from rest_framework import status
from rest_framework.test import APITestCase

from api.models import User
from companies.models import Company


class RecruiterRegistrationTests(APITestCase):
    def test_register_recruiter_creates_unapproved_company_account(self):
        response = self.client.post(
            "/api/companies/register/",
            {
                "first_name": "Asha",
                "last_name": "Menon",
                "email": "asha@acme.com",
                "password": "StrongPass123!",
                "confirm_password": "StrongPass123!",
                "company_name": "Acme Labs",
                "location": "Bengaluru",
                "industry": "Software",
                "website": "https://acme.example.com",
                "description": "Campus hiring for software roles.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            response.data["detail"],
            "Recruiter account created successfully. Admin approval is pending.",
        )

        user = User.objects.get(email="asha@acme.com")
        company = Company.objects.get(user=user)

        self.assertEqual(user.role, "company")
        self.assertFalse(company.is_approved)
        self.assertEqual(company.company_name, "Acme Labs")

    def test_register_recruiter_requires_matching_password_confirmation(self):
        response = self.client.post(
            "/api/companies/register/",
            {
                "first_name": "Asha",
                "last_name": "Menon",
                "email": "asha@acme.com",
                "password": "StrongPass123!",
                "confirm_password": "DifferentPass123!",
                "company_name": "Acme Labs",
                "location": "Bengaluru",
                "industry": "Software",
                "website": "https://acme.example.com",
                "description": "Campus hiring for software roles.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["confirm_password"][0],
            "Password confirmation does not match.",
        )
