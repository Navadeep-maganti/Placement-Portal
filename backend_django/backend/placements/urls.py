from django.contrib import admin
from django.urls import path, include

from .views import AllPlacementsView, PlacementDetailView
urlpatterns = [
    path("allplacements/", AllPlacementsView.as_view(), name="all_placements"),
    path("<int:pk>/", PlacementDetailView.as_view(), name="placement_detail"),
]
