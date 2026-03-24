from django.urls import path

from .views import MyActivityLogView


urlpatterns = [
    path("my/", MyActivityLogView.as_view(), name="my_activity_logs"),
]
