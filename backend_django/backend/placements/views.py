from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.response import Response

from activitylog.models import ActivityLog
from activitylog.serializers import ActivityLogSerializer
from applications.models import Application
from api.permissions import IsApprovedCompany, IsCompany
from bookmarks.models import Bookmark
from companies.views import get_or_create_company_for_user
from .models import Placement, Skill
from .serializers import PlacementCreateSerializer, PlacementSerializer, SkillsSerializer


class StudentPlacementContextMixin:
    def get_serializer_context(self):
        context = super().get_serializer_context()
        request = self.request

        if request.user.is_authenticated and request.user.role == "student":
            student = getattr(request.user, "student", None)
            if student:
                applications = Application.objects.filter(student=student).select_related(
                    "status"
                )
                context["applied_job_ids"] = set(
                    applications.values_list("job_id", flat=True)
                )
                context["application_status_map"] = {
                    application.job_id: application.status.code
                    for application in applications
                }
                context["bookmarked_job_ids"] = set(
                    Bookmark.objects.filter(student=student).values_list(
                        "placement_id",
                        flat=True,
                    )
                )

        return context


class AllPlacementsView(StudentPlacementContextMixin, generics.ListAPIView):
    serializer_class = PlacementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Placement.objects.select_related("company").prefetch_related(
            "required_skills",
            "eligibility_criteria__allowed_departments",
        )


class PlacementDetailView(StudentPlacementContextMixin, generics.RetrieveAPIView):
    serializer_class = PlacementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Placement.objects.select_related("company").prefetch_related(
            "required_skills",
            "eligibility_criteria__allowed_departments",
        )


class RecruiterPlacementMixin:
    def get_company(self):
        company = getattr(self.request.user, "company", None)
        if company:
            return company
        return get_or_create_company_for_user(self.request.user)

    def get_queryset(self):
        return (
            Placement.objects.filter(company=self.get_company())
            .select_related("company")
            .prefetch_related(
                "required_skills",
                "eligibility_criteria__allowed_departments",
            )
            .order_by("-created_at", "-id")
        )

    def get_serializer_class(self):
        if self.request.method in permissions.SAFE_METHODS:
            return PlacementSerializer
        return PlacementCreateSerializer


class RecruiterPlacementListCreateView(RecruiterPlacementMixin, generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsCompany, IsApprovedCompany]

    def perform_create(self, serializer):
        company = self.get_company()
        serializer.save(company=company)


class RecruiterPlacementDetailView(
    RecruiterPlacementMixin,
    generics.RetrieveUpdateDestroyAPIView,
):
    permission_classes = [permissions.IsAuthenticated, IsCompany, IsApprovedCompany]

    def perform_update(self, serializer):
        placement = self.get_object()
        company = self.get_company()
        if placement.company_id != company.id:
            raise PermissionDenied("You can only manage your own postings.")
        serializer.save(company=company)


class SkillsListCreateView(generics.ListCreateAPIView):
    serializer_class = SkillsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Skill.objects.order_by("name")

    def create(self, request, *args, **kwargs):
        if request.user.role == "company":
            company = getattr(request.user, "company", None)
            if not company or not company.is_approved:
                return Response(
                    {"detail": "Your recruiter account is pending admin approval."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        name = (request.data.get("name") or "").strip()
        if not name:
            return Response(
                {"name": ["This field may not be blank."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        skill = Skill.objects.filter(name__iexact=name).first()
        created = False
        if not skill:
            skill = Skill.objects.create(name=name)
            created = True

        serializer = self.get_serializer(skill)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class CompanyDashboardSummaryView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, IsCompany]

    def get(self, request):
        company = getattr(request.user, "company", None) or get_or_create_company_for_user(
            request.user
        )

        today = timezone.localdate()
        placements = Placement.objects.filter(company=company)
        applications = Application.objects.filter(job__company=company).select_related(
            "status"
        )
        recent_activity = (
            ActivityLog.objects.filter(placement__company=company)
            .select_related("actor", "placement", "application")
            .distinct()[:5]
        )

        return Response(
            {
                "overview": {
                    "active_job_posts": placements.filter(
                        is_active=True,
                        application_deadline__gte=today,
                    ).count(),
                    "total_applicants": applications.count(),
                    "shortlisted_students": applications.filter(
                        status__code="shortlisted"
                    ).count(),
                    "offers_extended": applications.filter(
                        status__code__in=[
                            "offered",
                            "offer_accepted",
                            "offer_declined",
                        ]
                    ).count(),
                },
                "recent_activity": ActivityLogSerializer(
                    recent_activity,
                    many=True,
                ).data,
            }
        )
