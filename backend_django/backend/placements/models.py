from django.db import models
class Placement(models.Model):
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE, related_name='jobs')
    job_title = models.CharField(max_length=100)
    job_description = models.TextField()
    eligibility_cgpa = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    application_deadline = models.DateField()
    is_active = models.BooleanField(default=True)
    no_of_positions = models.IntegerField(default=1)
    no_of_applicants = models.IntegerField(default=0)
    required_skills = models.ManyToManyField('skills.Skill', related_name='placements')
    def __str__(self):
        return f"{self.job_title} at {self.company.company_name}"

class skills(models.Model):
    name = models.CharField(max_length=50)
    def __str__(self):
        return self.name