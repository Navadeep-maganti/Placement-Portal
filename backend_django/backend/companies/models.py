from django.db import models

class Company(models.Model):
    user = models.OneToOneField('api.User', on_delete=models.CASCADE)
    company_name = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    industry = models.CharField(max_length=100)
    website = models.URLField(blank=True)
    description = models.TextField()
    is_approved = models.BooleanField(default=False)

    class Meta:
        db_table = "recruiters_company"

    def __str__(self):
        return self.company_name


class PendingRecruiterRegistration(models.Model):
    email = models.EmailField(unique=True)
    otp_hash = models.CharField(max_length=128)
    expires_at = models.DateTimeField()
    registration_data = models.JSONField()
    attempts = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.email
