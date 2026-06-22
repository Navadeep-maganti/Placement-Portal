from django.db import migrations


def rename_job_id_to_placement_id(apps, schema_editor):
    connection = schema_editor.connection
    table_name = "jobs_job_required_skills"

    with connection.cursor() as cursor:
        tables = connection.introspection.table_names(cursor)
        if table_name not in tables:
            return

        columns = {
            column.name
            for column in connection.introspection.get_table_description(
                cursor, table_name
            )
        }

    if "job_id" not in columns or "placement_id" in columns:
        return

    quote_name = schema_editor.quote_name
    schema_editor.execute(
        f"ALTER TABLE {quote_name(table_name)} "
        f"RENAME COLUMN {quote_name('job_id')} TO {quote_name('placement_id')}"
    )


def rename_placement_id_to_job_id(apps, schema_editor):
    connection = schema_editor.connection
    table_name = "jobs_job_required_skills"

    with connection.cursor() as cursor:
        tables = connection.introspection.table_names(cursor)
        if table_name not in tables:
            return

        columns = {
            column.name
            for column in connection.introspection.get_table_description(
                cursor, table_name
            )
        }

    if "placement_id" not in columns or "job_id" in columns:
        return

    quote_name = schema_editor.quote_name
    schema_editor.execute(
        f"ALTER TABLE {quote_name(table_name)} "
        f"RENAME COLUMN {quote_name('placement_id')} TO {quote_name('job_id')}"
    )


class Migration(migrations.Migration):
    dependencies = [
        ("placements", "0005_eligibilitycriteria_eligibledepartment_and_more"),
    ]

    operations = [
        migrations.RunPython(
            rename_job_id_to_placement_id,
            rename_placement_id_to_job_id,
        ),
    ]
