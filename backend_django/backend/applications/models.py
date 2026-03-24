from django.db import models
from django.db.models import Case, F, IntegerField, Value, When


def get_default_application_status():
    status, _ = ApplicationStatus.objects.get_or_create(
        code="applied",
        defaults={"name": "Applied", "is_active": True, "sort_order": 1},
    )
    return status.id


class ApplicationStatus(models.Model):
    code = models.CharField(max_length=30, unique=True)
    name = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveSmallIntegerField(default=1)

    class Meta:
        db_table = "applications_status"
        ordering = ["sort_order", "name"]

    def __str__(self):
        return self.name


class Application(models.Model):
    student = models.ForeignKey("students.Student", on_delete=models.CASCADE)
    job = models.ForeignKey("placements.Placement", on_delete=models.CASCADE)
    application_date = models.DateTimeField(auto_now_add=True)
    application_profile = models.JSONField(default=dict, blank=True)
    status = models.ForeignKey(
        "ApplicationStatus",
        on_delete=models.PROTECT,
        related_name="applications",
        default=get_default_application_status,
    )

    class Meta:
        unique_together = ("student", "job")

    def __str__(self):
        return f"{self.student.registration_no} -> {self.job.job_title}"

    @staticmethod
    def get_terminal_status_codes():
        return {
            "rejected",
            "offer_declined",
            "offer_accepted",
            "closed_after_offer_acceptance",
        }

    def save(self, *args, **kwargs):
        is_create = self._state.adding
        previous_status_id = None
        if not is_create and self.pk:
            previous_status_id = type(self).objects.filter(pk=self.pk).values_list(
                "status_id",
                flat=True,
            ).first()

        super().save(*args, **kwargs)

        changed_by = getattr(self, "_status_changed_by", None)
        remarks = getattr(self, "_status_change_remarks", "")
        self._status_changed_by = None
        self._status_change_remarks = ""

        if is_create:
            from activitylog.models import ActivityLog

            self.job.__class__.objects.filter(pk=self.job_id).update(
                no_of_applicants=F("no_of_applicants") + 1
            )
            ApplicationStatusHistory.objects.create(
                application=self,
                previous_status=None,
                new_status=self.status,
                changed_by=changed_by,
                remarks=remarks or "Application created.",
            )
            ActivityLog.log(
                action_type=ActivityLog.ActionType.APPLICATION_SUBMITTED,
                description=(
                    f"{self.student.registration_no} applied to '{self.job.job_title}'."
                ),
                actor=changed_by or self.student.user,
                placement=self.job,
                application=self,
                metadata={
                    "student_registration_no": self.student.registration_no,
                    "status": self.status.code,
                },
            )
            return

        if previous_status_id == self.status_id:
            return

        from activitylog.models import ActivityLog

        previous_status = None
        if previous_status_id:
            previous_status = ApplicationStatus.objects.filter(
                pk=previous_status_id
            ).first()

        ApplicationStatusHistory.objects.create(
            application=self,
            previous_status=previous_status,
            new_status=self.status,
            changed_by=changed_by,
            remarks=remarks,
        )
        ActivityLog.log(
            action_type=ActivityLog.ActionType.APPLICATION_STATUS_CHANGED,
            description=(
                f"Application for '{self.job.job_title}' moved to '{self.status.name}'."
            ),
            actor=changed_by,
            placement=self.job,
            application=self,
            metadata={
                "from_status": previous_status.code if previous_status else None,
                "to_status": self.status.code,
                "remarks": remarks,
            },
        )

    def delete(self, *args, **kwargs):
        job_model = self.job.__class__
        job_id = self.job_id
        super().delete(*args, **kwargs)
        job_model.objects.filter(pk=job_id).update(
            no_of_applicants=Case(
                When(no_of_applicants__gt=0, then=F("no_of_applicants") - 1),
                default=Value(0),
                output_field=IntegerField(),
            )
        )

    def update_status(self, new_status, changed_by=None, remarks=""):
        self.status = new_status
        self._status_changed_by = changed_by
        self._status_change_remarks = remarks
        self.save(update_fields=["status"])


class ApplicationStatusHistory(models.Model):
    application = models.ForeignKey(
        Application,
        on_delete=models.CASCADE,
        related_name="status_history",
    )
    previous_status = models.ForeignKey(
        ApplicationStatus,
        on_delete=models.SET_NULL,
        related_name="+",
        null=True,
        blank=True,
    )
    new_status = models.ForeignKey(
        ApplicationStatus,
        on_delete=models.PROTECT,
        related_name="history_entries",
    )
    changed_by = models.ForeignKey(
        "api.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    remarks = models.TextField(blank=True)
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "applications_status_history"
        ordering = ["-changed_at", "-id"]
        indexes = [
            models.Index(fields=["application", "changed_at"]),
        ]

    def __str__(self):
        return f"{self.application_id}: {self.new_status.name}"
