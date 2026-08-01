from django.db import migrations


TENANT_MODELS = ("Batch", "Classs", "Exam", "ExamType", "Schedule", "Subject", "Teacher")


def backfill_legacy_organization(apps, schema_editor):
    Organization = apps.get_model("organization", "Organization")
    Membership = apps.get_model("organization", "OrganizationMembership")
    User = apps.get_model("user", "User")
    legacy, _ = Organization.objects.get_or_create(
        slug="legacy", defaults={"name": "Legacy Organization"}
    )
    for model_name in TENANT_MODELS:
        apps.get_model("organization", model_name).objects.filter(
            organization__isnull=True
        ).update(organization=legacy)
    for model_name in ("Student", "Enroll", "Transaction"):
        apps.get_model("student", model_name).objects.filter(
            organization__isnull=True
        ).update(organization=legacy)
    for user in User.objects.filter(role__in=["org_admin", "org_staff", "student", "teacher"]):
        Membership.objects.get_or_create(
            organization=legacy, user=user, defaults={"is_default": True}
        )


class Migration(migrations.Migration):
    dependencies = [
        ("organization", "0007_tenancy_foundation"),
        ("student", "0010_tenancy_and_ledger_foundation"),
        ("user", "0009_normalize_superuser_roles"),
    ]
    operations = [migrations.RunPython(backfill_legacy_organization, migrations.RunPython.noop)]
