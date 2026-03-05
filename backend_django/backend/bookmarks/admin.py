from django.contrib import admin
from .models import Bookmark
# Register your models here.
@admin.register(Bookmark)
class BookmarkAdmin(admin.ModelAdmin):
    list_display = ('student', 'placement', 'created_at')
    search_fields = ('student__user__username', 'placement__job_title')
    list_filter = ('created_at',)
    
    