from django.urls import path
from .views import (
    request_student_registration_otp,
    student_me,
    verify_student_registration_otp,
)

urlpatterns = [
    path("register/request-otp/", request_student_registration_otp),
    path("register/verify-otp/", verify_student_registration_otp),
    # 🔐 token-based endpoint (MUST be first)
    path("me/", student_me),
]
