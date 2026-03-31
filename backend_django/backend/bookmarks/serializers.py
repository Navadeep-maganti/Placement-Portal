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
    salary_lpa = serializers.SerializerMethodField()
    location = serializers.CharField(
        source='placement.company.location',
        read_only=True,
    )
    has_applied = serializers.SerializerMethodField()
    application_status = serializers.SerializerMethodField()
    required_skill_names = serializers.SerializerMethodField()
    is_eligible = serializers.SerializerMethodField()
    eligibility_issues = serializers.SerializerMethodField()
    resume_required = serializers.SerializerMethodField()

    def _get_student(self, obj):
        request = self.context.get('request')
        if (
            request
            and request.user.is_authenticated
            and getattr(request.user, 'role', None) == 'student'
        ):
            return getattr(request.user, 'student', None)
        return obj.student

    def get_salary_lpa(self, obj):
        salary = obj.placement.salary
        if salary == int(salary):
            return f'{int(salary)} LPA'
        return f'{salary} LPA'

    def get_required_skill_names(self, obj):
        return list(obj.placement.required_skills.values_list('name', flat=True))

    def get_has_applied(self, obj):
        student = self._get_student(obj)
        if not student:
            return False
        return student.application_set.filter(job=obj.placement).exists()

    def get_application_status(self, obj):
        student = self._get_student(obj)
        if not student:
            return ''
        application = student.application_set.select_related('status').filter(
            job=obj.placement
        ).first()
        return application.status.code if application else ''

    def get_is_eligible(self, obj):
        student = self._get_student(obj)
        if not student:
            return None
        return obj.placement.is_student_eligible(student)[0]

    def get_eligibility_issues(self, obj):
        student = self._get_student(obj)
        if not student:
            return []
        return obj.placement.is_student_eligible(student)[1]

    def get_resume_required(self, obj):
        return obj.placement.get_eligibility_details().get('requires_resume', False)

    class Meta:
        model = Bookmark
        fields = [
            'id',
            'student',
            'student_registration_no',
            'placement',
            'job_title',
            'company_name',
            'location',
            'application_deadline',
            'salary',
            'salary_lpa',
            'has_applied',
            'application_status',
            'required_skill_names',
            'is_eligible',
            'eligibility_issues',
            'resume_required',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'student',
            'student_registration_no',
            'job_title',
            'company_name',
            'location',
            'application_deadline',
            'salary',
            'salary_lpa',
            'has_applied',
            'application_status',
            'required_skill_names',
            'is_eligible',
            'eligibility_issues',
            'resume_required',
            'created_at',
        ]
