from django.urls import path

from .views import CompanyProfileView

urlpatterns = [
    path("me/", CompanyProfileView.as_view(), name="company_profile"),
]
