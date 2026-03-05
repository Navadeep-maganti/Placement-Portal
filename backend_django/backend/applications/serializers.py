from rest_framework import serializers
from .models import Application, ApplicationStatus

class ApplicationSerializer(serializers.ModelSerializer):
    student_registration_no = serializers.CharField(
        source='student.registration_no',
        read_only=True
    )
    job_title = serializers.CharField(
        source='job.job_title',
        read_only=True
    )
    status = serializers.CharField(source='status.code', read_only=True)
    status_name = serializers.CharField(source='status.name', read_only=True)
    status_id = serializers.PrimaryKeyRelatedField(
        source='status',
        queryset=ApplicationStatus.objects.filter(is_active=True),
        write_only=True,
        required=False,
    )

    class Meta:
        model = Application
        fields = [
            'id',
            'student',
            'student_registration_no',
            'job',
            'job_title',
            'status',
            'status_name',
            'status_id',
            'application_date'
        ]
        read_only_fields = ['id', 'application_date', 'status', 'status_name']
