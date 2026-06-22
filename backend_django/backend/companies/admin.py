from django.contrib import admin
from .models import Company

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'industry', 'location', 'is_approved')
    list_filter = ('is_approved', 'industry')
    search_fields = ('company_name', 'user__email')
    actions = ['approve_companies']

    def approve_companies(self, request, queryset):
        queryset.update(is_approved=True)
    approve_companies.short_description = "Approve selected companies"
