from django.contrib import admin
from .models import Application, ApplicationStatus


@admin.register(ApplicationStatus)
class ApplicationStatusAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'is_active', 'sort_order')
    list_filter = ('is_active',)
    search_fields = ('code', 'name')

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
