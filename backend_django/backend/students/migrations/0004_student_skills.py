from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("placements", "0006_rename_jobrequiredskill_job_id_column"),
        ("students", "0003_student_profile_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="student",
            name="skills",
            field=models.ManyToManyField(
                blank=True,
                related_name="students",
                to="placements.skill",
            ),
        ),
    ]
