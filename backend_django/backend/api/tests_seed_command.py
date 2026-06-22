from django.core.management import call_command
from django.test import TestCase

from api.models import User
from applications.models import Application, ApplicationStatus, ApplicationStatusHistory
from companies.models import Company
from placements.models import Placement
from students.models import Student


class SeedPerformanceDataCommandTests(TestCase):
    def test_seed_command_creates_reusable_dataset(self):
        call_command(
            "seed_performance_data",
            students=6,
            recruiters=2,
            jobs_per_recruiter=2,
            applications_per_student=2,
            bookmarks_per_student=1,
            seed=11,
            password="Secret123!",
        )

        self.assertEqual(User.objects.filter(role="company").count(), 2)
        self.assertEqual(User.objects.filter(role="student").count(), 6)
        self.assertEqual(Company.objects.count(), 2)
        self.assertEqual(Student.objects.count(), 6)
        self.assertEqual(Placement.objects.count(), 4)
        self.assertGreater(Application.objects.count(), 0)
        self.assertGreater(ApplicationStatusHistory.objects.count(), 0)
        self.assertTrue(
            User.objects.filter(email__iendswith="@perf.local").exists()
        )
        self.assertTrue(
            ApplicationStatus.objects.filter(code="offer_accepted").exists()
        )

        first_application_count = Application.objects.count()

        call_command(
            "seed_performance_data",
            students=6,
            recruiters=2,
            jobs_per_recruiter=2,
            applications_per_student=2,
            bookmarks_per_student=1,
            seed=11,
            password="Secret123!",
        )

        self.assertEqual(User.objects.filter(role="company").count(), 2)
        self.assertEqual(User.objects.filter(role="student").count(), 6)
        self.assertEqual(Company.objects.count(), 2)
        self.assertEqual(Student.objects.count(), 6)
        self.assertEqual(Placement.objects.count(), 4)
        self.assertEqual(Application.objects.count(), first_application_count)
