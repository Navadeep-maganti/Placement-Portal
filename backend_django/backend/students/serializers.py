from rest_framework import serializers
from .models import Student


class StudentSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source="user.first_name")
    last_name = serializers.CharField(source="user.last_name")
    email = serializers.EmailField(source="user.email")

    class Meta:
        model = Student
        fields = [
            "id",
            "registration_no",
            "department",
            "graduation_year",
            "cgpa",
            "resume",
            "first_name",
            "last_name",
            "email",
        ]
