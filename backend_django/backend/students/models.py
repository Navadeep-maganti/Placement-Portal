from django.db import models

class Student(models.Model):
    user = models.OneToOneField('api.User', on_delete=models.CASCADE)
    registration_no = models.CharField(max_length=15, unique=True)
    department = models.CharField(max_length=50)
    graduation_year = models.IntegerField()
    cgpa = models.FloatField()
    active_backlogs = models.PositiveSmallIntegerField(default=0)
    phone = models.CharField(max_length=20, blank=True)
    linkedin_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)
    career_objective = models.TextField(blank=True)
    skills_summary = models.TextField(blank=True)
    bio = models.TextField(blank=True)
    resume = models.FileField(upload_to='resumes/', null=True, blank=True)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} ({self.registration_no})"
