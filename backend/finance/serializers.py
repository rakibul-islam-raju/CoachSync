from decimal import Decimal

from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from organization.tenancy import resolve_request_organization, validate_same_organization

from .models import (
    CashReconciliation,
    Expense,
    ExpenseCategory,
    Installment,
    Invoice,
    OverdueReminder,
    PaymentMethod,
    Scholarship,
    ScholarshipAward,
)


def organization_for(serializer, attrs):
    request = serializer.context.get("request")
    if not request:
        return attrs.get("organization") or getattr(serializer.instance, "organization", None)
    organization = resolve_request_organization(request, data=serializer.initial_data, write=True)
    supplied = attrs.get("organization")
    if supplied and supplied != organization:
        raise serializers.ValidationError(
            {"organization": "You cannot write to another organization."}
        )
    return organization


class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = "__all__"
        read_only_fields = ["id", "organization", "created_by", "created_at", "updated_at"]


class ScholarshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scholarship
        fields = "__all__"
        read_only_fields = ["id", "organization", "created_by", "created_at", "updated_at"]

    def validate(self, attrs):
        discount_type = attrs.get(
            "discount_type", getattr(self.instance, "discount_type", None)
        )
        value = attrs.get("value", getattr(self.instance, "value", None))
        if discount_type == Scholarship.PERCENTAGE and value and value > 100:
            raise serializers.ValidationError({"value": "Percentage cannot exceed 100."})
        start = attrs.get("valid_from", getattr(self.instance, "valid_from", None))
        end = attrs.get("valid_until", getattr(self.instance, "valid_until", None))
        if start and end and start > end:
            raise serializers.ValidationError({"valid_until": "Must be on or after valid from."})
        return attrs


class ScholarshipAwardSerializer(serializers.ModelSerializer):
    scholarship_name = serializers.CharField(source="scholarship.name", read_only=True)
    student_id = serializers.CharField(source="enroll.student.student_id", read_only=True)
    student_name = serializers.CharField(source="enroll.student.user.full_name", read_only=True)
    batch_name = serializers.CharField(source="enroll.batch.name", read_only=True)

    class Meta:
        model = ScholarshipAward
        fields = "__all__"
        read_only_fields = [
            "id",
            "organization",
            "amount",
            "created_by",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        organization = organization_for(self, attrs)
        scholarship = attrs.get("scholarship", getattr(self.instance, "scholarship", None))
        enroll = attrs.get("enroll", getattr(self.instance, "enroll", None))
        validate_same_organization(
            organization, scholarship=scholarship, enroll=enroll
        )
        if enroll and enroll.status != "active":
            raise serializers.ValidationError({"enroll": "Cancelled enrollments cannot receive awards."})
        if scholarship and enroll:
            if scholarship.valid_from and scholarship.valid_from > timezone.localdate():
                raise serializers.ValidationError({"scholarship": "This scholarship is not active yet."})
            if scholarship.valid_until and scholarship.valid_until < timezone.localdate():
                raise serializers.ValidationError({"scholarship": "This scholarship has expired."})
            amount = (
                enroll.total_amount * scholarship.value / Decimal("100.00")
                if scholarship.discount_type == Scholarship.PERCENTAGE
                else scholarship.value
            ).quantize(Decimal("0.01"))
            if amount > enroll.total_amount:
                raise serializers.ValidationError(
                    {"scholarship": "The award cannot exceed the enrollment total."}
                )
            if enroll.total_amount - amount < enroll.total_paid:
                raise serializers.ValidationError(
                    {"scholarship": "The award would make recorded payments exceed the payable amount."}
                )
            attrs["amount"] = amount
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        award = super().create(validated_data)
        award.enroll.discount_amount = award.amount
        award.enroll.save(update_fields=["discount_amount", "updated_at"])
        return award

    @transaction.atomic
    def update(self, instance, validated_data):
        award = super().update(instance, validated_data)
        award.enroll.discount_amount = award.amount
        award.enroll.save(update_fields=["discount_amount", "updated_at"])
        return award


class InstallmentSerializer(serializers.ModelSerializer):
    paid = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    status = serializers.CharField(read_only=True)

    class Meta:
        model = Installment
        fields = "__all__"
        read_only_fields = ["id", "organization", "created_by", "created_at", "updated_at"]

    def validate(self, attrs):
        organization = organization_for(self, attrs)
        invoice = attrs.get("invoice", getattr(self.instance, "invoice", None))
        validate_same_organization(organization, invoice=invoice)
        if invoice:
            amount = attrs.get("amount", getattr(self.instance, "amount", Decimal("0.00")))
            allocated = sum(
                invoice.installments.exclude(pk=getattr(self.instance, "pk", None)).values_list(
                    "amount", flat=True
                ),
                Decimal("0.00"),
            )
            if allocated + amount > invoice.total:
                raise serializers.ValidationError(
                    {"amount": "Installments cannot exceed the invoice total."}
                )
            due_date = attrs.get("due_date", getattr(self.instance, "due_date", None))
            if due_date and due_date < invoice.issue_date:
                raise serializers.ValidationError(
                    {"due_date": "Installment cannot be due before the invoice issue date."}
                )
        return attrs


class InvoiceSerializer(serializers.ModelSerializer):
    total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    paid = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    status = serializers.CharField(read_only=True)
    student_id = serializers.CharField(source="enroll.student.student_id", read_only=True)
    student_name = serializers.CharField(source="enroll.student.user.full_name", read_only=True)
    student_email = serializers.EmailField(source="enroll.student.user.email", read_only=True)
    batch_name = serializers.CharField(source="enroll.batch.name", read_only=True)
    installments = InstallmentSerializer(many=True, read_only=True)

    class Meta:
        model = Invoice
        fields = "__all__"
        read_only_fields = [
            "id",
            "organization",
            "invoice_number",
            "created_by",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        organization = organization_for(self, attrs)
        enroll = attrs.get("enroll", getattr(self.instance, "enroll", None))
        if self.instance and enroll != self.instance.enroll:
            raise serializers.ValidationError(
                {"enroll": "An issued invoice cannot be moved to another enrollment."}
            )
        validate_same_organization(organization, enroll=enroll)
        issue = attrs.get("issue_date", getattr(self.instance, "issue_date", None))
        due = attrs.get("due_date", getattr(self.instance, "due_date", None))
        if issue and due and issue > due:
            raise serializers.ValidationError({"due_date": "Must be on or after issue date."})
        return attrs


class ExpenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = "__all__"
        read_only_fields = ["id", "organization", "created_by", "created_at", "updated_at"]


class ExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    payment_method_name = serializers.CharField(source="payment_method.name", read_only=True)

    class Meta:
        model = Expense
        fields = "__all__"
        read_only_fields = [
            "id",
            "organization",
            "expense_number",
            "status",
            "voided_at",
            "voided_by",
            "void_reason",
            "created_by",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        organization = organization_for(self, attrs)
        validate_same_organization(
            organization,
            category=attrs.get("category", getattr(self.instance, "category", None)),
            payment_method=attrs.get(
                "payment_method", getattr(self.instance, "payment_method", None)
            ),
        )
        return attrs


class ExpenseVoidSerializer(serializers.Serializer):
    reason = serializers.CharField(max_length=255)


class CashReconciliationSerializer(serializers.ModelSerializer):
    payment_method_name = serializers.CharField(source="payment_method.name", read_only=True)
    collections = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    expenses = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    expected_balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    variance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = CashReconciliation
        fields = "__all__"
        read_only_fields = [
            "id",
            "organization",
            "closed_at",
            "closed_by",
            "collections",
            "expenses",
            "expected_balance",
            "variance",
            "created_by",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        organization = organization_for(self, attrs)
        method = attrs.get("payment_method")
        validate_same_organization(organization, payment_method=method)
        if method and not method.is_active:
            raise serializers.ValidationError({"payment_method": "Select an active method."})
        return attrs


class OverdueReminderSerializer(serializers.ModelSerializer):
    invoice_number = serializers.CharField(source="invoice.invoice_number", read_only=True)
    student_name = serializers.CharField(
        source="invoice.enroll.student.user.full_name", read_only=True
    )

    class Meta:
        model = OverdueReminder
        fields = "__all__"
        read_only_fields = [
            "id",
            "organization",
            "status",
            "sent_at",
            "created_by",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        organization = organization_for(self, attrs)
        invoice = attrs.get("invoice")
        validate_same_organization(organization, invoice=invoice)
        if invoice and (invoice.balance <= 0 or invoice.status == "cancelled"):
            raise serializers.ValidationError({"invoice": "This invoice has no collectible balance."})
        if invoice and invoice.due_date >= timezone.localdate():
            raise serializers.ValidationError({"invoice": "Only overdue invoices can be reminded."})
        return attrs


class FinanceSummarySerializer(serializers.Serializer):
    invoiced = serializers.DecimalField(max_digits=14, decimal_places=2)
    collected = serializers.DecimalField(max_digits=14, decimal_places=2)
    outstanding = serializers.DecimalField(max_digits=14, decimal_places=2)
    expenses = serializers.DecimalField(max_digits=14, decimal_places=2)
    net_cash = serializers.DecimalField(max_digits=14, decimal_places=2)
    overdue_invoices = serializers.IntegerField()
