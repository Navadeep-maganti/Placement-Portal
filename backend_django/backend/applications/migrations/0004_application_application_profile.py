from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("applications", "0003_applicationstatushistory"),
    ]

    operations = [
        migrations.AddField(
            model_name="application",
            name="application_profile",
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
