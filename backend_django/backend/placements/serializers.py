from rest_framework import serializers
from .models import Placement, Skill

class PlacementSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(
        source='company.company_name',
        read_only=True
    )
    company_location = serializers.CharField(
        source='company.location',
        read_only=True,
    )
    required_skill_names = serializers.SerializerMethodField()
    salary_lpa = serializers.SerializerMethodField()

    def get_required_skill_names(self, obj):
        return list(obj.required_skills.values_list('name', flat=True))

    def get_salary_lpa(self, obj):
        salary = obj.salary
        if salary == int(salary):
            return f"{int(salary)} LPA"
        return f"{salary} LPA"

    class Meta:
        model = Placement
        fields = [
            'id',
            'company',
            'company_name',
            'company_location',
            'job_title',
            'job_description',
            'salary',
            'salary_lpa',
            'eligibility_cgpa',
            'application_deadline',
            'is_active',
            'created_at',
            'no_of_positions',
            'no_of_applicants',
            'required_skills',
            'required_skill_names',
        ]

class PlacementCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Placement
        fields = [
            'company',
            'job_title',
            'job_description',
            'salary',
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
