from datetime import date
from decimal import Decimal
from functools import cached_property

from django.db import models
from django.db.models import Case, DecimalField, F, Sum, Value, When
from django.db.models.functions import Coalesce

from user.models import User
from organization.models import Batch, Organization, get_legacy_organization_pk
from utilities.models import BaseModel

BLOOD_GROUPS = (
    ("A+", "A+"),
    ("A-", "A-"),
    ("B+", "B+"),
    ("B-", "B-"),
    ("O+", "O+"),
    ("O-", "O-"),
    ("AB+", "AB+"),
    ("AB-", "AB-"),
)


class Student(BaseModel):
    organization = models.ForeignKey(
        Organization,
        on_delete=models.PROTECT,
        related_name="students",
        default=get_legacy_organization_pk,
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    student_id = models.CharField(
        max_length=50, db_index=True, blank=True, null=False
    )
    emergency_contact_no = models.CharField(max_length=11, null=True)
    date_of_birth = models.DateField(null=True)
    blood_group = models.CharField(
        max_length=3, choices=BLOOD_GROUPS, blank=True, null=True
    )
    address = models.TextField(null=True)
    description = models.TextField(null=True)

    objects = models.Manager()

    class Meta:
        ordering = ["-id"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "student_id"],
                name="unique_student_id_per_org",
            )
        ]

    def __str__(self):
        return self.student_id

    def save(self, *args, **kwargs):
        if not self.student_id:
            today = date.today()
            formatted_year = str(today.year)[-2:]
            formatted_date = today.strftime("%m%d")

            super().save(*args, **kwargs)
            self.student_id = f"ST{self.id}-{formatted_year}{formatted_date}"
            super().save(update_fields=["student_id"])
            return

        super().save(*args, **kwargs)


class StudentGuardian(BaseModel):
    RELATIONSHIPS = (
        ("father", "Father"),
        ("mother", "Mother"),
        ("guardian", "Guardian"),
        ("other", "Other"),
    )

    organization = models.ForeignKey(
        Organization,
        on_delete=models.PROTECT,
        related_name="student_guardians",
        default=get_legacy_organization_pk,
    )
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="guardian_links"
    )
    guardian = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="student_links"
    )
    relationship = models.CharField(
        max_length=16, choices=RELATIONSHIPS, default="guardian"
    )
    is_primary = models.BooleanField(default=False)
    result_email_enabled = models.BooleanField(default=True)

    objects = models.Manager()

    class Meta:
        ordering = ["-is_primary", "guardian__first_name", "guardian__last_name"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "student", "guardian"],
                name="unique_guardian_link_per_student",
            )
        ]

    def __str__(self):
        return f"{self.guardian.full_name()} — {self.student.student_id}"


class Enroll(BaseModel):
    ACTIVE = "active"
    CANCELLED = "cancelled"
    STATUS_CHOICES = ((ACTIVE, "Active"), (CANCELLED, "Cancelled"))

    organization = models.ForeignKey(
        Organization,
        on_delete=models.PROTECT,
        related_name="enrollments",
        default=get_legacy_organization_pk,
    )
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="enrolls"
    )
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name="enrolls")
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    discount_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal("0.00"), blank=True, null=True
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=ACTIVE)
    cancelled_at = models.DateTimeField(blank=True, null=True)
    cancelled_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="cancelled_enrollments",
    )
    cancellation_reason = models.CharField(max_length=255, blank=True)
    reference_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="references",
    )

    objects = models.Manager()

    class Meta:
        ordering = ["-id"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(total_amount__gt=0),
                name="enrollment_total_positive",
            ),
            models.CheckConstraint(
                condition=(
                    models.Q(discount_amount__isnull=True)
                    | models.Q(discount_amount__gte=0)
                ),
                name="enrollment_discount_non_negative",
            ),
            models.CheckConstraint(
                condition=(
                    models.Q(discount_amount__isnull=True)
                    | models.Q(discount_amount__lte=models.F("total_amount"))
                ),
                name="enrollment_discount_not_above_total",
            ),
            models.UniqueConstraint(
                fields=["organization", "student", "batch"],
                condition=models.Q(status="active"),
                name="unique_active_student_batch_enrollment",
            ),
        ]

    def __str__(self):
        return self.student.student_id

    @cached_property
    def total_paid(self):
        money = DecimalField(max_digits=12, decimal_places=2)
        return self.transactions.aggregate(
            total=Coalesce(
                Sum(
                    Case(
                        When(transaction_type=Transaction.PAYMENT, then=F("amount")),
                        When(transaction_type=Transaction.REVERSAL, then=-F("amount")),
                        default=Value(Decimal("0.00")),
                        output_field=money,
                    )
                ),
                Value(Decimal("0.00")),
                output_field=money,
            )
        )["total"]

    @property
    def net_payable(self):
        return self.total_amount - (self.discount_amount or 0)

    @property
    def balance(self):
        return self.net_payable - self.total_paid

    @classmethod
    def get_paid_enrolls(cls):
        return cls.with_financials().filter(balance_amount__lte=0)

    @classmethod
    def get_due_enrolls(cls):
        return cls.with_financials().filter(balance_amount__gt=0)

    @classmethod
    def with_financials(cls):
        money = DecimalField(max_digits=12, decimal_places=2)
        return cls.objects.annotate(
            paid_amount=Coalesce(
                Sum(
                    Case(
                        When(
                            transactions__transaction_type=Transaction.PAYMENT,
                            then=F("transactions__amount"),
                        ),
                        When(
                            transactions__transaction_type=Transaction.REVERSAL,
                            then=-F("transactions__amount"),
                        ),
                        default=Value(Decimal("0.00")),
                        output_field=money,
                    )
                ),
                Value(Decimal("0.00")),
                output_field=money,
            )
        ).annotate(
            net_payable_amount=F("total_amount")
            - Coalesce(
                F("discount_amount"),
                Value(Decimal("0.00")),
                output_field=money,
            ),
            balance_amount=F("net_payable_amount") - F("paid_amount"),
        )


class Transaction(BaseModel):
    PAYMENT = "payment"
    REVERSAL = "reversal"
    TYPE_CHOICES = ((PAYMENT, "Payment"), (REVERSAL, "Reversal"))

    organization = models.ForeignKey(
        Organization,
        on_delete=models.PROTECT,
        related_name="transactions",
        default=get_legacy_organization_pk,
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_type = models.CharField(
        max_length=10, choices=TYPE_CHOICES, default=PAYMENT
    )
    enroll = models.ForeignKey(
        Enroll, on_delete=models.CASCADE, related_name="transactions"
    )
    remark = models.CharField(max_length=100, blank=True, null=True)
    reversal_of = models.OneToOneField(
        "self",
        on_delete=models.PROTECT,
        blank=True,
        null=True,
        related_name="reversal",
    )
    payment_method = models.ForeignKey(
        "finance.PaymentMethod",
        on_delete=models.PROTECT,
        blank=True,
        null=True,
        related_name="transactions",
    )
    installment = models.ForeignKey(
        "finance.Installment",
        on_delete=models.PROTECT,
        blank=True,
        null=True,
        related_name="transactions",
    )
    reference_number = models.CharField(max_length=100, blank=True)

    objects = models.Manager()

    class Meta:
        ordering = ["-id"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(amount__gt=0), name="transaction_amount_positive"
            ),
            models.CheckConstraint(
                condition=(
                    models.Q(transaction_type="payment", reversal_of__isnull=True)
                    | models.Q(transaction_type="reversal", reversal_of__isnull=False)
                ),
                name="reversal_requires_original_transaction",
            ),
        ]

    def __str__(self):
        return self.enroll.student.student_id
