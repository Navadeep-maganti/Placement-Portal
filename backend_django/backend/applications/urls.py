from django.urls import path

from .views import (
    ApplyToJobView,
    CompanyApplicantsView,
    OfferDecisionView,
    ApplicationStatusListView,
    ApplicationStatusHistoryView,
    MyApplicationsView,
    UpdateApplicationStatusView,
)

urlpatterns = [
    path("myapplications/", MyApplicationsView.as_view(), name="my_applications"),
    path("company-applicants/", CompanyApplicantsView.as_view(), name="company_applicants"),
    path("statuses/", ApplicationStatusListView.as_view(), name="application_statuses"),
    path("apply/", ApplyToJobView.as_view(), name="apply_to_job"),
    path(
        "<int:application_id>/offer-decision/",
        OfferDecisionView.as_view(),
        name="offer_decision",
    ),
    path(
        "<int:application_id>/history/",
        ApplicationStatusHistoryView.as_view(),
        name="application_history",
    ),
    path(
        "<int:application_id>/status/",
        UpdateApplicationStatusView.as_view(),
        name="update_application_status",
    ),
]
