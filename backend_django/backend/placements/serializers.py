from rest_framework import serializers
from .models import Placement, Skill

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
            'created_at',
            'no_of_positions',
            'no_of_applicants',
            'required_skills',
        ]

class PlacementCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Placement
        fields = [
            'company',
            'job_title',
            'job_description',
            'eligibility_cgpa',
            'application_deadline',
            'is_active',
            'no_of_positions',
            'required_skills',
        ]
class SkillsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']