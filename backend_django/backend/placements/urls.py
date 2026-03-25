from django.contrib import admin
from django.urls import path, include

from .views import (
    AllPlacementsView,
    CompanyDashboardSummaryView,
    PlacementDetailView,
    RecruiterPlacementDetailView,
    RecruiterPlacementListCreateView,
)
urlpatterns = [
    path("allplacements/", AllPlacementsView.as_view(), name="all_placements"),
    path(
        "company-dashboard/",
        CompanyDashboardSummaryView.as_view(),
        name="company_dashboard_summary",
    ),
    path("my-postings/", RecruiterPlacementListCreateView.as_view(), name="my_postings"),
    path(
        "my-postings/<int:pk>/",
        RecruiterPlacementDetailView.as_view(),
        name="my_posting_detail",
    ),
    path("<int:pk>/", PlacementDetailView.as_view(), name="placement_detail"),
]
