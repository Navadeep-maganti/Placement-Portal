from .models import Bookmark
from rest_framework import serializers


class BookmarkSerializer(serializers.ModelSerializer):
    student_registration_no = serializers.CharField(
        source='student.registration_no',
        read_only=True
    )
    job_title = serializers.CharField(
        source='placement.job_title',
        read_only=True
    )
    company_name = serializers.CharField(
        source='placement.company.company_name',
        read_only=True,
    )
    application_deadline = serializers.DateField(
        source='placement.application_deadline',
        read_only=True,
    )
    salary = serializers.DecimalField(
        source='placement.salary',
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )
    location = serializers.CharField(
        source='placement.company.location',
        read_only=True,
    )
    has_applied = serializers.SerializerMethodField()
    application_status = serializers.SerializerMethodField()
    required_skill_names = serializers.SerializerMethodField()

    def get_required_skill_names(self, obj):
        return list(obj.placement.required_skills.values_list('name', flat=True))

    def get_has_applied(self, obj):
        return obj.student.application_set.filter(job=obj.placement).exists()

    def get_application_status(self, obj):
        application = obj.student.application_set.select_related('status').filter(
            job=obj.placement
        ).first()
        return application.status.code if application else ''

    class Meta:
        model = Bookmark
        fields = [
            'id',
            'student',
            'student_registration_no',
            'placement',
            'job_title',
            'company_name',
            'location',
            'application_deadline',
            'salary',
            'has_applied',
            'application_status',
            'required_skill_names',
            'created_at'
        ]
        read_only_fields = [
            'id',
            'student',
            'student_registration_no',
            'job_title',
            'company_name',
            'location',
            'application_deadline',
            'salary',
            'has_applied',
            'application_status',
            'required_skill_names',
            'created_at',
        ]
