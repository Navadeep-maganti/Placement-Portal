from django.urls import path, include
from .views import LoginView, auth_me, logout_view
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # AUTH - JWT
    path("token/", LoginView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", auth_me, name="auth_me"),
    path("logout/", logout_view, name="logout"),

    # STUDENT APIs
    path("students/", include("students.urls")),
]
