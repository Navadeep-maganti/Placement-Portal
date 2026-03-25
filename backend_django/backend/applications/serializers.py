from rest_framework import serializers

from .models import Application, ApplicationStatus, ApplicationStatusHistory


class ApplicationStatusHistorySerializer(serializers.ModelSerializer):
    previous_status = serializers.CharField(
        source="previous_status.code",
        read_only=True,
        allow_null=True,
    )
    previous_status_name = serializers.CharField(
        source="previous_status.name",
        read_only=True,
        allow_null=True,
    )
    new_status = serializers.CharField(source="new_status.code", read_only=True)
    new_status_name = serializers.CharField(source="new_status.name", read_only=True)
    changed_by_email = serializers.CharField(
        source="changed_by.email",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = ApplicationStatusHistory
        fields = [
            "id",
            "previous_status",
            "previous_status_name",
            "new_status",
            "new_status_name",
            "changed_by",
            "changed_by_email",
            "remarks",
            "changed_at",
        ]


class ApplicationSerializer(serializers.ModelSerializer):
    student_registration_no = serializers.CharField(
        source="student.registration_no",
        read_only=True,
    )
    job_title = serializers.CharField(
        source="job.job_title",
        read_only=True,
    )
    company_name = serializers.CharField(
        source="job.company.company_name",
        read_only=True,
    )
    company_location = serializers.CharField(
        source="job.company.location",
        read_only=True,
    )
    salary_lpa = serializers.SerializerMethodField()
    application_deadline = serializers.DateField(
        source="job.application_deadline",
        read_only=True,
    )
    status = serializers.CharField(source="status.code", read_only=True)
    status_name = serializers.CharField(source="status.name", read_only=True)
    application_profile = serializers.JSONField(read_only=True)
    status_id = serializers.PrimaryKeyRelatedField(
        source="status",
        queryset=ApplicationStatus.objects.filter(is_active=True),
        write_only=True,
        required=False,
    )
    status_history = ApplicationStatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Application
        fields = [
            "id",
            "student",
            "student_registration_no",
            "job",
            "job_title",
            "company_name",
            "company_location",
            "salary_lpa",
            "application_deadline",
            "application_profile",
            "status",
            "status_name",
            "status_id",
            "application_date",
            "status_history",
        ]
        read_only_fields = ["id", "application_date", "status", "status_name"]

    def get_salary_lpa(self, obj):
        salary = obj.job.salary
        if salary == int(salary):
            return f"{int(salary)} LPA"
        return f"{salary} LPA"


class CompanyApplicationSerializer(ApplicationSerializer):
    applicant_name = serializers.SerializerMethodField()
    applicant_email = serializers.SerializerMethodField()
    applicant_phone = serializers.SerializerMethodField()
    applicant_department = serializers.SerializerMethodField()
    applicant_graduation_year = serializers.SerializerMethodField()
    applicant_cgpa = serializers.SerializerMethodField()
    applicant_backlogs = serializers.SerializerMethodField()
    applicant_resume_url = serializers.SerializerMethodField()
    applicant_resume_name = serializers.SerializerMethodField()
    applicant_skills_summary = serializers.SerializerMethodField()
    applicant_career_objective = serializers.SerializerMethodField()
    applicant_bio = serializers.SerializerMethodField()

    class Meta(ApplicationSerializer.Meta):
        fields = ApplicationSerializer.Meta.fields + [
            "applicant_name",
            "applicant_email",
            "applicant_phone",
            "applicant_department",
            "applicant_graduation_year",
            "applicant_cgpa",
            "applicant_backlogs",
            "applicant_resume_url",
            "applicant_resume_name",
            "applicant_skills_summary",
            "applicant_career_objective",
            "applicant_bio",
        ]

    def _get_profile_value(self, obj, key, fallback=None):
        profile = obj.application_profile or {}
        value = profile.get(key)
        if value not in (None, ""):
            return value
        return fallback

    def get_applicant_name(self, obj):
        return (
            self._get_profile_value(obj, "first_name", obj.student.user.first_name)
            + " "
            + self._get_profile_value(obj, "last_name", obj.student.user.last_name)
        ).strip()

    def get_applicant_email(self, obj):
        return self._get_profile_value(obj, "email", obj.student.user.email)

    def get_applicant_phone(self, obj):
        return self._get_profile_value(obj, "phone", obj.student.phone)

    def get_applicant_department(self, obj):
        return self._get_profile_value(obj, "department", obj.student.department)

    def get_applicant_graduation_year(self, obj):
        return self._get_profile_value(
            obj,
            "graduation_year",
            obj.student.graduation_year,
        )

    def get_applicant_cgpa(self, obj):
        return self._get_profile_value(obj, "cgpa", obj.student.cgpa)

    def get_applicant_backlogs(self, obj):
        return self._get_profile_value(
            obj,
            "active_backlogs",
            obj.student.active_backlogs,
        )

    def get_applicant_resume_url(self, obj):
        return self._get_profile_value(
            obj,
            "resume_url",
            obj.student.resume.url if obj.student.resume else "",
        )

    def get_applicant_resume_name(self, obj):
        return self._get_profile_value(
            obj,
            "resume_name",
            obj.student.resume.name.rsplit("/", 1)[-1] if obj.student.resume else "",
        )

    def get_applicant_skills_summary(self, obj):
        return self._get_profile_value(
            obj,
            "skills_summary",
            obj.student.skills_summary,
        )

    def get_applicant_career_objective(self, obj):
        return self._get_profile_value(
            obj,
            "career_objective",
            obj.student.career_objective,
        )

    def get_applicant_bio(self, obj):
        return self._get_profile_value(obj, "bio", obj.student.bio)


class ApplicationStatusUpdateSerializer(serializers.Serializer):
    status_id = serializers.PrimaryKeyRelatedField(
        queryset=ApplicationStatus.objects.filter(is_active=True)
    )
    remarks = serializers.CharField(required=False, allow_blank=True)


class ApplicationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationStatus
        fields = ["id", "code", "name", "sort_order"]


class OfferDecisionSerializer(serializers.Serializer):
    decision = serializers.ChoiceField(choices=["accept", "decline"])
    remarks = serializers.CharField(required=False, allow_blank=True)


class ApplyToJobSerializer(serializers.Serializer):
    placement_id = serializers.IntegerField(required=False)
    job = serializers.IntegerField(required=False)
    application_profile = serializers.DictField(required=False)

    def validate(self, attrs):
        placement_id = attrs.get("placement_id") or attrs.get("job")
        if not placement_id:
            raise serializers.ValidationError({"placement_id": "placement_id is required."})
        attrs["placement_id"] = placement_id
        attrs.setdefault("application_profile", {})
        return attrs
