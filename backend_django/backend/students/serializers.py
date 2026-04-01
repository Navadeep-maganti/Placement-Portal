from rest_framework import serializers

from .models import Student
from api.serializers import UserSerializer


def _normalize_skill_names(skill_names):
    normalized_names = []
    seen = set()

    for skill_name in skill_names or []:
        cleaned = (skill_name or "").strip()
        if not cleaned:
            continue
        key = cleaned.lower()
        if key in seen:
            continue
        seen.add(key)
        normalized_names.append(cleaned)

    return normalized_names

class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    email = serializers.EmailField(source='user.email', required=False)
    resume_name = serializers.SerializerMethodField()
    skill_names = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        write_only=True,
    )

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
            'skill_names',
            'skills_summary',
            'bio',
            'resume',
            'resume_name',
        ]

    def get_resume_name(self, obj):
        if not obj.resume:
            return ''
        return obj.resume.name.rsplit('/', 1)[-1]

    def get_skill_names(self, obj):
        related_skill_names = list(obj.skills.order_by("name").values_list("name", flat=True))
        if related_skill_names:
            return related_skill_names

        parsed_summary = []
        seen = set()
        for value in (obj.skills_summary or "").replace("\n", ",").split(","):
            cleaned = value.strip()
            if not cleaned:
                continue
            key = cleaned.lower()
            if key in seen:
                continue
            seen.add(key)
            parsed_summary.append(cleaned)
        return parsed_summary

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["skill_names"] = self.get_skill_names(instance)
        return data

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        skill_names = validated_data.pop("skill_names", None)
        user = instance.user

        for field, value in user_data.items():
            setattr(user, field, value)
        if user_data:
            user.save(update_fields=list(user_data.keys()))

        for field, value in validated_data.items():
            setattr(instance, field, value)

        if skill_names is not None:
            from placements.models import Skill

            normalized_skill_names = _normalize_skill_names(skill_names)
            skill_objects = []
            for skill_name in normalized_skill_names:
                skill, _ = Skill.objects.get_or_create(name=skill_name)
                skill_objects.append(skill)

            instance.skills_summary = ", ".join(normalized_skill_names)

        instance.save()

        if skill_names is not None:
            instance.skills.set(skill_objects)

        return instance
