from datetime import date, timedelta

from rest_framework import status
from rest_framework.test import APITestCase

from api.models import User
from applications.models import Application, ApplicationStatus
from companies.models import Company
from placements.models import EligibleDepartment, Placement
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
