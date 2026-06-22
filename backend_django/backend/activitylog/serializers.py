from rest_framework import serializers

from .models import ActivityLog


class ActivityLogSerializer(serializers.ModelSerializer):
    actor_email = serializers.CharField(
        source="actor.email",
        read_only=True,
        allow_null=True,
    )
    placement_title = serializers.CharField(
        source="placement.job_title",
        read_only=True,
        allow_null=True,
    )
    application_id = serializers.IntegerField(
        source="application.id",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = ActivityLog
        fields = [
            "id",
            "action_type",
            "description",
            "actor",
            "actor_email",
            "placement",
            "placement_title",
            "application_id",
            "metadata",
            "created_at",
        ]
