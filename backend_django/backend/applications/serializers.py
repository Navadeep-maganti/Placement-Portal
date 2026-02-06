from rest_framework import serializers
from .models import Application
class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = [
            "id",
            "student",
            "company",
            "position",
            "status",
            "applied_date",
        ]