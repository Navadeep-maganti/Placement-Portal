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
