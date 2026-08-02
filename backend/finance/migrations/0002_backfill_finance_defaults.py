from datetime import timedelta

from django.db import migrations
from django.utils import timezone


def backfill_finance_defaults(apps, schema_editor):
    Organization = apps.get_model("organization", "Organization")
    Enroll = apps.get_model("student", "Enroll")
    Invoice = apps.get_model("finance", "Invoice")
    PaymentMethod = apps.get_model("finance", "PaymentMethod")

    for organization in Organization.objects.all():
        for name, method_type in (
            ("Cash", "cash"),
            ("Bank transfer", "bank"),
            ("Mobile banking", "mobile"),
        ):
            PaymentMethod.objects.get_or_create(
                organization=organization,
                name=name,
                defaults={"method_type": method_type},
            )

    today = timezone.localdate()
    for enroll in Enroll.objects.select_related("organization"):
        invoice, created = Invoice.objects.get_or_create(
            organization=enroll.organization,
            enroll=enroll,
            defaults={
                "invoice_number": f"MIGRATING-{enroll.pk}",
                "issue_date": today,
                "due_date": today + timedelta(days=30),
                "created_by": enroll.created_by,
            },
        )
        if created:
            invoice.invoice_number = (
                f"INV-{invoice.organization_id:04d}-{invoice.pk:06d}"
            )
            invoice.save(update_fields=["invoice_number"])


class Migration(migrations.Migration):
    dependencies = [
        ("finance", "0001_initial"),
        ("student", "0012_transaction_installment_transaction_payment_method_and_more"),
    ]

    operations = [migrations.RunPython(backfill_finance_defaults, migrations.RunPython.noop)]

