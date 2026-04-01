from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import User
from placements.models import Skill
from students.models import Student


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
        self.student.resume = SimpleUploadedFile(
            "existing.pdf",
            b"resume",
            content_type="application/pdf",
        )
        self.student.save()

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
