from rest_framework import serializers

from applications.models import Application
from bookmarks.models import Bookmark
from .models import EligibleDepartment, EligibilityCriteria, Placement, Skill


class EligibleDepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EligibleDepartment
        fields = ["department_name"]


class EligibilityCriteriaSerializer(serializers.ModelSerializer):
    allowed_departments = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False,
    )
    department_rules = EligibleDepartmentSerializer(
        source="allowed_departments",
        many=True,
        read_only=True,
    )

    class Meta:
        model = EligibilityCriteria
        fields = [
            "min_cgpa",
            "max_backlogs",
            "graduation_year",
            "requires_resume",
            "notes",
            "allowed_departments",
            "department_rules",
        ]

    def create(self, validated_data):
        departments = validated_data.pop("allowed_departments", [])
        criteria = EligibilityCriteria.objects.create(**validated_data)
        for department in departments:
            EligibleDepartment.objects.create(
                criteria=criteria,
                department_name=department,
            )
        return criteria

    def update(self, instance, validated_data):
        departments = validated_data.pop("allowed_departments", None)
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()

        if departments is not None:
            instance.allowed_departments.all().delete()
            for department in departments:
                EligibleDepartment.objects.create(
                    criteria=instance,
                    department_name=department,
                )

        return instance


class PlacementSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(
        source="company.company_name",
        read_only=True,
    )
    company_location = serializers.CharField(
        source="company.location",
        read_only=True,
    )
    required_skill_names = serializers.SerializerMethodField()
    salary_lpa = serializers.SerializerMethodField()
    eligibility_details = serializers.SerializerMethodField()
    is_eligible = serializers.SerializerMethodField()
    eligibility_issues = serializers.SerializerMethodField()
    company_industry = serializers.CharField(
        source="company.industry",
        read_only=True,
    )
    company_website = serializers.URLField(
        source="company.website",
        read_only=True,
    )
    company_description = serializers.CharField(
        source="company.description",
        read_only=True,
    )
    has_applied = serializers.SerializerMethodField()
    application_status = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()
    resume_required = serializers.SerializerMethodField()

    def get_required_skill_names(self, obj):
        return list(obj.required_skills.values_list("name", flat=True))

    def get_salary_lpa(self, obj):
        salary = obj.salary
        if salary == int(salary):
            return f"{int(salary)} LPA"
        return f"{salary} LPA"

    def get_eligibility_details(self, obj):
        return obj.get_eligibility_details()

    def get_is_eligible(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated or request.user.role != "student":
            return None

        student = getattr(request.user, "student", None)
        if not student:
            return None

        return obj.is_student_eligible(student)[0]

    def get_eligibility_issues(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated or request.user.role != "student":
            return []

        student = getattr(request.user, "student", None)
        if not student:
            return []

        return obj.is_student_eligible(student)[1]

    def get_has_applied(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated or request.user.role != "student":
            return False

        applied_job_ids = self.context.get("applied_job_ids")
        if applied_job_ids is not None:
            return obj.id in applied_job_ids

        student = getattr(request.user, "student", None)
        if not student:
            return False

        return Application.objects.filter(student=student, job=obj).exists()

    def get_application_status(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated or request.user.role != "student":
            return ""

        status_map = self.context.get("application_status_map")
        if status_map is not None:
            return status_map.get(obj.id, "")

        student = getattr(request.user, "student", None)
        if not student:
            return ""

        application = Application.objects.filter(student=student, job=obj).select_related(
            "status"
        ).first()
        return application.status.code if application else ""

    def get_is_bookmarked(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated or request.user.role != "student":
            return False

        bookmarked_job_ids = self.context.get("bookmarked_job_ids")
        if bookmarked_job_ids is not None:
            return obj.id in bookmarked_job_ids

        student = getattr(request.user, "student", None)
        if not student:
            return False

        return Bookmark.objects.filter(student=student, placement=obj).exists()

    def get_resume_required(self, obj):
        return obj.get_eligibility_details().get("requires_resume", False)

    class Meta:
        model = Placement
        fields = [
            "id",
            "company",
            "company_name",
            "company_location",
            "company_industry",
            "company_website",
            "company_description",
            "job_title",
            "job_description",
            "salary",
            "salary_lpa",
            "eligibility_cgpa",
            "application_deadline",
            "is_active",
            "created_at",
            "no_of_positions",
            "no_of_applicants",
            "required_skills",
            "required_skill_names",
            "eligibility_details",
            "is_eligible",
            "eligibility_issues",
            "has_applied",
            "application_status",
            "is_bookmarked",
            "resume_required",
        ]


class PlacementCreateSerializer(serializers.ModelSerializer):
    eligibility_details = EligibilityCriteriaSerializer(write_only=True, required=False)

    class Meta:
        model = Placement
        fields = [
            "company",
            "job_title",
            "job_description",
            "salary",
            "eligibility_cgpa",
            "application_deadline",
            "is_active",
            "no_of_positions",
            "required_skills",
            "eligibility_details",
        ]
        extra_kwargs = {
            "company": {"required": False},
        }

    def create(self, validated_data):
        eligibility_data = validated_data.pop("eligibility_details", None)
        placement = super().create(validated_data)
        if eligibility_data:
            serializer = EligibilityCriteriaSerializer(
                data=eligibility_data,
                context=self.context,
            )
            serializer.is_valid(raise_exception=True)
            serializer.save(placement=placement)
        return placement

    def update(self, instance, validated_data):
        eligibility_data = validated_data.pop("eligibility_details", None)
        placement = super().update(instance, validated_data)

        if eligibility_data is not None:
            criteria = getattr(placement, "eligibility_criteria", None)
            if criteria:
                serializer = EligibilityCriteriaSerializer(
                    criteria,
                    data=eligibility_data,
                    context=self.context,
                )
                serializer.is_valid(raise_exception=True)
                serializer.save()
            else:
                serializer = EligibilityCriteriaSerializer(
                    data=eligibility_data,
                    context=self.context,
                )
                serializer.is_valid(raise_exception=True)
                serializer.save(placement=placement)

        return placement


class SkillsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name"]
