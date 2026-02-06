from rest_framework import serializers
from .models import Placement
class PlacementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Placement
        fields = [
            "id",
            "student",
            "company",
            "position",
            "salary",
            "placement_date",
        ]