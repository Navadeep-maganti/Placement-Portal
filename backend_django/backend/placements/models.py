from django.db import models
from django.db.models import Q
from django.utils import timezone


class Placement(models.Model):
    company = models.ForeignKey(
        "companies.Company",
        on_delete=models.CASCADE,
        related_name="jobs",
        db_column="recruiter_id",
    )
    job_title = models.CharField(max_length=100)
    job_description = models.TextField()
    salary = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    eligibility_cgpa = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    application_deadline = models.DateField()
    is_active = models.BooleanField(default=True)
    no_of_positions = models.IntegerField(default=1)
    no_of_applicants = models.IntegerField(default=0)
    required_skills = models.ManyToManyField(
        "Skill",
        related_name="placements",
        through="JobRequiredSkill",
    )

    class Meta:
        db_table = "jobs_job"

    def __str__(self):
        return f"{self.job_title} at {self.company.company_name}"

    def save(self, *args, **kwargs):
        is_create = self._state.adding
        original = None
        if not is_create and self.pk:
            original = type(self).objects.filter(pk=self.pk).values(
                "job_title",
                "application_deadline",
                "is_active",
                "eligibility_cgpa",
                "no_of_positions",
            ).first()

        super().save(*args, **kwargs)

        criteria, criteria_created = EligibilityCriteria.objects.get_or_create(
            placement=self,
            defaults={"min_cgpa": self.eligibility_cgpa},
        )
        if not criteria_created and criteria.min_cgpa != self.eligibility_cgpa:
            criteria.min_cgpa = self.eligibility_cgpa
            criteria.save(update_fields=["min_cgpa"])

        from activitylog.models import ActivityLog

        if is_create:
            ActivityLog.log(
                action_type=ActivityLog.ActionType.JOB_CREATED,
                description=f"Job '{self.job_title}' was created.",
                placement=self,
                metadata={
                    "company": self.company.company_name,
                    "application_deadline": self.application_deadline.isoformat(),
                    "positions": self.no_of_positions,
                },
            )
            return

        if not original:
            return

        changed_fields = [
            field_name
            for field_name in original
            if original[field_name] != getattr(self, field_name)
        ]
        if changed_fields:
            ActivityLog.log(
                action_type=ActivityLog.ActionType.JOB_UPDATED,
                description=f"Job '{self.job_title}' was updated.",
                placement=self,
                metadata={"changed_fields": changed_fields},
            )

    def get_eligibility_details(self):
        criteria = getattr(self, "eligibility_criteria", None)
        if criteria:
            return {
                "min_cgpa": criteria.min_cgpa,
                "max_backlogs": criteria.max_backlogs,
                "graduation_year": criteria.graduation_year,
                "requires_resume": criteria.requires_resume,
                "notes": criteria.notes,
                "allowed_departments": list(
                    criteria.allowed_departments.values_list("department_name", flat=True)
                ),
            }

        return {
            "min_cgpa": self.eligibility_cgpa,
            "max_backlogs": None,
            "graduation_year": None,
            "requires_resume": False,
            "notes": "",
            "allowed_departments": [],
        }

    def is_student_eligible(self, student):
        details = self.get_eligibility_details()
        reasons = []

        accepted_offer = student.application_set.select_related("job__company").filter(
            status__code="offer_accepted"
        ).exclude(job=self).first()
        if accepted_offer:
            reasons.append(
                "You have already accepted an offer from "
                f"{accepted_offer.job.company.company_name}."
            )

        if self.application_deadline < timezone.localdate():
            reasons.append("The application deadline for this job has passed.")

        if student.cgpa < details["min_cgpa"]:
            reasons.append(f"Minimum CGPA required is {details['min_cgpa']}.")
        if (
            details["max_backlogs"] is not None
            and student.active_backlogs > details["max_backlogs"]
        ):
            reasons.append(
                f"Maximum allowed backlogs is {details['max_backlogs']}."
            )
        if (
            details["graduation_year"] is not None
            and student.graduation_year != details["graduation_year"]
        ):
            reasons.append(
                f"Only {details['graduation_year']} graduates can apply."
            )
        if (
            details["allowed_departments"]
            and student.department not in details["allowed_departments"]
        ):
            reasons.append(
                f"Department must be one of: {', '.join(details['allowed_departments'])}."
            )
        if details["requires_resume"] and not student.resume:
            reasons.append("Resume is required before applying.")

        return not reasons, reasons


class Skill(models.Model):
    name = models.CharField(max_length=50)

    class Meta:
        db_table = "jobs_skill"

    def __str__(self):
        return self.name


class JobRequiredSkill(models.Model):
    placement = models.ForeignKey(
        "Placement",
        on_delete=models.CASCADE,
        db_column="job_id",
    )
    skill = models.ForeignKey(
        "Skill",
        on_delete=models.CASCADE,
        db_column="skill_id",
    )

    class Meta:
        db_table = "jobs_job_required_skills"
        managed = False
        unique_together = (("placement", "skill"),)


class EligibilityCriteria(models.Model):
    placement = models.OneToOneField(
        Placement,
        on_delete=models.CASCADE,
        related_name="eligibility_criteria",
    )
    min_cgpa = models.FloatField()
    max_backlogs = models.PositiveSmallIntegerField(null=True, blank=True)
    graduation_year = models.PositiveIntegerField(null=True, blank=True)
    requires_resume = models.BooleanField(default=False)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = "jobs_eligibility_criteria"
        constraints = [
            models.CheckConstraint(
                check=Q(min_cgpa__gte=0) & Q(min_cgpa__lte=10),
                name="eligibility_min_cgpa_range",
            ),
        ]

    def __str__(self):
        return f"Eligibility for {self.placement.job_title}"

    def save(self, *args, **kwargs):
        is_create = self._state.adding
        original = None
        if not is_create and self.pk:
            original = type(self).objects.filter(pk=self.pk).values(
                "min_cgpa",
                "max_backlogs",
                "graduation_year",
                "requires_resume",
                "notes",
            ).first()

        super().save(*args, **kwargs)
        Placement.objects.filter(pk=self.placement_id).exclude(
            eligibility_cgpa=self.min_cgpa
        ).update(eligibility_cgpa=self.min_cgpa)

        from activitylog.models import ActivityLog

        payload = {
            "min_cgpa": self.min_cgpa,
            "max_backlogs": self.max_backlogs,
            "graduation_year": self.graduation_year,
            "requires_resume": self.requires_resume,
            "notes": self.notes,
        }

        if is_create:
            ActivityLog.log(
                action_type=ActivityLog.ActionType.ELIGIBILITY_UPDATED,
                description=f"Eligibility criteria created for '{self.placement.job_title}'.",
                placement=self.placement,
                metadata=payload,
            )
            return

        if original and any(original[field] != payload[field] for field in payload):
            ActivityLog.log(
                action_type=ActivityLog.ActionType.ELIGIBILITY_UPDATED,
                description=f"Eligibility criteria updated for '{self.placement.job_title}'.",
                placement=self.placement,
                metadata=payload,
            )


class EligibleDepartment(models.Model):
    criteria = models.ForeignKey(
        EligibilityCriteria,
        on_delete=models.CASCADE,
        related_name="allowed_departments",
    )
    department_name = models.CharField(max_length=50)

    class Meta:
        db_table = "jobs_eligible_departments"
        unique_together = (("criteria", "department_name"),)
        indexes = [
            models.Index(fields=["department_name"]),
        ]

    def __str__(self):
        return f"{self.department_name} eligible for {self.criteria.placement.job_title}"

    def save(self, *args, **kwargs):
        is_create = self._state.adding
        super().save(*args, **kwargs)

        if is_create:
            from activitylog.models import ActivityLog

            ActivityLog.log(
                action_type=ActivityLog.ActionType.ELIGIBILITY_UPDATED,
                description=(
                    f"Department '{self.department_name}' added to eligibility for "
                    f"'{self.criteria.placement.job_title}'."
                ),
                placement=self.criteria.placement,
                metadata={"department_name": self.department_name},
            )

    def delete(self, *args, **kwargs):
        placement = self.criteria.placement
        department_name = self.department_name
        super().delete(*args, **kwargs)

        from activitylog.models import ActivityLog

        ActivityLog.log(
            action_type=ActivityLog.ActionType.ELIGIBILITY_UPDATED,
            description=(
                f"Department '{department_name}' removed from eligibility for "
                f"'{placement.job_title}'."
            ),
            placement=placement,
            metadata={"department_name": department_name, "removed": True},
        )
