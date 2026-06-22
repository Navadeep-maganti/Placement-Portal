from datetime import timedelta

from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from api.models import User
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


def _normalize_student_email(value):
    email = (value or "").strip().lower()
    if not email.endswith(settings.STUDENT_EMAIL_DOMAIN):
        raise serializers.ValidationError(
            f"Use your {settings.STUDENT_EMAIL_DOMAIN} email address."
        )
    return email

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


class StudentRegistrationRequestSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    confirm_password = serializers.CharField(write_only=True, trim_whitespace=False)
    registration_no = serializers.CharField(max_length=15)
    department = serializers.CharField(max_length=50)
    graduation_year = serializers.IntegerField()
    cgpa = serializers.FloatField()
    active_backlogs = serializers.IntegerField(required=False, min_value=0, default=0)

    def validate_email(self, value):
        from .models import PendingStudentRegistration

        normalized_email = _normalize_student_email(value)
        if User.objects.filter(email__iexact=normalized_email).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        existing_pending = PendingStudentRegistration.objects.filter(
            email__iexact=normalized_email
        ).first()
        if existing_pending and existing_pending.expires_at <= timezone.now():
            existing_pending.delete()
        return normalized_email

    def validate_registration_no(self, value):
        from .models import PendingStudentRegistration

        registration_no = (value or "").strip().upper()
        if Student.objects.filter(registration_no__iexact=registration_no).exists():
            raise serializers.ValidationError(
                "A student account with this registration number already exists."
            )
        existing_pending = PendingStudentRegistration.objects.filter(
            registration_data__registration_no=registration_no
        ).exclude(email__iexact=self.initial_data.get("email", "")).first()
        if existing_pending and existing_pending.expires_at > timezone.now():
            raise serializers.ValidationError(
                "A pending registration already exists for this registration number."
            )
        return registration_no

    def validate_cgpa(self, value):
        if value < 0 or value > 10:
            raise serializers.ValidationError("CGPA must be between 0 and 10.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Password confirmation does not match."}
            )

        temp_user = User(
            email=attrs["email"],
            first_name=attrs["first_name"],
            last_name=attrs["last_name"],
            role="student",
        )

        try:
            validate_password(attrs["password"], user=temp_user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": list(exc.messages)}) from exc

        return attrs


class StudentRegistrationVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, trim_whitespace=True)

    default_error_messages = {
        "not_found": "No pending registration found for this email.",
        "expired": "OTP expired. Please request a new one.",
        "invalid": "Invalid OTP.",
    }

    def validate_email(self, value):
        return _normalize_student_email(value)

    def validate_otp(self, value):
        otp = (value or "").strip()
        if not otp.isdigit() or len(otp) != 6:
            raise serializers.ValidationError("Enter the 6-digit OTP sent to your email.")
        return otp

    def validate(self, attrs):
        from .models import PendingStudentRegistration

        email = attrs["email"]
        pending = PendingStudentRegistration.objects.filter(email__iexact=email).first()
        if not pending:
            self.fail("not_found")

        if pending.expires_at <= timezone.now():
            pending.delete()
            self.fail("expired")

        if pending.attempts >= settings.STUDENT_OTP_MAX_ATTEMPTS:
            pending.delete()
            raise serializers.ValidationError(
                {"otp": "Too many invalid attempts. Please request a new OTP."}
            )

        if not check_password(attrs["otp"], pending.otp_hash):
            pending.attempts += 1
            pending.save(update_fields=["attempts", "updated_at"])
            self.fail("invalid")

        attrs["pending_registration"] = pending
        return attrs

    @transaction.atomic
    def save(self, **kwargs):
        pending = self.validated_data["pending_registration"]
        data = pending.registration_data

        if User.objects.filter(email__iexact=data["email"]).exists():
            pending.delete()
            raise serializers.ValidationError(
                {"email": "An account with this email already exists."}
            )
        if Student.objects.filter(registration_no__iexact=data["registration_no"]).exists():
            pending.delete()
            raise serializers.ValidationError(
                {
                    "registration_no": (
                        "A student account with this registration number already exists."
                    )
                }
            )

        user = User.objects.create_user(
            email=data["email"],
            password=data["password"],
            first_name=data["first_name"],
            last_name=data["last_name"],
            role="student",
        )
        student = Student.objects.create(
            user=user,
            registration_no=data["registration_no"],
            department=data["department"],
            graduation_year=data["graduation_year"],
            cgpa=data["cgpa"],
            active_backlogs=data.get("active_backlogs", 0),
        )
        pending.delete()
        return student


def build_pending_student_registration(validated_data, otp):
    data = dict(validated_data)
    data.pop("confirm_password", None)
    data["password"] = validated_data["password"]
    data["email"] = validated_data["email"].lower()
    data["registration_no"] = validated_data["registration_no"].upper()

    return {
        "email": data["email"],
        "otp_hash": make_password(otp),
        "expires_at": timezone.now() + timedelta(minutes=settings.STUDENT_OTP_EXPIRY_MINUTES),
        "registration_data": data,
        "attempts": 0,
    }
