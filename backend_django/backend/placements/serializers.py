from rest_framework import serializers
from .models import Placement

class PlacementSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(
        source='company.company_name',
        read_only=True
    )

    class Meta:
        model = Placement
        fields = [
            'id',
            'company',
            'company_name',
            'job_title',
            'job_description',
            'eligibility_cgpa',
            'application_deadline',
            'is_active',
            'created_at'
        ]
