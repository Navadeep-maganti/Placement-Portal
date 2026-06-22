from django.db import models


class ActivityLog(models.Model):
    class ActionType(models.TextChoices):
        APPLICATION_SUBMITTED = "application_submitted", "Application Submitted"
        APPLICATION_STATUS_CHANGED = "application_status_changed", "Application Status Changed"
        JOB_CREATED = "job_created", "Job Created"
        JOB_UPDATED = "job_updated", "Job Updated"
        ELIGIBILITY_UPDATED = "eligibility_updated", "Eligibility Updated"

    actor = models.ForeignKey(
        "api.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    action_type = models.CharField(max_length=50, choices=ActionType.choices)
    description = models.CharField(max_length=255)
    metadata = models.JSONField(default=dict, blank=True)
    placement = models.ForeignKey(
        "placements.Placement",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="activity_logs",
    )
    application = models.ForeignKey(
        "applications.Application",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="activity_logs",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "activitylog_entry"
        ordering = ["-created_at", "-id"]
        indexes = [
            models.Index(fields=["action_type", "created_at"]),
            models.Index(fields=["placement", "created_at"]),
            models.Index(fields=["application", "created_at"]),
        ]

    def __str__(self):
        return f"{self.action_type} @ {self.created_at:%Y-%m-%d %H:%M:%S}"

    @classmethod
    def log(
        cls,
        *,
        action_type,
        description,
        actor=None,
        placement=None,
        application=None,
        metadata=None,
    ):
        return cls.objects.create(
            actor=actor,
            action_type=action_type,
            description=description,
            placement=placement,
            application=application,
            metadata=metadata or {},
        )
