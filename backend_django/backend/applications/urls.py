from django.contrib import admin
from django.urls import path, include

from .views import MyApplicationsView
urlpatterns = [
    path("myapplications/",MyApplicationsView.as_view(), name="my_applications"),
]