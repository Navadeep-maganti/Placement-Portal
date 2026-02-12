from django.contrib import admin
from django.urls import path, include

from .views import AllPlacementsView
urlpatterns = [
    path("allplacements/", AllPlacementsView.as_view(), name="all_placements"),
]
