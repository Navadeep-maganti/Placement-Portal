from django.urls import path

from .views import (
    CompanyProfileView,
    RecruiterRegistrationView,
    request_recruiter_registration_otp,
    verify_recruiter_registration_otp,
)

urlpatterns = [
    path("register/", RecruiterRegistrationView.as_view(), name="company_register"),
    path(
        "register/request-otp/",
        request_recruiter_registration_otp,
        name="company_register_request_otp",
    ),
    path(
        "register/verify-otp/",
        verify_recruiter_registration_otp,
        name="company_register_verify_otp",
    ),
    path("me/", CompanyProfileView.as_view(), name="company_profile"),
]
