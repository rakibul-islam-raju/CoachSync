import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("organization", "0006_alter_batch_code"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Organization",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=100)),
                ("slug", models.SlugField(max_length=100, unique=True)),
                ("created_by", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="%(class)s_set", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["name"]},
        ),
        migrations.CreateModel(
            name="OrganizationMembership",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("is_default", models.BooleanField(default=False)),
                ("created_by", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="%(class)s_set", to=settings.AUTH_USER_MODEL)),
                ("organization", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="memberships", to="organization.organization")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="organization_memberships", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["organization__name", "user__email"]},
        ),
        migrations.AlterField(model_name="batch", name="code", field=models.CharField(blank=True, max_length=6, null=True)),
        migrations.AlterField(model_name="classs", name="numeric", field=models.IntegerField()),
        migrations.AlterField(model_name="subject", name="code", field=models.CharField(max_length=16)),
        *[
            migrations.AddField(
                model_name=model,
                name="organization",
                field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name="%(class)s_set", to="organization.organization"),
            )
            for model in ["batch", "classs", "exam", "examtype", "schedule", "subject", "teacher"]
        ],
        migrations.AddConstraint(
            model_name="organizationmembership",
            constraint=models.UniqueConstraint(fields=("organization", "user"), name="unique_organization_membership"),
        ),
    ]
