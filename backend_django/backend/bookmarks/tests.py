from datetime import date, timedelta

from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import User
from bookmarks.models import Bookmark
from companies.models import Company
from placements.models import Placement, Skill
from students.models import Student


class BookmarkModelTests(TestCase):
    def test_string_representation_uses_email_for_custom_user_model(self):
        user = User.objects.create_user(
            email="student@example.com",
            password="password123",
            first_name="Stu",
            last_name="Dent",
            role="student",
        )
        company_user = User.objects.create_user(
            email="company@example.com",
            password="password123",
            first_name="Hire",
            last_name="Manager",
            role="company",
        )
        student = Student.objects.create(
            user=user,
            registration_no="2022CS001",
            department="CSE",
            graduation_year=2026,
            cgpa=8.5,
            active_backlogs=0,
        )
        company = Company.objects.create(
            user=company_user,
            company_name="Acme Corp",
            location="Hyderabad",
            industry="Software",
            description="Recruiting software engineers",
            is_approved=True,
        )
        placement = Placement.objects.create(
            company=company,
            job_title="Backend Engineer",
            job_description="Build APIs",
            salary=12,
            eligibility_cgpa=7.0,
            application_deadline=date.today() + timedelta(days=7),
            is_active=True,
            no_of_positions=2,
        )

        bookmark = Bookmark.objects.create(student=student, placement=placement)

        self.assertEqual(str(bookmark), "student@example.com bookmarked Backend Engineer")


class BookmarkApiTests(APITestCase):
    def setUp(self):
        self.student_user = User.objects.create_user(
            email="student@example.com",
            password="password123",
            first_name="Stu",
            last_name="Dent",
            role="student",
        )
        self.company_user = User.objects.create_user(
            email="company@example.com",
            password="password123",
            first_name="Hire",
            last_name="Manager",
            role="company",
        )
        self.student = Student.objects.create(
            user=self.student_user,
            registration_no="2022CS001",
            department="CSE",
            graduation_year=2026,
            cgpa=8.5,
            active_backlogs=0,
        )
        self.company = Company.objects.create(
            user=self.company_user,
            company_name="Acme Corp",
            location="Hyderabad",
            industry="Software",
            description="Recruiting software engineers",
            is_approved=True,
        )
        self.placement = Placement.objects.create(
            company=self.company,
            job_title="Backend Engineer",
            job_description="Build APIs",
            salary=12,
            eligibility_cgpa=7.0,
            application_deadline=date.today() + timedelta(days=7),
            is_active=True,
            no_of_positions=2,
        )
        self.placement.required_skills.add(Skill.objects.create(name="Django"))
        Bookmark.objects.create(student=self.student, placement=self.placement)

    def test_bookmark_list_includes_required_skills_without_database_error(self):
        self.client.force_authenticate(user=self.student_user)

        response = self.client.get("/api/bookmarks/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["job_title"], "Backend Engineer")
        self.assertEqual(response.data[0]["required_skill_names"], ["Django"])
