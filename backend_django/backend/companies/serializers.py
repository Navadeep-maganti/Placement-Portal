from datetime import timedelta

from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from api.models import User
from api.serializers import UserSerializer
from .models import Company, PendingRecruiterRegistration

class CompanySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Company
        fields = [
            'id',
            'user',
            'company_name',
            'location',
            'industry',
            'website',
            'description',
            'is_approved'
        ]


class CompanyProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source="user.first_name", required=False)
    last_name = serializers.CharField(source="user.last_name", required=False)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Company
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "company_name",
            "location",
            "industry",
            "website",
            "description",
            "is_approved",
        ]
        read_only_fields = ["is_approved"]

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()

        user = instance.user
        for field, value in user_data.items():
            setattr(user, field, value)
        if user_data:
            user.save(update_fields=list(user_data.keys()))

        return instance


class RecruiterRegistrationSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    confirm_password = serializers.CharField(write_only=True, trim_whitespace=False)
    company_name = serializers.CharField(max_length=100)
    location = serializers.CharField(max_length=100)
    industry = serializers.CharField(max_length=100)
    website = serializers.URLField(required=False, allow_blank=True)
    description = serializers.CharField()

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
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
            role="company",
        )

        try:
            validate_password(attrs["password"], user=temp_user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": list(exc.messages)}) from exc

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        validated_data.pop("confirm_password")
        password = validated_data.pop("password")
        user = User.objects.create_user(
            email=validated_data.pop("email"),
            password=password,
            first_name=validated_data.pop("first_name"),
            last_name=validated_data.pop("last_name"),
            role="company",
        )
        return Company.objects.create(
            user=user,
            is_approved=False,
            **validated_data,
        )


class RecruiterRegistrationRequestSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    confirm_password = serializers.CharField(write_only=True, trim_whitespace=False)
    company_name = serializers.CharField(max_length=100)
    location = serializers.CharField(max_length=100)
    industry = serializers.CharField(max_length=100)
    website = serializers.URLField(required=False, allow_blank=True)
    description = serializers.CharField()

    def validate_email(self, value):
        normalized_email = (value or "").strip().lower()
        if User.objects.filter(email__iexact=normalized_email).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        existing_pending = PendingRecruiterRegistration.objects.filter(
            email__iexact=normalized_email
        ).first()
        if existing_pending and existing_pending.expires_at <= timezone.now():
            existing_pending.delete()
        return normalized_email

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Password confirmation does not match."}
            )

        temp_user = User(
            email=attrs["email"],
            first_name=attrs["first_name"],
            last_name=attrs["last_name"],
            role="company",
        )

        try:
            validate_password(attrs["password"], user=temp_user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": list(exc.messages)}) from exc

        return attrs


class RecruiterRegistrationVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, trim_whitespace=True)

    default_error_messages = {
        "not_found": "No pending recruiter registration found for this email.",
        "expired": "OTP expired. Please request a new OTP.",
        "invalid": "Invalid OTP.",
    }

    def validate_email(self, value):
        return (value or "").strip().lower()

    def validate_otp(self, value):
        otp = (value or "").strip()
        if not otp.isdigit() or len(otp) != 6:
            raise serializers.ValidationError("Enter the 6-digit OTP sent to your email.")
        return otp

    def validate(self, attrs):
        pending = PendingRecruiterRegistration.objects.filter(
            email__iexact=attrs["email"]
        ).first()
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

        user = User.objects.create_user(
            email=data["email"],
            password=data["password"],
            first_name=data["first_name"],
            last_name=data["last_name"],
            role="company",
        )
        company = Company.objects.create(
            user=user,
            company_name=data["company_name"],
            location=data["location"],
            industry=data["industry"],
            website=data.get("website", ""),
            description=data["description"],
            is_approved=False,
        )
        pending.delete()
        return company


def build_pending_recruiter_registration(validated_data, otp):
    data = dict(validated_data)
    data.pop("confirm_password", None)
    data["password"] = validated_data["password"]
    data["email"] = validated_data["email"].lower()

    return {
        "email": data["email"],
        "otp_hash": make_password(otp),
        "expires_at": timezone.now() + timedelta(minutes=settings.STUDENT_OTP_EXPIRY_MINUTES),
        "registration_data": data,
        "attempts": 0,
    }
