from django.urls import path, include
from .views import LoginView

urlpatterns = [
    # AUTH
    path("login/", LoginView.as_view(), name="login"),

    # STUDENT APIs
    path("students/", include("students.urls")),
]
