from django.db import models


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
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE)
    job = models.ForeignKey('placements.Placement', on_delete=models.CASCADE)
    application_date = models.DateTimeField(auto_now_add=True)
    status = models.ForeignKey(
        "ApplicationStatus",
        on_delete=models.PROTECT,
        related_name="applications",
        default=get_default_application_status,
    )

    class Meta:
        unique_together = ('student', 'job')

    def __str__(self):
        return f"{self.student.registration_no} -> {self.job.job_title}"
