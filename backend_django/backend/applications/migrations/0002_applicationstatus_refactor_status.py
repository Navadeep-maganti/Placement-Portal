from django.db import migrations, models
import django.db.models.deletion
import applications.models


def forwards_populate_status_fk(apps, schema_editor):
    Application = apps.get_model('applications', 'Application')
    ApplicationStatus = apps.get_model('applications', 'ApplicationStatus')

    status_seed = {
        'applied': ('Applied', 1),
        'shortlisted': ('Shortlisted', 2),
        'offered': ('Offered', 3),
        'rejected': ('Rejected', 4),
    }

    status_ids = {}
    for code, (name, sort_order) in status_seed.items():
        status_obj, _ = ApplicationStatus.objects.get_or_create(
            code=code,
            defaults={'name': name, 'is_active': True, 'sort_order': sort_order},
        )
        status_ids[code] = status_obj.id

    default_status_id = status_ids['applied']
    for application in Application.objects.all().only('id', 'status'):
        Application.objects.filter(id=application.id).update(
            status_fk_id=status_ids.get(application.status, default_status_id)
        )


class Migration(migrations.Migration):

    dependencies = [
        ('applications', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ApplicationStatus',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(max_length=30, unique=True)),
                ('name', models.CharField(max_length=50, unique=True)),
                ('is_active', models.BooleanField(default=True)),
                ('sort_order', models.PositiveSmallIntegerField(default=1)),
            ],
            options={
                'db_table': 'applications_status',
                'ordering': ['sort_order', 'name'],
            },
        ),
        migrations.AddField(
            model_name='application',
            name='status_fk',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='+',
                to='applications.applicationstatus',
            ),
        ),
        migrations.RunPython(forwards_populate_status_fk, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name='application',
            name='status',
        ),
        migrations.RenameField(
            model_name='application',
            old_name='status_fk',
            new_name='status',
        ),
        migrations.AlterField(
            model_name='application',
            name='status',
            field=models.ForeignKey(
                default=applications.models.get_default_application_status,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='applications',
                to='applications.applicationstatus',
            ),
        ),
    ]
