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
