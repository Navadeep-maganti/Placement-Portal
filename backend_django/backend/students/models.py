from django.db import models

# Create your models here.
class Student(models.Model):
    user = models.OneToOneField('api.User', on_delete=models.CASCADE)
    registration_no = models.CharField(max_length=15, unique=True)
    department = models.CharField(max_length=50)
    graduation_year = models.IntegerField()
    cgpa = models.FloatField()
    resume = models.FileField(upload_to='resumes/', null=True, blank=True)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} ({self.user.email}) ({self.registration_no})"