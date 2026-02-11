from django.contrib import admin
from .models import Application

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = (
        'student',
        'job',
        'status',
        'application_date'
    )
    list_filter = ('status',)
    search_fields = (
        'student__registration_no',
        'job__job_title'
    )
