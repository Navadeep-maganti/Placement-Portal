from rest_framework import generics, permissions

from applications.models import Application
from bookmarks.models import Bookmark
from .models import Placement
from .serializers import PlacementSerializer


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
