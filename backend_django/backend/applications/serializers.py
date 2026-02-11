from rest_framework import serializers
from .models import Application

class ApplicationSerializer(serializers.ModelSerializer):
    student_registration_no = serializers.CharField(
        source='student.registration_no',
        read_only=True
    )
    job_title = serializers.CharField(
        source='job.job_title',
        read_only=True
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
            'application_date'
        ]
