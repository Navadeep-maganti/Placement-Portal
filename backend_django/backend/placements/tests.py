from datetime import date, timedelta

from rest_framework import status
from rest_framework.test import APITestCase

from api.models import User
from applications.models import Application, ApplicationStatus
from companies.models import Company
from placements.models import EligibleDepartment, Placement, Skill
from students.models import Student


class PlacementEligibilityTests(APITestCase):
    def setUp(self):
        self.student_user = User.objects.create_user(
            email="ineligible@example.com",
            password="password123",
            first_name="In",
            last_name="Eligible",
            role="student",
        )
        self.company_user = User.objects.create_user(
            email="recruiter@example.com",
            password="password123",
            first_name="Recruit",
            last_name="Er",
            role="company",
        )
        self.student = Student.objects.create(
            user=self.student_user,
            registration_no="2022EC001",
            department="ECE",
            graduation_year=2025,
            cgpa=6.8,
            active_backlogs=2,
        )
        self.company = Company.objects.create(
            user=self.company_user,
            company_name="Future Labs",
            location="Bengaluru",
            industry="Hardware",
            description="Core company",
            is_approved=True,
        )
        self.placement = Placement.objects.create(
            company=self.company,
            job_title="Embedded Engineer",
            job_description="Firmware work",
            salary=8,
            eligibility_cgpa=7.5,
            application_deadline=date.today() + timedelta(days=10),
            is_active=True,
            no_of_positions=1,
        )
        criteria = self.placement.eligibility_criteria
        criteria.max_backlogs = 0
        criteria.graduation_year = 2026
        criteria.requires_resume = True
        criteria.save()
        EligibleDepartment.objects.create(criteria=criteria, department_name="CSE")

    def test_student_cannot_apply_when_eligibility_rules_fail(self):
        self.client.force_authenticate(user=self.student_user)
        response = self.client.post(
            "/api/applications/apply/",
            {"placement_id": self.placement.id},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("eligibility_issues", response.data)
        self.assertGreaterEqual(len(response.data["eligibility_issues"]), 1)

    def test_student_cannot_apply_after_accepting_other_offer(self):
        self.student.cgpa = 8.4
        self.student.active_backlogs = 0
        self.student.department = "CSE"
        self.student.graduation_year = 2026
        self.student.save()

        offered_status, _ = ApplicationStatus.objects.get_or_create(
            code="offer_accepted",
            defaults={"name": "Offer Accepted", "sort_order": 4},
        )
        other_placement = Placement.objects.create(
            company=self.company,
            job_title="Accepted Role",
            job_description="Already accepted",
            salary=9,
            eligibility_cgpa=7.0,
            application_deadline=date.today() + timedelta(days=5),
            is_active=True,
            no_of_positions=1,
        )
        Application.objects.create(
            student=self.student,
            job=other_placement,
            status=offered_status,
        )

        self.client.force_authenticate(user=self.student_user)
        response = self.client.post(
            "/api/applications/apply/",
            {"placement_id": self.placement.id},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("accepted an offer", " ".join(response.data["eligibility_issues"]).lower())


class RecruiterPostingsApiTests(APITestCase):
    def setUp(self):
        self.company_user = User.objects.create_user(
            email="company@example.com",
            password="password123",
            first_name="Com",
            last_name="Pany",
            role="company",
        )
        self.other_company_user = User.objects.create_user(
            email="othercompany@example.com",
            password="password123",
            first_name="Other",
            last_name="Company",
            role="company",
        )
        self.student_user = User.objects.create_user(
            email="student@example.com",
            password="password123",
            first_name="Stu",
            last_name="Dent",
            role="student",
        )

        self.company = Company.objects.create(
            user=self.company_user,
            company_name="Future Labs",
            location="Bengaluru",
            industry="Hardware",
            description="Core company",
            is_approved=True,
        )
        self.other_company = Company.objects.create(
            user=self.other_company_user,
            company_name="Next Labs",
            location="Hyderabad",
            industry="Software",
            description="Software company",
            is_approved=True,
        )

        self.own_placement = Placement.objects.create(
            company=self.company,
            job_title="Backend Engineer",
            job_description="Build APIs",
            salary=10,
            eligibility_cgpa=7.0,
            application_deadline=date.today() + timedelta(days=14),
            is_active=True,
            no_of_positions=2,
        )
        self.other_placement = Placement.objects.create(
            company=self.other_company,
            job_title="Frontend Engineer",
            job_description="Build UIs",
            salary=9,
            eligibility_cgpa=6.5,
            application_deadline=date.today() + timedelta(days=10),
            is_active=True,
            no_of_positions=1,
        )

    def test_company_can_list_only_own_postings(self):
        self.client.force_authenticate(user=self.company_user)

        response = self.client.get("/api/placements/my-postings/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.own_placement.id)

    def test_company_can_create_posting_for_itself(self):
        self.client.force_authenticate(user=self.company_user)

        response = self.client.post(
            "/api/placements/my-postings/",
            {
                "job_title": "Platform Engineer",
                "job_description": "Build internal tooling",
                "salary": "12.00",
                "eligibility_cgpa": 7.5,
                "application_deadline": str(date.today() + timedelta(days=21)),
                "is_active": True,
                "no_of_positions": 3,
                "required_skills": [],
                "eligibility_details": {
                    "min_cgpa": 7.5,
                    "max_backlogs": 0,
                    "requires_resume": True,
                    "allowed_departments": ["CSE", "IT"],
                },
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        placement = Placement.objects.get(job_title="Platform Engineer")
        self.assertEqual(placement.company_id, self.company.id)
        self.assertEqual(placement.eligibility_criteria.max_backlogs, 0)
        self.assertTrue(placement.eligibility_criteria.requires_resume)
        self.assertCountEqual(
            list(
                placement.eligibility_criteria.allowed_departments.values_list(
                    "department_name",
                    flat=True,
                )
            ),
            ["CSE", "IT"],
        )

    def test_company_cannot_access_other_company_posting(self):
        self.client.force_authenticate(user=self.company_user)

        response = self.client.get(
            f"/api/placements/my-postings/{self.other_placement.id}/"
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_student_cannot_access_my_postings_endpoint(self):
        self.client.force_authenticate(user=self.student_user)

        response = self.client.get("/api/placements/my-postings/")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_company_dashboard_summary_returns_live_counts(self):
        shortlisted_status, _ = ApplicationStatus.objects.get_or_create(
            code="shortlisted",
            defaults={"name": "Shortlisted", "sort_order": 2},
        )
        Application.objects.create(
            student=Student.objects.create(
                user=self.student_user,
                registration_no="2022CSE001",
                department="CSE",
                graduation_year=2026,
                cgpa=8.2,
                active_backlogs=0,
            ),
            job=self.own_placement,
            status=shortlisted_status,
        )

        self.client.force_authenticate(user=self.company_user)
        response = self.client.get("/api/placements/company-dashboard/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["overview"]["active_job_posts"], 1)
        self.assertEqual(response.data["overview"]["total_applicants"], 1)
        self.assertEqual(response.data["overview"]["shortlisted_students"], 1)
        self.assertIn("recent_activity", response.data)

    def test_any_authenticated_user_can_list_skills(self):
        Skill.objects.create(name="React")
        Skill.objects.create(name="Python")

        self.client.force_authenticate(user=self.company_user)
        response = self.client.get("/api/placements/skills/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([item["name"] for item in response.data], ["Python", "React"])

    def test_company_can_create_skill_and_reuse_existing_one(self):
        Skill.objects.create(name="Django")
        self.client.force_authenticate(user=self.company_user)

        create_response = self.client.post(
            "/api/placements/skills/",
            {"name": "TypeScript"},
            format="json",
        )
        reuse_response = self.client.post(
            "/api/placements/skills/",
            {"name": "django"},
            format="json",
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(reuse_response.status_code, status.HTTP_200_OK)
        self.assertEqual(Skill.objects.filter(name__iexact="Django").count(), 1)
