from __future__ import annotations

import random
from dataclasses import dataclass
from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import connection, transaction
from django.db.models import Q
from django.utils import timezone

from activitylog.models import ActivityLog
from api.models import User
from applications.models import Application, ApplicationStatus, ApplicationStatusHistory
from bookmarks.models import Bookmark
from companies.models import Company
from placements.models import (
    EligibleDepartment,
    EligibilityCriteria,
    Placement,
    Skill,
)
from students.models import Student


GENERATED_EMAIL_DOMAIN = "perf.local"
GENERATED_REGISTRATION_PREFIX = "PF"

DEPARTMENTS = [
    "CSE",
    "IT",
    "ECE",
    "EEE",
    "ME",
    "CE",
    "AIML",
]

FIRST_NAMES = [
    "Aarav",
    "Aditi",
    "Akhil",
    "Ananya",
    "Arjun",
    "Bhavana",
    "Charan",
    "Diya",
    "Harsha",
    "Ishita",
    "Karthik",
    "Keerthi",
    "Madhav",
    "Nikhil",
    "Pranavi",
    "Rahul",
    "Sai",
    "Saanvi",
    "Tejas",
    "Vaishnavi",
]

LAST_NAMES = [
    "Agarwal",
    "Babu",
    "Chandra",
    "Das",
    "Goud",
    "Iyer",
    "Kumar",
    "Mehta",
    "Nair",
    "Patel",
    "Rao",
    "Reddy",
    "Sharma",
    "Singh",
    "Verma",
]

COMPANY_CATALOG = [
    {
        "company_name": "AsterByte Systems",
        "industry": "Software",
        "location": "Bengaluru",
        "website": "https://asterbyte.example.com",
        "description": "Builds cloud-native SaaS products for enterprise operations teams.",
    },
    {
        "company_name": "NorthGrid Analytics",
        "industry": "Data Analytics",
        "location": "Hyderabad",
        "website": "https://northgrid.example.com",
        "description": "Delivers decision intelligence platforms for retail and logistics.",
    },
    {
        "company_name": "VoltEdge Mobility",
        "industry": "Automotive",
        "location": "Pune",
        "website": "https://voltedge.example.com",
        "description": "Develops EV platforms, telemetry systems, and charging infrastructure.",
    },
    {
        "company_name": "CrestWave Fintech",
        "industry": "FinTech",
        "location": "Chennai",
        "website": "https://crestwave.example.com",
        "description": "Creates payment, lending, and risk orchestration products.",
    },
    {
        "company_name": "OrbitMesh Networks",
        "industry": "Networking",
        "location": "Noida",
        "website": "https://orbitmesh.example.com",
        "description": "Builds secure network automation platforms and observability tooling.",
    },
    {
        "company_name": "BluePeak Health",
        "industry": "HealthTech",
        "location": "Mumbai",
        "website": "https://bluepeak.example.com",
        "description": "Works on patient engagement, diagnostics workflow, and care analytics.",
    },
    {
        "company_name": "ForgeLine Robotics",
        "industry": "Industrial Automation",
        "location": "Coimbatore",
        "website": "https://forgeline.example.com",
        "description": "Designs robotics, controls, and plant digitalization systems.",
    },
    {
        "company_name": "Nimbus Commerce",
        "industry": "E-Commerce",
        "location": "Gurugram",
        "website": "https://nimbus.example.com",
        "description": "Runs marketplace infrastructure, fulfillment intelligence, and growth products.",
    },
]

JOB_TEMPLATES = [
    {
        "title": "Software Engineer Trainee",
        "skills": ["Python", "Django", "REST APIs", "PostgreSQL"],
        "departments": ["CSE", "IT", "AIML"],
        "salary": Decimal("8.50"),
        "min_cgpa": 7.0,
    },
    {
        "title": "Data Analyst",
        "skills": ["SQL", "Python", "Power BI", "Statistics"],
        "departments": ["CSE", "IT", "AIML", "ECE"],
        "salary": Decimal("7.20"),
        "min_cgpa": 6.8,
    },
    {
        "title": "Frontend Engineer",
        "skills": ["JavaScript", "React", "HTML", "CSS"],
        "departments": ["CSE", "IT", "AIML"],
        "salary": Decimal("8.00"),
        "min_cgpa": 6.8,
    },
    {
        "title": "Platform Engineer",
        "skills": ["Linux", "Docker", "AWS", "CI/CD"],
        "departments": ["CSE", "IT", "ECE"],
        "salary": Decimal("10.50"),
        "min_cgpa": 7.4,
    },
    {
        "title": "Embedded Systems Engineer",
        "skills": ["C", "C++", "Embedded Systems", "Microcontrollers"],
        "departments": ["ECE", "EEE", "ME"],
        "salary": Decimal("9.10"),
        "min_cgpa": 7.1,
    },
    {
        "title": "QA Automation Engineer",
        "skills": ["Java", "Selenium", "API Testing", "Git"],
        "departments": ["CSE", "IT", "ECE"],
        "salary": Decimal("6.80"),
        "min_cgpa": 6.5,
    },
    {
        "title": "Cybersecurity Analyst",
        "skills": ["Networking", "Python", "SIEM", "Linux"],
        "departments": ["CSE", "IT", "ECE"],
        "salary": Decimal("9.40"),
        "min_cgpa": 7.3,
    },
    {
        "title": "Business Analyst",
        "skills": ["Excel", "SQL", "Communication", "Power BI"],
        "departments": ["CSE", "IT", "CE", "ME", "ECE"],
        "salary": Decimal("6.50"),
        "min_cgpa": 6.4,
    },
]

STATUS_SEED = [
    ("applied", "Applied", 1),
    ("shortlisted", "Shortlisted", 2),
    ("offered", "Offered", 3),
    ("offer_accepted", "Offer Accepted", 4),
    ("offer_declined", "Offer Declined", 5),
    ("closed_after_offer_acceptance", "Closed After Offer Acceptance", 6),
    ("rejected", "Rejected", 7),
]


@dataclass(frozen=True)
class PlacementSnapshot:
    placement: Placement
    min_cgpa: float
    max_backlogs: int | None
    graduation_year: int | None
    requires_resume: bool
    allowed_departments: list[str]


class Command(BaseCommand):
    help = (
        "Seeds reusable recruiter, student, placement, application, and bookmark "
        "data for local performance testing."
    )

    def add_arguments(self, parser):
        parser.add_argument("--students", type=int, default=120)
        parser.add_argument("--recruiters", type=int, default=10)
        parser.add_argument("--jobs-per-recruiter", type=int, default=4)
        parser.add_argument("--applications-per-student", type=int, default=3)
        parser.add_argument("--bookmarks-per-student", type=int, default=2)
        parser.add_argument("--seed", type=int, default=20260325)
        parser.add_argument("--password", type=str, default="PerfTest123!")
        parser.add_argument(
            "--append",
            action="store_true",
            help="Keep previously generated performance data instead of refreshing it.",
        )

    def handle(self, *args, **options):
        students_count = max(options["students"], 0)
        recruiters_count = max(options["recruiters"], 0)
        jobs_per_recruiter = max(options["jobs_per_recruiter"], 0)
        applications_per_student = max(options["applications_per_student"], 0)
        bookmarks_per_student = max(options["bookmarks_per_student"], 0)
        seed = options["seed"]
        shared_password = options["password"]
        append = options["append"]
        rng = random.Random(seed)

        if recruiters_count == 0 and students_count == 0:
            self.stdout.write(self.style.WARNING("Nothing to seed."))
            return

        with transaction.atomic():
            if not append:
                self._clear_generated_data()

            # Ensure default Admin (Faculty) user exists
            admin_email = "admin@gmail.com"
            if not User.objects.filter(email=admin_email).exists():
                User.objects.create_superuser(
                    email=admin_email,
                    password="Admin@123",
                    first_name="Portal",
                    last_name="Admin",
                )
                self.stdout.write(f"Default admin created: {admin_email} / Admin@123")

            statuses = self._ensure_statuses()

            skills = self._ensure_skills()
            recruiters = self._create_recruiters(recruiters_count, shared_password, rng)
            students = self._create_students(students_count, shared_password, rng)
            placements = self._create_placements(
                recruiters,
                jobs_per_recruiter,
                skills,
                rng,
            )
            applications_created = self._create_applications(
                students,
                placements,
                applications_per_student,
                statuses,
                rng,
            )
            bookmarks_created = self._create_bookmarks(
                students,
                placements,
                bookmarks_per_student,
                rng,
            )

        self.stdout.write(
            self.style.SUCCESS(
                "Performance data ready: "
                f"{len(recruiters)} recruiters, "
                f"{len(students)} students, "
                f"{len(placements)} placements, "
                f"{applications_created} applications, "
                f"{bookmarks_created} bookmarks."
            )
        )

        if recruiters:
            recruiter = recruiters[0]
            self.stdout.write(
                f"Recruiter login: {recruiter.user.email} / {shared_password}"
            )
        if students:
            student = students[0]
            self.stdout.write(
                f"Student login: {student.user.email} / {shared_password}"
            )

    def _clear_generated_data(self):
        self.stdout.write("Refreshing previously generated performance data...")
        generated_user_ids = list(
            User.objects.filter(
                email__iendswith=f"@{GENERATED_EMAIL_DOMAIN}"
            ).values_list("id", flat=True)
        )
        if not generated_user_ids:
            return

        student_ids = list(
            Student.objects.filter(user_id__in=generated_user_ids).values_list(
                "id",
                flat=True,
            )
        )
        company_ids = list(
            Company.objects.filter(user_id__in=generated_user_ids).values_list(
                "id",
                flat=True,
            )
        )
        placement_ids = list(
            Placement.objects.filter(company_id__in=company_ids).values_list(
                "id",
                flat=True,
            )
        )
        application_ids = list(
            Application.objects.filter(
                Q(student_id__in=student_ids) | Q(job_id__in=placement_ids)
            ).values_list("id", flat=True)
        )

        if application_ids or placement_ids:
            ActivityLog.objects.filter(
                Q(application_id__in=application_ids)
                | Q(placement_id__in=placement_ids)
            ).delete()
        if application_ids:
            ApplicationStatusHistory.objects.filter(
                application_id__in=application_ids
            ).delete()
            Application.objects.filter(id__in=application_ids).delete()

        if student_ids or placement_ids:
            Bookmark.objects.filter(
                Q(student_id__in=student_ids) | Q(placement_id__in=placement_ids)
            ).delete()

        if placement_ids:
            self._delete_required_skill_rows(placement_ids)
            EligibleDepartment.objects.filter(
                criteria__placement_id__in=placement_ids
            ).delete()
            EligibilityCriteria.objects.filter(placement_id__in=placement_ids).delete()
            self._delete_rows_by_ids("jobs_job", placement_ids)

        if company_ids:
            Company.objects.filter(id__in=company_ids).delete()
        if student_ids:
            Student.objects.filter(id__in=student_ids).delete()
        User.objects.filter(id__in=generated_user_ids).delete()

    def _ensure_statuses(self):
        statuses = {}
        for code, name, sort_order in STATUS_SEED:
            status, _ = ApplicationStatus.objects.update_or_create(
                code=code,
                defaults={
                    "name": name,
                    "is_active": True,
                    "sort_order": sort_order,
                },
            )
            statuses[code] = status
        return statuses

    def _ensure_skills(self):
        skill_names = sorted(
            {
                skill_name
                for template in JOB_TEMPLATES
                for skill_name in template["skills"]
            }
        )
        skills = {}
        for name in skill_names:
            skills[name], _ = Skill.objects.get_or_create(name=name)
        return skills

    def _create_recruiters(self, recruiters_count, shared_password, rng):
        recruiters = []

        for index in range(recruiters_count):
            profile = COMPANY_CATALOG[index % len(COMPANY_CATALOG)]
            first_name = FIRST_NAMES[index % len(FIRST_NAMES)]
            last_name = LAST_NAMES[(index * 2) % len(LAST_NAMES)]
            company_suffix = f" {index // len(COMPANY_CATALOG) + 2}" if index >= len(COMPANY_CATALOG) else ""
            email = f"recruiter{index + 1:03d}@{GENERATED_EMAIL_DOMAIN}"

            user = User.objects.create_user(
                email=email,
                password=shared_password,
                first_name=first_name,
                last_name=last_name,
                role="company",
            )
            company = Company.objects.create(
                user=user,
                company_name=f"{profile['company_name']}{company_suffix}",
                location=profile["location"],
                industry=profile["industry"],
                website=profile["website"],
                description=profile["description"],
                is_approved=True,
            )
            recruiters.append(company)

        rng.shuffle(recruiters)
        return recruiters

    def _create_students(self, students_count, shared_password, rng):
        students = []

        for index in range(students_count):
            first_name = FIRST_NAMES[index % len(FIRST_NAMES)]
            last_name = LAST_NAMES[(index * 3) % len(LAST_NAMES)]
            department = DEPARTMENTS[index % len(DEPARTMENTS)]
            graduation_year = 2025 + (index % 3)
            cgpa = round(6.2 + ((index * 7) % 34) / 10, 1)
            active_backlogs = 0 if index % 4 else 1
            email = f"student{index + 1:04d}@{GENERATED_EMAIL_DOMAIN}"
            registration_no = (
                f"{GENERATED_REGISTRATION_PREFIX}{str(graduation_year)[-2:]}"
                f"{department[:2]}{index + 1:04d}"
            )[:15]

            user = User.objects.create_user(
                email=email,
                password=shared_password,
                first_name=first_name,
                last_name=last_name,
                role="student",
            )
            student = Student.objects.create(
                user=user,
                registration_no=registration_no,
                department=department,
                graduation_year=graduation_year,
                cgpa=cgpa,
                active_backlogs=active_backlogs,
                phone=f"90000{index + 1:05d}"[:10],
                linkedin_url=f"https://linkedin.com/in/{first_name.lower()}-{last_name.lower()}-{index + 1}",
                portfolio_url=f"https://portfolio.example.com/{first_name.lower()}{index + 1}",
                career_objective=(
                    "Seeking a strong entry-level role to contribute to product and platform teams."
                ),
                skills_summary=self._build_student_skill_summary(index),
                bio=(
                    f"{first_name} is focused on internships, problem solving, and production-ready delivery."
                ),
                resume=f"resumes/perf_student_{index + 1:04d}.pdf" if index % 3 != 0 else "",
            )
            students.append(student)

        rng.shuffle(students)
        return students

    def _create_placements(self, recruiters, jobs_per_recruiter, skills, rng):
        placements = []
        today = timezone.localdate()

        for company_index, company in enumerate(recruiters):
            for job_index in range(jobs_per_recruiter):
                template = JOB_TEMPLATES[
                    (company_index * jobs_per_recruiter + job_index)
                    % len(JOB_TEMPLATES)
                ]
                salary_multiplier = Decimal("1.00") + (
                    Decimal("0.15") * ((company_index + job_index) % 4)
                )
                salary = (template["salary"] * salary_multiplier).quantize(Decimal("0.01"))
                deadline = today + timedelta(days=14 + ((company_index + job_index) % 35))
                placement = Placement.objects.create(
                    company=company,
                    job_title=template["title"],
                    job_description=(
                        f"{company.company_name} is hiring a {template['title']} "
                        "for real-world product delivery, collaboration, and execution."
                    ),
                    salary=salary,
                    eligibility_cgpa=template["min_cgpa"],
                    application_deadline=deadline,
                    is_active=True,
                    no_of_positions=2 + ((company_index + job_index) % 4),
                )
                self._assign_required_skills(
                    placement,
                    [skills[skill_name] for skill_name in template["skills"]],
                )

                criteria = placement.eligibility_criteria
                criteria.max_backlogs = 0 if job_index % 2 == 0 else 1
                criteria.graduation_year = 2025 + ((company_index + job_index) % 3)
                criteria.requires_resume = job_index % 3 != 0
                criteria.notes = (
                    "Students should be comfortable with project work, interviews, and quick turnaround tasks."
                )
                criteria.save()

                allowed_departments = template["departments"][:]
                if rng.random() < 0.35:
                    allowed_departments = rng.sample(
                        allowed_departments,
                        k=max(1, len(allowed_departments) - 1),
                    )
                for department in allowed_departments:
                    EligibleDepartment.objects.get_or_create(
                        criteria=criteria,
                        department_name=department,
                    )

                placements.append(
                    PlacementSnapshot(
                        placement=placement,
                        min_cgpa=criteria.min_cgpa,
                        max_backlogs=criteria.max_backlogs,
                        graduation_year=criteria.graduation_year,
                        requires_resume=criteria.requires_resume,
                        allowed_departments=allowed_departments,
                    )
                )

        rng.shuffle(placements)
        return placements

    def _create_applications(
        self,
        students,
        placements,
        applications_per_student,
        statuses,
        rng,
    ):
        applications_created = 0

        for student in students:
            eligible_jobs = [
                snapshot
                for snapshot in placements
                if self._matches_placement(student, snapshot)
            ]
            if not eligible_jobs:
                continue

            desired = min(
                len(eligible_jobs),
                max(0, applications_per_student + rng.choice([0, 0, 1])),
            )
            if desired == 0:
                continue

            chosen_jobs = rng.sample(eligible_jobs, k=desired)
            accepted_index = rng.randrange(len(chosen_jobs)) if rng.random() < 0.08 else None

            for index, snapshot in enumerate(chosen_jobs):
                path = self._build_status_path(index, accepted_index, rng)
                application = Application.objects.create(
                    student=student,
                    job=snapshot.placement,
                    status=statuses["applied"],
                    application_profile=self._build_application_profile(student),
                )

                applied_at = timezone.now() - timedelta(
                    days=rng.randint(1, 60),
                    hours=rng.randint(0, 23),
                    minutes=rng.randint(0, 59),
                )
                Application.objects.filter(pk=application.pk).update(
                    application_date=applied_at
                )
                application.status_history.filter(previous_status__isnull=True).update(
                    changed_at=applied_at
                )

                current_time = applied_at
                for status_code, remarks, actor in path[1:]:
                    application.update_status(
                        statuses[status_code],
                        changed_by=actor(student, snapshot.placement),
                        remarks=remarks(snapshot.placement),
                    )
                    current_time += timedelta(
                        days=rng.randint(1, 6),
                        hours=rng.randint(0, 8),
                    )
                    latest_history = application.status_history.first()
                    if latest_history:
                        application.status_history.filter(pk=latest_history.pk).update(
                            changed_at=current_time
                        )

                applications_created += 1

        return applications_created

    def _create_bookmarks(self, students, placements, bookmarks_per_student, rng):
        bookmark_rows = []

        for student in students:
            if bookmarks_per_student <= 0:
                continue

            applied_job_ids = set(
                student.application_set.values_list("job_id", flat=True)
            )
            bookmark_candidates = [
                snapshot.placement
                for snapshot in placements
                if snapshot.placement.id not in applied_job_ids
                and self._matches_placement(student, snapshot)
            ]

            if not bookmark_candidates:
                continue

            desired = min(
                len(bookmark_candidates),
                max(0, bookmarks_per_student + rng.choice([0, 0, 1])),
            )
            for placement in rng.sample(bookmark_candidates, k=desired):
                bookmark_rows.append(Bookmark(student=student, placement=placement))

        created = Bookmark.objects.bulk_create(bookmark_rows, ignore_conflicts=True)
        return len(created)

    def _matches_placement(self, student, snapshot):
        if student.cgpa < snapshot.min_cgpa:
            return False
        if snapshot.max_backlogs is not None and student.active_backlogs > snapshot.max_backlogs:
            return False
        if snapshot.graduation_year is not None and student.graduation_year != snapshot.graduation_year:
            return False
        if snapshot.allowed_departments and student.department not in snapshot.allowed_departments:
            return False
        if snapshot.requires_resume and not student.resume:
            return False
        return True

    def _assign_required_skills(self, placement, placement_skills):
        table_name = "jobs_job_required_skills"
        with connection.cursor() as cursor:
            columns = {
                column.name
                for column in connection.introspection.get_table_description(
                    cursor,
                    table_name,
                )
            }
            placement_column = "job_id" if "job_id" in columns else "placement_id"
            cursor.executemany(
                (
                    f"INSERT INTO {table_name} ({placement_column}, skill_id) "
                    "VALUES (%s, %s)"
                ),
                [(placement.id, skill.id) for skill in placement_skills],
            )

    def _delete_required_skill_rows(self, placement_ids):
        table_name = "jobs_job_required_skills"
        with connection.cursor() as cursor:
            columns = {
                column.name
                for column in connection.introspection.get_table_description(
                    cursor,
                    table_name,
                )
            }
            placement_column = "job_id" if "job_id" in columns else "placement_id"
            placeholders = ", ".join(["%s"] * len(placement_ids))
            cursor.execute(
                f"DELETE FROM {table_name} WHERE {placement_column} IN ({placeholders})",
                placement_ids,
            )

    def _delete_rows_by_ids(self, table_name, ids):
        placeholders = ", ".join(["%s"] * len(ids))
        with connection.cursor() as cursor:
            cursor.execute(
                f"DELETE FROM {table_name} WHERE id IN ({placeholders})",
                ids,
            )

    def _build_student_skill_summary(self, index):
        rotations = [
            "Python, Django, SQL, Git",
            "React, JavaScript, CSS, APIs",
            "Java, DSA, OOP, Problem Solving",
            "Embedded C, Microcontrollers, Debugging",
            "Power BI, SQL, Excel, Communication",
            "Linux, Docker, AWS, Automation",
        ]
        return rotations[index % len(rotations)]

    def _build_application_profile(self, student):
        return {
            "first_name": student.user.first_name or "",
            "last_name": student.user.last_name or "",
            "email": student.user.email or "",
            "phone": student.phone or "",
            "registration_no": student.registration_no,
            "department": student.department,
            "graduation_year": student.graduation_year,
            "cgpa": student.cgpa,
            "active_backlogs": student.active_backlogs,
            "linkedin_url": student.linkedin_url or "",
            "portfolio_url": student.portfolio_url or "",
            "career_objective": student.career_objective or "",
            "skills_summary": student.skills_summary or "",
            "bio": student.bio or "",
            "resume_name": student.resume.name.rsplit("/", 1)[-1] if student.resume else "",
            "resume_url": student.resume.url if student.resume else "",
        }

    def _build_status_path(self, current_index, accepted_index, rng):
        company_actor = lambda student, placement: placement.company.user
        student_actor = lambda student, placement: student.user

        applied_step = (
            "applied",
            lambda placement: "Application submitted through the portal.",
            student_actor,
        )
        shortlisted_step = (
            "shortlisted",
            lambda placement: "Profile shortlisted for the next round.",
            company_actor,
        )
        offered_step = (
            "offered",
            lambda placement: "Offer rolled out after final evaluation.",
            company_actor,
        )
        accepted_step = (
            "offer_accepted",
            lambda placement: "Student accepted the offer.",
            student_actor,
        )
        declined_step = (
            "offer_declined",
            lambda placement: "Student declined the offer after review.",
            student_actor,
        )
        rejected_step = (
            "rejected",
            lambda placement: "Profile closed after recruiter review.",
            company_actor,
        )
        closed_step = (
            "closed_after_offer_acceptance",
            lambda placement: "Application closed because another offer was accepted.",
            student_actor,
        )

        if accepted_index is not None and current_index == accepted_index:
            return [applied_step, shortlisted_step, offered_step, accepted_step]

        if accepted_index is not None and current_index > accepted_index:
            return [applied_step, closed_step]

        roll = rng.random()
        if roll < 0.38:
            return [applied_step]
        if roll < 0.65:
            return [applied_step, shortlisted_step]
        if roll < 0.82:
            return [applied_step, rejected_step]
        if roll < 0.93:
            return [applied_step, shortlisted_step, offered_step]
        return [applied_step, shortlisted_step, offered_step, declined_step]
