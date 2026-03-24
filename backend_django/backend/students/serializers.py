from rest_framework import serializers
from .models import Student
from api.serializers import UserSerializer

class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    email = serializers.EmailField(source='user.email', required=False)
    resume_name = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            'id',
            'user',
            'first_name',
            'last_name',
            'email',
            'registration_no',
            'department',
            'graduation_year',
            'cgpa',
            'active_backlogs',
            'phone',
            'linkedin_url',
            'portfolio_url',
            'career_objective',
            'skills_summary',
            'bio',
            'resume',
            'resume_name',
        ]

    def get_resume_name(self, obj):
        if not obj.resume:
            return ''
        return obj.resume.name.rsplit('/', 1)[-1]

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user

        for field, value in user_data.items():
            setattr(user, field, value)
        if user_data:
            user.save(update_fields=list(user_data.keys()))

        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        return instance
