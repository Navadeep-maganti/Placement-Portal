from django.urls import path

from .views import CompanyProfileView, RecruiterRegistrationView

urlpatterns = [
    path("register/", RecruiterRegistrationView.as_view(), name="company_register"),
    path("me/", CompanyProfileView.as_view(), name="company_profile"),
]
