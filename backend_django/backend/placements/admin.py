from django.contrib import admin

from .models import EligibleDepartment, EligibilityCriteria, Placement, Skill


class EligibilityCriteriaInline(admin.StackedInline):
    model = EligibilityCriteria
    extra = 0
    can_delete = False


@admin.register(Placement)
class PlacementAdmin(admin.ModelAdmin):
    list_display = (
        "job_title",
        "company",
        "eligibility_cgpa",
        "application_deadline",
        "is_active",
    )
    list_filter = ("is_active", "company")
    search_fields = ("job_title", "company__company_name")
    inlines = [EligibilityCriteriaInline]


class EligibleDepartmentInline(admin.TabularInline):
    model = EligibleDepartment
    extra = 1


@admin.register(EligibilityCriteria)
class EligibilityCriteriaAdmin(admin.ModelAdmin):
    list_display = (
        "placement",
        "min_cgpa",
        "max_backlogs",
        "graduation_year",
        "requires_resume",
    )
    list_filter = ("requires_resume", "graduation_year")
    search_fields = ("placement__job_title",)
    inlines = [EligibleDepartmentInline]


@admin.register(EligibleDepartment)
class EligibleDepartmentAdmin(admin.ModelAdmin):
    list_display = ("department_name", "criteria")
    search_fields = ("department_name", "criteria__placement__job_title")


@admin.register(Skill)
class SkillsAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)
