from datetime import timedelta
from decimal import Decimal

from django.db import models
from django.db.models import Case, DecimalField, F, Sum, Value, When
from django.db.models.functions import Coalesce, Lower
from django.utils import timezone

from organization.models import TenantModel
from user.models import User


MONEY_FIELD = DecimalField(max_digits=12, decimal_places=2)


class PaymentMethod(TenantModel):
    CASH = "cash"
    BANK = "bank"
    MOBILE = "mobile"
    OTHER = "other"
    TYPE_CHOICES = (
        (CASH, "Cash"),
        (BANK, "Bank transfer"),
        (MOBILE, "Mobile banking"),
        (OTHER, "Other"),
    )

    name = models.CharField(max_length=80)
    method_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    instructions = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                Lower("name"), "organization", name="unique_payment_method_per_org_ci"
            )
        ]

    def __str__(self):
        return self.name


class Scholarship(TenantModel):
    FIXED = "fixed"
    PERCENTAGE = "percentage"
    TYPE_CHOICES = ((FIXED, "Fixed amount"), (PERCENTAGE, "Percentage"))

    name = models.CharField(max_length=100)
    discount_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    value = models.DecimalField(max_digits=12, decimal_places=2)
    valid_from = models.DateField(blank=True, null=True)
    valid_until = models.DateField(blank=True, null=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                Lower("name"), "organization", name="unique_scholarship_per_org_ci"
            ),
            models.CheckConstraint(
                condition=models.Q(value__gt=0), name="scholarship_value_positive"
            ),
            models.CheckConstraint(
                condition=(
                    models.Q(discount_type="fixed")
                    | models.Q(value__lte=Decimal("100.00"))
                ),
                name="scholarship_percentage_not_above_100",
            ),
            models.CheckConstraint(
                condition=(
                    models.Q(valid_from__isnull=True)
                    | models.Q(valid_until__isnull=True)
                    | models.Q(valid_from__lte=F("valid_until"))
                ),
                name="scholarship_dates_ordered",
            ),
        ]

    def __str__(self):
        return self.name


class ScholarshipAward(TenantModel):
    scholarship = models.ForeignKey(
        Scholarship, on_delete=models.PROTECT, related_name="awards"
    )
    enroll = models.OneToOneField(
        "student.Enroll", on_delete=models.PROTECT, related_name="scholarship_award"
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    awarded_on = models.DateField(default=timezone.localdate)
    notes = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["-awarded_on", "-id"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(amount__gt=0), name="scholarship_award_positive"
            )
        ]

    def __str__(self):
        return f"{self.scholarship} - {self.enroll}"


class Invoice(TenantModel):
    invoice_number = models.CharField(max_length=40)
    enroll = models.OneToOneField(
        "student.Enroll", on_delete=models.PROTECT, related_name="invoice"
    )
    issue_date = models.DateField(default=timezone.localdate)
    due_date = models.DateField()
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-issue_date", "-id"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "invoice_number"],
                name="unique_invoice_number_per_org",
            ),
            models.CheckConstraint(
                condition=models.Q(issue_date__lte=F("due_date")),
                name="invoice_due_not_before_issue",
            ),
        ]

    def save(self, *args, **kwargs):
        if not self.due_date:
            self.due_date = self.issue_date + timedelta(days=30)
        if not self.invoice_number:
            self.invoice_number = f"PENDING-{timezone.now().timestamp()}"
            super().save(*args, **kwargs)
            self.invoice_number = f"INV-{self.organization_id:04d}-{self.pk:06d}"
            super().save(update_fields=["invoice_number"])
            return
        super().save(*args, **kwargs)

    @property
    def total(self):
        return self.enroll.net_payable

    @property
    def paid(self):
        return self.enroll.total_paid

    @property
    def balance(self):
        return self.enroll.balance

    @property
    def status(self):
        if self.enroll.status == "cancelled":
            return "cancelled"
        if self.balance <= 0:
            return "paid"
        if self.due_date < timezone.localdate():
            return "overdue"
        if self.paid > 0:
            return "partial"
        return "unpaid"

    def __str__(self):
        return self.invoice_number


class Installment(TenantModel):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="installments")
    title = models.CharField(max_length=80)
    sequence = models.PositiveSmallIntegerField()
    due_date = models.DateField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        ordering = ["sequence", "due_date"]
        constraints = [
            models.UniqueConstraint(
                fields=["invoice", "sequence"], name="unique_invoice_installment_sequence"
            ),
            models.CheckConstraint(
                condition=models.Q(sequence__gt=0), name="installment_sequence_positive"
            ),
            models.CheckConstraint(
                condition=models.Q(amount__gt=0), name="installment_amount_positive"
            ),
        ]

    @property
    def paid(self):
        return self.transactions.aggregate(
            total=Coalesce(
                Sum(
                    Case(
                        When(transaction_type="payment", then=F("amount")),
                        When(transaction_type="reversal", then=-F("amount")),
                        default=Value(Decimal("0.00")),
                        output_field=MONEY_FIELD,
                    )
                ),
                Value(Decimal("0.00")),
                output_field=MONEY_FIELD,
            )
        )["total"]

    @property
    def balance(self):
        return self.amount - self.paid

    @property
    def status(self):
        if self.balance <= 0:
            return "paid"
        if self.due_date < timezone.localdate():
            return "overdue"
        if self.paid > 0:
            return "partial"
        return "pending"

    def __str__(self):
        return f"{self.invoice.invoice_number} / {self.title}"


class ExpenseCategory(TenantModel):
    name = models.CharField(max_length=80)
    description = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                Lower("name"), "organization", name="unique_expense_category_per_org_ci"
            )
        ]

    def __str__(self):
        return self.name


class Expense(TenantModel):
    POSTED = "posted"
    VOID = "void"
    STATUS_CHOICES = ((POSTED, "Posted"), (VOID, "Void"))

    expense_number = models.CharField(max_length=40)
    category = models.ForeignKey(
        ExpenseCategory, on_delete=models.PROTECT, related_name="expenses"
    )
    payment_method = models.ForeignKey(
        PaymentMethod, on_delete=models.PROTECT, related_name="expenses"
    )
    expense_date = models.DateField(default=timezone.localdate)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    vendor = models.CharField(max_length=120, blank=True)
    description = models.CharField(max_length=255)
    status = models.CharField(max_length=8, choices=STATUS_CHOICES, default=POSTED)
    voided_at = models.DateTimeField(blank=True, null=True)
    voided_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, blank=True, null=True, related_name="voided_expenses"
    )
    void_reason = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["-expense_date", "-id"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "expense_number"],
                name="unique_expense_number_per_org",
            ),
            models.CheckConstraint(
                condition=models.Q(amount__gt=0), name="expense_amount_positive"
            ),
        ]

    def save(self, *args, **kwargs):
        if not self.expense_number:
            self.expense_number = f"PENDING-{timezone.now().timestamp()}"
            super().save(*args, **kwargs)
            self.expense_number = f"EXP-{self.organization_id:04d}-{self.pk:06d}"
            super().save(update_fields=["expense_number"])
            return
        super().save(*args, **kwargs)

    def __str__(self):
        return self.expense_number


class CashReconciliation(TenantModel):
    payment_method = models.ForeignKey(
        PaymentMethod, on_delete=models.PROTECT, related_name="reconciliations"
    )
    business_date = models.DateField(default=timezone.localdate)
    opening_balance = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal("0.00")
    )
    counted_balance = models.DecimalField(max_digits=12, decimal_places=2)
    collections = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal("0.00"), editable=False
    )
    expenses = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal("0.00"), editable=False
    )
    expected_balance = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal("0.00"), editable=False
    )
    variance = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal("0.00"), editable=False
    )
    notes = models.CharField(max_length=255, blank=True)
    closed_at = models.DateTimeField(default=timezone.now)
    closed_by = models.ForeignKey(
        User, on_delete=models.PROTECT, related_name="cash_reconciliations"
    )

    class Meta:
        ordering = ["-business_date", "-id"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "payment_method", "business_date"],
                name="unique_daily_payment_method_reconciliation",
            ),
            models.CheckConstraint(
                condition=models.Q(opening_balance__gte=0),
                name="reconciliation_opening_non_negative",
            ),
            models.CheckConstraint(
                condition=models.Q(counted_balance__gte=0),
                name="reconciliation_counted_non_negative",
            ),
        ]

class OverdueReminder(TenantModel):
    EMAIL = "email"
    MANUAL = "manual"
    CHANNEL_CHOICES = ((EMAIL, "Email"), (MANUAL, "Manual"))
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"
    STATUS_CHOICES = ((PENDING, "Pending"), (SENT, "Sent"), (FAILED, "Failed"))

    invoice = models.ForeignKey(Invoice, on_delete=models.PROTECT, related_name="reminders")
    channel = models.CharField(max_length=8, choices=CHANNEL_CHOICES, default=EMAIL)
    message = models.TextField(blank=True)
    status = models.CharField(max_length=8, choices=STATUS_CHOICES, default=PENDING)
    sent_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ["-created_at"]
