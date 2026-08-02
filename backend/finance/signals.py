from datetime import timedelta

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from organization.models import Organization
from student.models import Enroll

from .models import Invoice, PaymentMethod


@receiver(post_save, sender=Organization)
def create_default_payment_methods(sender, instance, created, **kwargs):
    if not created:
        return
    for name, method_type in (
        ("Cash", PaymentMethod.CASH),
        ("Bank transfer", PaymentMethod.BANK),
        ("Mobile banking", PaymentMethod.MOBILE),
    ):
        PaymentMethod.objects.get_or_create(
            organization=instance,
            name=name,
            defaults={"method_type": method_type},
        )


@receiver(post_save, sender=Enroll)
def create_enrollment_invoice(sender, instance, created, **kwargs):
    if created:
        Invoice.objects.get_or_create(
            organization=instance.organization,
            enroll=instance,
            defaults={
                "issue_date": timezone.localdate(),
                "due_date": timezone.localdate() + timedelta(days=30),
                "created_by": instance.created_by,
            },
        )

