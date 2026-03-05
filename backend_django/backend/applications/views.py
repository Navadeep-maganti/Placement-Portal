from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from api.permissions import IsStudent
from .models import Application
from .serializers import ApplicationSerializer
from placements.models import Placement
from students.models import Student


class MyApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "student":
            return Application.objects.filter(student__user=user).select_related(
                "student", "job", "status"
            )
        return Application.objects.none()


class ApplyToJobView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    serializer_class = ApplicationSerializer

    def post(self, request):
        placement_id = request.data.get("placement_id") or request.data.get("job")
        if not placement_id:
            return Response(
                {"error": "placement_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        student = get_object_or_404(Student, user=request.user)
        placement = get_object_or_404(Placement, id=placement_id)

        application, created = Application.objects.get_or_create(
            student=student,
            job=placement,
        )

        serializer = self.get_serializer(application)
        if created:
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(
            {"message": "Already applied to this job.", "application": serializer.data},
            status=status.HTTP_200_OK,
        )
