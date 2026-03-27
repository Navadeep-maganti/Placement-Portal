from rest_framework import serializers

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
