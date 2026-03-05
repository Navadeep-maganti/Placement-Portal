from django.db import models
class Placement(models.Model):
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='jobs',
        db_column='recruiter_id',
    )
    job_title = models.CharField(max_length=100)
    job_description = models.TextField()
    eligibility_cgpa = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    application_deadline = models.DateField()
    is_active = models.BooleanField(default=True)
    no_of_positions = models.IntegerField(default=1)
    no_of_applicants = models.IntegerField(default=0)
    required_skills = models.ManyToManyField(
        'Skill',
        related_name='placements',
        through='JobRequiredSkill',
    )

    class Meta:
        db_table = "jobs_job"

    def __str__(self):
        return f"{self.job_title} at {self.company.company_name}"

class Skill(models.Model):
    name = models.CharField(max_length=50)

    class Meta:
        db_table = "jobs_skill"

    def __str__(self):
        return self.name


class JobRequiredSkill(models.Model):
    placement = models.ForeignKey(
        'Placement',
        on_delete=models.CASCADE,
        db_column='job_id',
    )
    skill = models.ForeignKey(
        'Skill',
        on_delete=models.CASCADE,
        db_column='skill_id',
    )

    class Meta:
        db_table = "jobs_job_required_skills"
        managed = False
        unique_together = (('placement', 'skill'),)
