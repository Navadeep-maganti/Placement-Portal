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
    required_skill_names = serializers.SerializerMethodField()

    def get_required_skill_names(self, obj):
        return list(obj.placement.required_skills.values_list('name', flat=True))

    class Meta:
        model = Bookmark
        fields = [
            'id',
            'student',
            'student_registration_no',
            'placement',
            'job_title',
            'company_name',
            'application_deadline',
            'salary',
            'required_skill_names',
            'created_at'
        ]
        read_only_fields = [
            'id',
            'student',
            'student_registration_no',
            'job_title',
            'company_name',
            'application_deadline',
            'salary',
            'required_skill_names',
            'created_at',
        ]
