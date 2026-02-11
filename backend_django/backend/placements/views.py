from django.shortcuts import render
from rest_framework import generics, permissions

from .models import Placement
from .serializers import PlacementSerializer

# Create your views here.
class AllPlacementsView(generics.ListAPIView):
    serializer_class = PlacementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Placement.objects.all()