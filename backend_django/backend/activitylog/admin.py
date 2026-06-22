from django.contrib import admin

from .models import ActivityLog


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = (
        "action_type",
        "description",
        "actor",
        "placement",
        "application",
        "created_at",
    )
    list_filter = ("action_type", "created_at")
    search_fields = (
        "description",
        "actor__email",
        "placement__job_title",
        "application__student__registration_no",
    )
