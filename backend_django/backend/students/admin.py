from django.contrib import admin
from .models import Student

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = (
        'registration_no',
        'get_name',
        'department',
        'graduation_year',
        'cgpa'
    )
    search_fields = ('registration_no', 'user__email', 'user__first_name')
    list_filter = ('department', 'graduation_year')

    def get_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    get_name.short_description = "Student Name"
