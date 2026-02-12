from django.contrib import admin
from .models import Placement,Skill

@admin.register(Placement)
class PlacementAdmin(admin.ModelAdmin):
    list_display = (
        'job_title',
        'company',
        'eligibility_cgpa',
        'application_deadline',
        'is_active'
    )
    list_filter = ('is_active', 'company')
    search_fields = ('job_title', 'company__company_name')
@admin.register(Skill)
class SkillsAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)
    
    