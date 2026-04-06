from unittest.mock import patch

from django.core import mail
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import User
from companies.models import Company, PendingRecruiterRegistration


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

    def test_recruiter_can_request_registration_otp(self):
        response = self.client.post(
            "/api/companies/register/request-otp/",
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

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        pending = PendingRecruiterRegistration.objects.get(email="asha@acme.com")
        self.assertEqual(pending.registration_data["company_name"], "Acme Labs")
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("recruiter registration", mail.outbox[0].body)

    def test_recruiter_can_verify_otp_and_create_pending_company_account(self):
        request_response = self.client.post(
            "/api/companies/register/request-otp/",
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
        self.assertEqual(request_response.status_code, status.HTTP_200_OK)

        otp = "".join(filter(str.isdigit, mail.outbox[0].body.split("is ")[1][:6]))
        response = self.client.post(
            "/api/companies/register/verify-otp/",
            {
                "email": "asha@acme.com",
                "otp": otp,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email="asha@acme.com")
        company = Company.objects.get(user=user)
        self.assertEqual(user.role, "company")
        self.assertFalse(company.is_approved)
        self.assertFalse(
            PendingRecruiterRegistration.objects.filter(email="asha@acme.com").exists()
        )

    @override_settings(
        EMAIL_BACKEND="django.core.mail.backends.smtp.EmailBackend",
        EMAIL_HOST="",
        EMAIL_HOST_USER="",
        EMAIL_HOST_PASSWORD="",
    )
    def test_recruiter_request_otp_requires_complete_smtp_configuration(self):
        response = self.client.post(
            "/api/companies/register/request-otp/",
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

        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertIn("EMAIL_HOST", response.data["detail"])

    @patch(
        "companies.views.send_transactional_email",
        side_effect=RuntimeError("SMTP failure"),
    )
    def test_recruiter_request_otp_rolls_back_pending_registration_when_email_fails(
        self,
        mocked_send_transactional_email,
    ):
        response = self.client.post(
            "/api/companies/register/request-otp/",
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

        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        mocked_send_transactional_email.assert_called_once()
        self.assertFalse(
            PendingRecruiterRegistration.objects.filter(email="asha@acme.com").exists()
        )
