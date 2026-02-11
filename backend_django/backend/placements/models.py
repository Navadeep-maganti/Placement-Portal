from django.db import models

class Placement(models.Model):
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE, related_name='jobs')
    job_title = models.CharField(max_length=100)
    job_description = models.TextField()
    eligibility_cgpa = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    application_deadline = models.DateField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.job_title} at {self.company.company_name}"
