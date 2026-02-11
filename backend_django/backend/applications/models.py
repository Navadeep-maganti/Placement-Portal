from django.db import models

class Application(models.Model):
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE)
    job = models.ForeignKey('placements.Placement', on_delete=models.CASCADE)
    application_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=30,
        choices=[
            ('applied', 'Applied'),
            ('shortlisted', 'Shortlisted'),
            ('offered', 'Offered'),
            ('rejected', 'Rejected')
        ],
        default='applied'
    )

    class Meta:
        unique_together = ('student', 'job')

    def __str__(self):
        return f"{self.student.registration_no} → {self.job.job_title}"
