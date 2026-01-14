from django.urls import path
from .views import student_me, student_detail

urlpatterns = [
    # 🔐 token-based endpoint (MUST be first)
    path("me/", student_me),
]
