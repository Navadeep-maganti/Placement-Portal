from datetime import timedelta
from unittest.mock import patch

from django.core import mail
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import User
from placements.models import Skill
from students.models import PendingStudentRegistration, Student


class StudentProfileTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="student@example.com",
            password="testpass123",
            role="student",
            first_name="Asha",
            last_name="Patil",
        )
        self.student = Student.objects.create(
            user=self.user,
            registration_no="NITAP001",
            department="CSE",
            graduation_year=2026,
            cgpa=8.7,
            active_backlogs=0,
        )
        self.client.force_authenticate(user=self.user)

    def test_student_can_update_profile_and_resume(self):
        resume = SimpleUploadedFile(
            "resume.pdf",
            b"%PDF-1.4 test resume",
            content_type="application/pdf",
        )

        response = self.client.patch(
            "/api/students/me/",
            {
                "first_name": "Asha",
                "last_name": "Reddy",
                "phone": "9876543210",
                "career_objective": "Become a backend engineer.",
                "skills_summary": "Python, Django, PostgreSQL",
                "resume": resume,
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.student.refresh_from_db()
        self.user.refresh_from_db()

        self.assertEqual(self.user.last_name, "Reddy")
        self.assertEqual(self.student.phone, "9876543210")
        self.assertEqual(self.student.career_objective, "Become a backend engineer.")
        self.assertIn("resume", self.student.resume.name)
        self.assertTrue(self.student.resume.name.endswith(".pdf"))

    def test_student_can_remove_resume(self):
        self.student.resume.save(
            "existing.pdf",
            SimpleUploadedFile(
                "existing.pdf",
                b"resume",
                content_type="application/pdf",
            ),
            save=False,
        )
        self.student.save()
        self.student.resume.close()

        response = self.client.patch(
            "/api/students/me/",
            {"remove_resume": "true"},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.student.refresh_from_db()
        self.assertFalse(bool(self.student.resume))

    def test_student_can_select_existing_and_new_skills(self):
        Skill.objects.create(name="React")

        response = self.client.patch(
            "/api/students/me/",
            {
                "skill_names": ["React", "Go", "React"],
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.student.refresh_from_db()

        self.assertEqual(
            list(self.student.skills.order_by("name").values_list("name", flat=True)),
            ["Go", "React"],
        )
        self.assertEqual(self.student.skills_summary, "React, Go")
        self.assertEqual(response.data["skill_names"], ["Go", "React"])


class StudentRegistrationTests(APITestCase):
    def test_student_can_request_otp_with_allowed_email_domain(self):
        response = self.client.post(
            "/api/students/register/request-otp/",
            {
                "first_name": "Asha",
                "last_name": "Reddy",
                "email": "asha@student.nitandhra.ac.in",
                "password": "StrongPass123!",
                "confirm_password": "StrongPass123!",
                "registration_no": "N23CS001",
                "department": "CSE",
                "graduation_year": 2027,
                "cgpa": 8.5,
                "active_backlogs": 0,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        pending = PendingStudentRegistration.objects.get(
            email="asha@student.nitandhra.ac.in"
        )
        self.assertEqual(pending.registration_data["registration_no"], "N23CS001")
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("expires in 10 minutes", mail.outbox[0].body)

    def test_student_registration_rejects_non_college_email(self):
        response = self.client.post(
            "/api/students/register/request-otp/",
            {
                "first_name": "Asha",
                "last_name": "Reddy",
                "email": "asha@gmail.com",
                "password": "StrongPass123!",
                "confirm_password": "StrongPass123!",
                "registration_no": "N23CS001",
                "department": "CSE",
                "graduation_year": 2027,
                "cgpa": 8.5,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_student_can_verify_otp_and_create_account(self):
        request_response = self.client.post(
            "/api/students/register/request-otp/",
            {
                "first_name": "Asha",
                "last_name": "Reddy",
                "email": "asha@student.nitandhra.ac.in",
                "password": "StrongPass123!",
                "confirm_password": "StrongPass123!",
                "registration_no": "N23CS001",
                "department": "CSE",
                "graduation_year": 2027,
                "cgpa": 8.5,
            },
            format="json",
        )
        self.assertEqual(request_response.status_code, status.HTTP_200_OK)

        otp = "".join(filter(str.isdigit, mail.outbox[0].body.split("is ")[1][:6]))
        response = self.client.post(
            "/api/students/register/verify-otp/",
            {
                "email": "asha@student.nitandhra.ac.in",
                "otp": otp,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email="asha@student.nitandhra.ac.in")
        student = Student.objects.get(user=user)
        self.assertEqual(user.role, "student")
        self.assertEqual(student.registration_no, "N23CS001")
        self.assertFalse(
            PendingStudentRegistration.objects.filter(
                email="asha@student.nitandhra.ac.in"
            ).exists()
        )

    @override_settings(
        EMAIL_BACKEND="django.core.mail.backends.smtp.EmailBackend",
        EMAIL_HOST="",
        EMAIL_HOST_USER="",
        EMAIL_HOST_PASSWORD="",
    )
    def test_student_request_otp_requires_complete_smtp_configuration(self):
        response = self.client.post(
            "/api/students/register/request-otp/",
            {
                "first_name": "Asha",
                "last_name": "Reddy",
                "email": "asha@student.nitandhra.ac.in",
                "password": "StrongPass123!",
                "confirm_password": "StrongPass123!",
                "registration_no": "N23CS001",
                "department": "CSE",
                "graduation_year": 2027,
                "cgpa": 8.5,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertIn("EMAIL_HOST", response.data["detail"])
        self.assertFalse(
            PendingStudentRegistration.objects.filter(
                email="asha@student.nitandhra.ac.in"
            ).exists()
        )

    @patch(
        "students.views.send_transactional_email",
        side_effect=RuntimeError("SMTP failure"),
    )
    def test_student_request_otp_rolls_back_pending_registration_when_email_fails(
        self,
        mocked_send_transactional_email,
    ):
        response = self.client.post(
            "/api/students/register/request-otp/",
            {
                "first_name": "Asha",
                "last_name": "Reddy",
                "email": "asha@student.nitandhra.ac.in",
                "password": "StrongPass123!",
                "confirm_password": "StrongPass123!",
                "registration_no": "N23CS001",
                "department": "CSE",
                "graduation_year": 2027,
                "cgpa": 8.5,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        mocked_send_transactional_email.assert_called_once()
        self.assertFalse(
            PendingStudentRegistration.objects.filter(
                email="asha@student.nitandhra.ac.in"
            ).exists()
        )

    def test_student_cannot_verify_expired_otp(self):
        self.client.post(
            "/api/students/register/request-otp/",
            {
                "first_name": "Asha",
                "last_name": "Reddy",
                "email": "asha@student.nitandhra.ac.in",
                "password": "StrongPass123!",
                "confirm_password": "StrongPass123!",
                "registration_no": "N23CS001",
                "department": "CSE",
                "graduation_year": 2027,
                "cgpa": 8.5,
            },
            format="json",
        )
        pending = PendingStudentRegistration.objects.get(
            email="asha@student.nitandhra.ac.in"
        )
        pending.expires_at = timezone.now() - timedelta(minutes=1)
        pending.save(update_fields=["expires_at"])

        response = self.client.post(
            "/api/students/register/verify-otp/",
            {
                "email": "asha@student.nitandhra.ac.in",
                "otp": "123456",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("OTP expired", str(response.data))
