from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("students", "0002_student_active_backlogs"),
    ]

    operations = [
        migrations.AddField(
            model_name="student",
            name="bio",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="student",
            name="career_objective",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="student",
            name="linkedin_url",
            field=models.URLField(blank=True),
        ),
        migrations.AddField(
            model_name="student",
            name="phone",
            field=models.CharField(blank=True, max_length=20),
        ),
        migrations.AddField(
            model_name="student",
            name="portfolio_url",
            field=models.URLField(blank=True),
        ),
        migrations.AddField(
            model_name="student",
            name="skills_summary",
            field=models.TextField(blank=True),
        ),
    ]
