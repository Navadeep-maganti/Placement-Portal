from datetime import date, timedelta

from rest_framework import status
from rest_framework.test import APITestCase

from activitylog.models import ActivityLog
from api.models import User
from applications.models import Application, ApplicationStatus, ApplicationStatusHistory
from companies.models import Company
from placements.models import EligibleDepartment, Placement
from students.models import Student


class ApplicationWorkflowTests(APITestCase):
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
            cgpa=8.4,
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

    def test_apply_creates_status_history_and_activity_log(self):
        criteria = self.placement.eligibility_criteria
        criteria.max_backlogs = 0
        criteria.graduation_year = 2026
        criteria.save()
        EligibleDepartment.objects.create(criteria=criteria, department_name="CSE")

        self.client.force_authenticate(user=self.student_user)
        response = self.client.post(
            "/api/applications/apply/",
            {"placement_id": self.placement.id},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        application = Application.objects.get(student=self.student, job=self.placement)
        history = ApplicationStatusHistory.objects.filter(application=application)
        self.assertEqual(history.count(), 1)
        self.assertEqual(history.first().new_status.code, "applied")
        self.assertTrue(
            ActivityLog.objects.filter(
                application=application,
                action_type=ActivityLog.ActionType.APPLICATION_SUBMITTED,
            ).exists()
        )
        self.assertEqual(application.application_profile["first_name"], "Stu")

    def test_company_status_update_creates_history_entry(self):
        applied_status, _ = ApplicationStatus.objects.get_or_create(
            code="applied",
            defaults={"name": "Applied", "sort_order": 1},
        )
        shortlisted_status, _ = ApplicationStatus.objects.get_or_create(
            code="shortlisted",
            defaults={"name": "Shortlisted", "sort_order": 2},
        )
        application = Application.objects.create(
            student=self.student,
            job=self.placement,
            status=applied_status,
        )

        self.client.force_authenticate(user=self.company_user)
        response = self.client.patch(
            f"/api/applications/{application.id}/status/",
            {"status_id": shortlisted_status.id, "remarks": "Excellent resume"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        application.refresh_from_db()
        self.assertEqual(application.status.code, "shortlisted")
        self.assertEqual(application.status_history.count(), 2)
        latest_history = application.status_history.first()
        self.assertEqual(latest_history.previous_status.code, "applied")
        self.assertEqual(latest_history.new_status.code, "shortlisted")
        self.assertEqual(latest_history.changed_by, self.company_user)
        self.assertTrue(
            ActivityLog.objects.filter(
                application=application,
                action_type=ActivityLog.ActionType.APPLICATION_STATUS_CHANGED,
            ).exists()
        )

    def test_student_can_accept_offer(self):
        offered_status, _ = ApplicationStatus.objects.get_or_create(
            code="offered",
            defaults={"name": "Offered", "sort_order": 3},
        )
        second_company_user = User.objects.create_user(
            email="company2@example.com",
            password="password123",
            first_name="Second",
            last_name="Recruiter",
            role="company",
        )
        second_company = Company.objects.create(
            user=second_company_user,
            company_name="Beta Corp",
            location="Chennai",
            industry="Software",
            description="Hiring platform engineers",
            is_approved=True,
        )
        second_placement = Placement.objects.create(
            company=second_company,
            job_title="Platform Engineer",
            job_description="Scale backend systems",
            salary=14,
            eligibility_cgpa=7.0,
            application_deadline=date.today() + timedelta(days=10),
            is_active=True,
            no_of_positions=2,
        )
        application = Application.objects.create(
            student=self.student,
            job=self.placement,
            status=offered_status,
        )
        second_application = Application.objects.create(
            student=self.student,
            job=second_placement,
            status=offered_status,
        )

        self.client.force_authenticate(user=self.student_user)
        response = self.client.post(
            f"/api/applications/{application.id}/offer-decision/",
            {"decision": "accept"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        application.refresh_from_db()
        second_application.refresh_from_db()
        self.assertEqual(application.status.code, "offer_accepted")
        self.assertEqual(second_application.status.code, "closed_after_offer_acceptance")
        self.assertEqual(application.status_history.count(), 2)

    def test_company_cannot_create_second_offer_for_same_student(self):
        offered_status, _ = ApplicationStatus.objects.get_or_create(
            code="offered",
            defaults={"name": "Offered", "sort_order": 3},
        )
        shortlisted_status, _ = ApplicationStatus.objects.get_or_create(
            code="shortlisted",
            defaults={"name": "Shortlisted", "sort_order": 2},
        )
        second_placement = Placement.objects.create(
            company=self.company,
            job_title="Data Engineer",
            job_description="Build pipelines",
            salary=11,
            eligibility_cgpa=7.0,
            application_deadline=date.today() + timedelta(days=7),
            is_active=True,
            no_of_positions=1,
        )
        first_application = Application.objects.create(
            student=self.student,
            job=self.placement,
            status=offered_status,
        )
        second_application = Application.objects.create(
            student=self.student,
            job=second_placement,
            status=shortlisted_status,
        )

        self.client.force_authenticate(user=self.company_user)
        response = self.client.patch(
            f"/api/applications/{second_application.id}/status/",
            {"status_id": offered_status.id, "remarks": "Second offer attempt"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        second_application.refresh_from_db()
        self.assertEqual(second_application.status.code, "shortlisted")

    def test_company_can_list_own_applicants(self):
        applied_status, _ = ApplicationStatus.objects.get_or_create(
            code="applied",
            defaults={"name": "Applied", "sort_order": 1},
        )
        Application.objects.create(
            student=self.student,
            job=self.placement,
            status=applied_status,
            application_profile={
                "first_name": "Stu",
                "last_name": "Dent",
                "email": "student@example.com",
                "department": "CSE",
                "cgpa": 8.4,
                "active_backlogs": 0,
                "skills_summary": "Python, Django",
            },
        )

        self.client.force_authenticate(user=self.company_user)
        response = self.client.get("/api/applications/company-applicants/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["job_title"], "Backend Engineer")
        self.assertEqual(response.data[0]["applicant_name"], "Stu Dent")
        self.assertEqual(response.data[0]["applicant_department"], "CSE")
        self.assertEqual(response.data[0]["applicant_skills_summary"], "Python, Django")

    def test_company_can_list_active_statuses(self):
        ApplicationStatus.objects.get_or_create(
            code="shortlisted",
            defaults={"name": "Shortlisted", "sort_order": 2},
        )

        self.client.force_authenticate(user=self.company_user)
        response = self.client.get("/api/applications/statuses/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
        self.assertIn("code", response.data[0])
