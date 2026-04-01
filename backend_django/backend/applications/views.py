from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from api.permissions import IsApprovedCompany, IsCompany, IsStudent
from placements.models import Placement
from students.models import Student

from .models import Application, ApplicationStatus
from .serializers import (
    ApplyToJobSerializer,
    ApplicationSerializer,
    CompanyApplicationSerializer,
    OfferDecisionSerializer,
    ApplicationStatusSerializer,
    ApplicationStatusHistorySerializer,
    ApplicationStatusUpdateSerializer,
)


PROFILE_FIELDS = [
    "first_name",
    "last_name",
    "email",
    "phone",
    "registration_no",
    "department",
    "graduation_year",
    "cgpa",
    "active_backlogs",
    "linkedin_url",
    "portfolio_url",
    "career_objective",
    "skills_summary",
    "bio",
]


def build_application_profile(student, overrides=None):
    overrides = overrides or {}
    profile = {
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

    for field in PROFILE_FIELDS:
        if field in overrides:
            profile[field] = overrides[field]

    return profile


def get_or_create_status(code, name, sort_order):
    status_obj, _ = ApplicationStatus.objects.get_or_create(
        code=code,
        defaults={"name": name, "is_active": True, "sort_order": sort_order},
    )
    return status_obj


class MyApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "student":
            return Application.objects.filter(student__user=user).select_related(
                "student",
                "job",
                "job__company",
                "status",
            ).prefetch_related(
                "status_history__previous_status",
                "status_history__new_status",
                "status_history__changed_by",
            )
        return Application.objects.none()


class CompanyApplicantsView(generics.ListAPIView):
    serializer_class = CompanyApplicationSerializer
    permission_classes = [permissions.IsAuthenticated, IsCompany, IsApprovedCompany]

    def get_queryset(self):
        return Application.objects.filter(job__company__user=self.request.user).select_related(
            "student",
            "student__user",
            "job",
            "job__company",
            "status",
        ).prefetch_related(
            "status_history__previous_status",
            "status_history__new_status",
            "status_history__changed_by",
        ).order_by("-application_date", "-id")


class ApplicationStatusListView(generics.ListAPIView):
    serializer_class = ApplicationStatusSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role not in {"company", "admin"}:
            return ApplicationStatus.objects.none()
        queryset = ApplicationStatus.objects.filter(is_active=True)
        if user.role == "company":
            company = getattr(user, "company", None)
            if not company or not company.is_approved:
                return ApplicationStatus.objects.none()
            queryset = queryset.filter(
                code__in={
                    "shortlisted",
                    "offered",
                    "rejected",
                }
            )
        return queryset.order_by(
            "sort_order",
            "name",
        )


class ApplyToJobView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    serializer_class = ApplyToJobSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        placement_id = serializer.validated_data["placement_id"]
        profile_overrides = serializer.validated_data.get("application_profile", {})

        student = get_object_or_404(Student, user=request.user)
        placement = get_object_or_404(Placement, id=placement_id)

        if not placement.is_active:
            return Response(
                {"error": "This job is no longer active."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        eligible, reasons = placement.is_student_eligible(student)
        if not eligible:
            return Response(
                {
                    "error": "You are not eligible for this job.",
                    "eligibility_issues": reasons,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        application = Application.objects.filter(student=student, job=placement).first()
        if application:
            serializer = ApplicationSerializer(application)
            return Response(
                {"message": "Already applied to this job.", "application": serializer.data},
                status=status.HTTP_200_OK,
            )

        application = Application(
            student=student,
            job=placement,
            application_profile=build_application_profile(student, profile_overrides),
        )
        application._status_changed_by = request.user
        application.save()

        response_serializer = ApplicationSerializer(application)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class ApplicationStatusHistoryView(generics.ListAPIView):
    serializer_class = ApplicationStatusHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        application = get_object_or_404(
            Application.objects.select_related("job__company", "student__user"),
            pk=self.kwargs["application_id"],
        )
        user = self.request.user

        if user.role == "student" and application.student.user_id != user.id:
            return application.status_history.none()
        if user.role == "company" and application.job.company.user_id != user.id:
            return application.status_history.none()

        return application.status_history.select_related(
            "previous_status",
            "new_status",
            "changed_by",
        )


class UpdateApplicationStatusView(generics.GenericAPIView):
    serializer_class = ApplicationStatusUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, application_id):
        application = get_object_or_404(
            Application.objects.select_related("job__company", "student", "status"),
            pk=application_id,
        )

        user = request.user
        if user.role == "company":
            company = getattr(user, "company", None)
            if not company or not company.is_approved:
                return Response(
                    {"detail": "Your recruiter account is pending admin approval."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        if user.role == "company" and application.job.company.user_id != user.id:
            return Response(
                {"error": "You can only update applications for your own jobs."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if user.role not in {"company", "admin"}:
            return Response(
                {"error": "Only recruiters or admins can update application status."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data["status_id"]
        if user.role == "company" and new_status.code in {
            "offer_accepted",
            "offer_declined",
            "closed_after_offer_acceptance",
        }:
            return Response(
                {
                    "error": (
                        "Recruiters cannot directly set accepted, declined, or "
                        "auto-closed offer states."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        accepted_elsewhere = Application.objects.filter(
            student=application.student,
            status__code="offer_accepted",
        ).exclude(pk=application.pk).first()
        if accepted_elsewhere and new_status.code not in {
            "rejected",
            "closed_after_offer_acceptance",
        }:
            return Response(
                {
                    "error": (
                        "This student has already accepted an offer and should no longer "
                        "be considered for active hiring stages."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if new_status.code == "offered":
            existing_offer = Application.objects.filter(
                student=application.student,
                status__code__in={"offered", "offer_accepted"},
            ).exclude(pk=application.pk).first()
            if existing_offer:
                return Response(
                    {
                        "error": (
                            "This student already has an active offer or an accepted offer."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        application.update_status(
            new_status,
            changed_by=user,
            remarks=serializer.validated_data.get("remarks", ""),
        )

        return Response(ApplicationSerializer(application).data, status=status.HTTP_200_OK)


class OfferDecisionView(generics.GenericAPIView):
    serializer_class = OfferDecisionSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def post(self, request, application_id):
        application = get_object_or_404(
            Application.objects.select_related("student__user", "job", "status"),
            pk=application_id,
            student__user=request.user,
        )

        if application.status.code != "offered":
            return Response(
                {"error": "Only offered applications can be managed by students."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        decision = serializer.validated_data["decision"]
        remarks = serializer.validated_data.get("remarks", "")

        if decision == "accept":
            accepted_elsewhere = Application.objects.filter(
                student=application.student,
                status__code="offer_accepted",
            ).exclude(pk=application.pk).first()
            if accepted_elsewhere:
                return Response(
                    {"error": "You have already accepted another offer."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        target_status = get_or_create_status(
            "offer_accepted" if decision == "accept" else "offer_declined",
            "Offer Accepted" if decision == "accept" else "Offer Declined",
            4 if decision == "accept" else 5,
        )

        application.update_status(
            target_status,
            changed_by=request.user,
            remarks=remarks or (
                "Student accepted the offer."
                if decision == "accept"
                else "Student declined the offer."
            ),
        )

        if decision == "accept":
            closed_status = get_or_create_status(
                "closed_after_offer_acceptance",
                "Closed After Offer Acceptance",
                6,
            )
            other_applications = Application.objects.select_related("status", "job__company").filter(
                student=application.student
            ).exclude(pk=application.pk)
            for other_application in other_applications:
                if other_application.status.code in Application.get_terminal_status_codes():
                    continue
                other_application.update_status(
                    closed_status,
                    changed_by=request.user,
                    remarks=(
                        f"Closed automatically because the student accepted an offer from "
                        f"{application.job.company.company_name}."
                    ),
                )

        application.refresh_from_db()
        return Response(ApplicationSerializer(application).data, status=status.HTTP_200_OK)
