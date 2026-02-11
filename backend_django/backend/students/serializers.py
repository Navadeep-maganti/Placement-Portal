from rest_framework import serializers
from .models import Student
from api.serializers import UserSerializer

class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Student
        fields = [
            'id',
            'user',
            'registration_no',
            'department',
            'graduation_year',
            'cgpa',
            'resume'
        ]
