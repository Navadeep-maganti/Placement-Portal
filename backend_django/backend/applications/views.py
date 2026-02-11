from django.shortcuts import render

# Create your views here.
from rest_framework import generics, permissions
from .models import Application
from .serializers import ApplicationSerializer
class MyApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return Application.objects.filter(student__user=user)
        return Application.objects.none()