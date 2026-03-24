from django.db.models import Q
from rest_framework import generics, permissions

from .models import ActivityLog
from .serializers import ActivityLogSerializer


class MyActivityLogView(generics.ListAPIView):
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = ActivityLog.objects.select_related(
            "actor",
            "placement",
            "application",
        )

        if user.role == "admin":
            return queryset
        if user.role == "company":
            return queryset.filter(
                Q(actor=user) | Q(placement__company__user=user)
            ).distinct()
        if user.role == "student":
            return queryset.filter(
                Q(actor=user) | Q(application__student__user=user)
            ).distinct()
        return queryset.none()
