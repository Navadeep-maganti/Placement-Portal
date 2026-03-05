from django.urls import path, include
from .views import LoginView, auth_me
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("token/", LoginView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", auth_me, name="auth_me"),
    path("placements/", include("placements.urls")),
    path("students/", include("students.urls")),
    path("bookmarks/", include("bookmarks.urls")),
]
