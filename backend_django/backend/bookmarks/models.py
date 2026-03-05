from django.db import models

# Create your models here.
class Bookmark(models.Model):
    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='bookmarks',
        db_column='student_id',
    )
    placement = models.ForeignKey(
        'placements.Placement',
        on_delete=models.CASCADE,
        related_name='bookmarked_by',
        db_column='placement_id',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "bookmarks_bookmark"
        unique_together = (('student', 'placement'),)

    def __str__(self):
        return f"{self.student.user.username} bookmarked {self.placement.job_title}"