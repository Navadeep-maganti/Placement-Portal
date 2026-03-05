from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
    path("api/applications/", include("applications.urls")),
    path("companies/", include("companies.urls")),
    path("students/", include("students.urls")),
    path("applications/", include("applications.urls")),
]
