from django.db import migrations


def normalize_superuser_roles(apps, schema_editor):
    user_model = apps.get_model("user", "User")
    user_model.objects.filter(is_superuser=True).exclude(role="admin").update(
        role="admin",
        is_staff=True,
    )


class Migration(migrations.Migration):
    dependencies = [
        ("user", "0008_alter_user_groups"),
    ]

    operations = [
        migrations.RunPython(normalize_superuser_roles, migrations.RunPython.noop),
    ]
