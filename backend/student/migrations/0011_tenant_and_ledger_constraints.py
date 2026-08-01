import django.db.models.deletion
import organization.models
import decimal
from django.db import migrations, models


def repair_noop_transactions(apps, schema_editor):
    Transaction = apps.get_model("student", "Transaction")
    negative_count = Transaction.objects.filter(amount__lt=0).count()
    if negative_count:
        raise RuntimeError(
            "Negative legacy transactions require a manual payment/reversal mapping "
            "before ledger constraints can be enabled."
        )
    # Historical zero-value rows have no financial effect and cannot represent a
    # payment or reversal in the immutable positive-amount ledger.
    Transaction.objects.filter(amount=0).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("organization", "0009_tenant_constraints"),
        ("student", "0010_tenancy_and_ledger_foundation"),
    ]

    operations = [
        migrations.RunPython(repair_noop_transactions, migrations.RunPython.noop),
        migrations.AlterField(model_name="enroll", name="organization", field=models.ForeignKey(default=organization.models.get_legacy_organization_pk, on_delete=django.db.models.deletion.PROTECT, related_name="enrollments", to="organization.organization")),
        migrations.AlterField(model_name="student", name="organization", field=models.ForeignKey(default=organization.models.get_legacy_organization_pk, on_delete=django.db.models.deletion.PROTECT, related_name="students", to="organization.organization")),
        migrations.AlterField(model_name="transaction", name="organization", field=models.ForeignKey(default=organization.models.get_legacy_organization_pk, on_delete=django.db.models.deletion.PROTECT, related_name="transactions", to="organization.organization")),
        migrations.AlterField(model_name="enroll", name="total_amount", field=models.DecimalField(decimal_places=2, max_digits=12)),
        migrations.AlterField(model_name="enroll", name="discount_amount", field=models.DecimalField(blank=True, decimal_places=2, default=decimal.Decimal("0.00"), max_digits=12, null=True)),
        migrations.AlterField(model_name="transaction", name="amount", field=models.DecimalField(decimal_places=2, max_digits=12)),
        migrations.AddConstraint(model_name="enroll", constraint=models.CheckConstraint(condition=models.Q(("total_amount__gt", 0)), name="enrollment_total_positive")),
        migrations.AddConstraint(model_name="enroll", constraint=models.CheckConstraint(condition=models.Q(("discount_amount__isnull", True), ("discount_amount__gte", 0), _connector="OR"), name="enrollment_discount_non_negative")),
        migrations.AddConstraint(model_name="enroll", constraint=models.CheckConstraint(condition=models.Q(("discount_amount__isnull", True), ("discount_amount__lte", models.F("total_amount")), _connector="OR"), name="enrollment_discount_not_above_total")),
        migrations.AddConstraint(model_name="enroll", constraint=models.UniqueConstraint(condition=models.Q(("status", "active")), fields=("organization", "student", "batch"), name="unique_active_student_batch_enrollment")),
        migrations.AddConstraint(model_name="student", constraint=models.UniqueConstraint(fields=("organization", "student_id"), name="unique_student_id_per_org")),
        migrations.AddConstraint(model_name="transaction", constraint=models.CheckConstraint(condition=models.Q(("amount__gt", 0)), name="transaction_amount_positive")),
        migrations.AddConstraint(model_name="transaction", constraint=models.CheckConstraint(condition=models.Q(models.Q(("reversal_of__isnull", True), ("transaction_type", "payment")), models.Q(("reversal_of__isnull", False), ("transaction_type", "reversal")), _connector="OR"), name="reversal_requires_original_transaction")),
    ]
