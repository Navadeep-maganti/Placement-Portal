from django.contrib import admin
from .models import Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):

    list_display = (
        "get_first_name",
        "get_last_name",
        "get_email",
        "registration_no",
        "department",
        "graduation_year",
        "cgpa",
    )

    search_fields = (
        "user__first_name",
        "user__last_name",
        "user__email",
        "registration_no",
    )

    list_filter = ("department", "graduation_year")

    # ---- helper methods for User fields ----

    def get_first_name(self, obj):
        return obj.user.first_name
    get_first_name.short_description = "First Name"

    def get_last_name(self, obj):
        return obj.user.last_name
    get_last_name.short_description = "Last Name"

    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = "Email"
