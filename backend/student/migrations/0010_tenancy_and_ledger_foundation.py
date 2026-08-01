import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("organization", "0007_tenancy_foundation"),
        ("student", "0009_alter_transaction_amount_alter_transaction_enroll"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(model_name="enroll", name="cancellation_reason", field=models.CharField(blank=True, max_length=255)),
        migrations.AddField(model_name="enroll", name="cancelled_at", field=models.DateTimeField(blank=True, null=True)),
        migrations.AddField(model_name="enroll", name="cancelled_by", field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="cancelled_enrollments", to=settings.AUTH_USER_MODEL)),
        migrations.AddField(model_name="enroll", name="organization", field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name="enrollments", to="organization.organization")),
        migrations.AddField(model_name="enroll", name="status", field=models.CharField(choices=[("active", "Active"), ("cancelled", "Cancelled")], default="active", max_length=10)),
        migrations.AddField(model_name="student", name="organization", field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name="students", to="organization.organization")),
        migrations.AddField(model_name="transaction", name="organization", field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name="transactions", to="organization.organization")),
        migrations.AddField(model_name="transaction", name="reversal_of", field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name="reversal", to="student.transaction")),
        migrations.AddField(model_name="transaction", name="transaction_type", field=models.CharField(choices=[("payment", "Payment"), ("reversal", "Reversal")], default="payment", max_length=10)),
        migrations.AlterField(model_name="student", name="student_id", field=models.CharField(blank=True, db_index=True, max_length=50)),
    ]
