from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import serializers

from api.models import User
from .models import Company
from api.serializers import UserSerializer

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
