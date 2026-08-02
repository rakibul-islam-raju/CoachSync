from decimal import Decimal

from django.db import transaction
from django.db.models import Case, DecimalField, F, Sum, Value, When
from django.db.models.functions import Coalesce
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response
from rest_framework.views import APIView

from organization.tenancy import TenantQuerysetMixin, resolve_request_organization
from student.models import Enroll, Transaction
from user.permissions import IsOrgStaff
from utilities.tasks import send_email

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
from .serializers import (
    CashReconciliationSerializer,
    ExpenseCategorySerializer,
    ExpenseSerializer,
    ExpenseVoidSerializer,
    FinanceSummarySerializer,
    InstallmentSerializer,
    InvoiceSerializer,
    OverdueReminderSerializer,
    PaymentMethodSerializer,
    ScholarshipAwardSerializer,
    ScholarshipSerializer,
)


class TenantModelViewSet(TenantQuerysetMixin, viewsets.ModelViewSet):
    permission_classes = [IsOrgStaff]

    def perform_create(self, serializer):
        organization = resolve_request_organization(
            self.request, data=self.request.data, write=True
        )
        serializer.save(organization=organization, created_by=self.request.user)

    def perform_update(self, serializer):
        organization = resolve_request_organization(
            self.request, data=self.request.data, write=True
        )
        serializer.save(organization=organization)


class PaymentMethodViewSet(TenantModelViewSet):
    queryset = PaymentMethod.objects.all()
    serializer_class = PaymentMethodSerializer
    filterset_fields = ["method_type", "is_active"]
    search_fields = ["name"]
    ordering_fields = ["name", "created_at"]


class ScholarshipViewSet(TenantModelViewSet):
    queryset = Scholarship.objects.all()
    serializer_class = ScholarshipSerializer
    filterset_fields = ["discount_type", "is_active"]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "value", "created_at"]


class ScholarshipAwardViewSet(TenantModelViewSet):
    queryset = ScholarshipAward.objects.select_related(
        "scholarship", "enroll__student__user", "enroll__batch"
    )
    serializer_class = ScholarshipAwardSerializer
    filterset_fields = ["scholarship", "enroll", "awarded_on"]
    search_fields = [
        "scholarship__name",
        "enroll__student__student_id",
        "enroll__student__user__first_name",
        "enroll__student__user__last_name",
    ]
    ordering_fields = ["awarded_on", "amount", "created_at"]

    def destroy(self, request, *args, **kwargs):
        raise ValidationError("Scholarship awards preserve financial history and cannot be deleted.")


class InvoiceViewSet(TenantModelViewSet):
    queryset = Invoice.objects.select_related(
        "enroll__student__user", "enroll__batch", "organization"
    ).prefetch_related("installments__transactions")
    serializer_class = InvoiceSerializer
    filterset_fields = ["enroll", "issue_date", "due_date"]
    search_fields = [
        "invoice_number",
        "enroll__student__student_id",
        "enroll__student__user__first_name",
        "enroll__student__user__last_name",
        "enroll__batch__name",
    ]
    ordering_fields = ["invoice_number", "issue_date", "due_date", "created_at"]

    def destroy(self, request, *args, **kwargs):
        raise ValidationError("Invoices preserve financial history and cannot be deleted.")


class InstallmentViewSet(TenantModelViewSet):
    queryset = Installment.objects.select_related("invoice", "invoice__enroll").prefetch_related(
        "transactions"
    )
    serializer_class = InstallmentSerializer
    filterset_fields = ["invoice", "due_date"]
    search_fields = ["title", "invoice__invoice_number"]
    ordering_fields = ["sequence", "due_date", "amount"]


class ExpenseCategoryViewSet(TenantModelViewSet):
    queryset = ExpenseCategory.objects.all()
    serializer_class = ExpenseCategorySerializer
    filterset_fields = ["is_active"]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at"]


class ExpenseViewSet(TenantModelViewSet):
    queryset = Expense.objects.select_related("category", "payment_method")
    serializer_class = ExpenseSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["category", "payment_method", "expense_date", "status"]
    search_fields = ["expense_number", "vendor", "description", "category__name"]
    ordering_fields = ["expense_date", "amount", "created_at"]

    def update(self, request, *args, **kwargs):
        raise ValidationError("Posted expenses are immutable; void and re-enter corrections.")

    def destroy(self, request, *args, **kwargs):
        raise ValidationError("Expenses preserve financial history and cannot be deleted.")

    @action(detail=True, methods=["post"])
    def void(self, request, pk=None):
        expense = self.get_object()
        if expense.status == Expense.VOID:
            raise ValidationError("This expense is already void.")
        serializer = ExpenseVoidSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        expense.status = Expense.VOID
        expense.voided_at = timezone.now()
        expense.voided_by = request.user
        expense.void_reason = serializer.validated_data["reason"]
        expense.save(
            update_fields=["status", "voided_at", "voided_by", "void_reason", "updated_at"]
        )
        return Response(self.get_serializer(expense).data)


class CashReconciliationViewSet(TenantModelViewSet):
    http_method_names = ["get", "post", "head", "options"]
    queryset = CashReconciliation.objects.select_related("payment_method", "closed_by")
    serializer_class = CashReconciliationSerializer
    filterset_fields = ["payment_method", "business_date"]
    ordering_fields = ["business_date", "created_at"]

    def perform_create(self, serializer):
        organization = resolve_request_organization(
            self.request, data=self.request.data, write=True
        )
        method = serializer.validated_data["payment_method"]
        business_date = serializer.validated_data["business_date"]
        opening = serializer.validated_data["opening_balance"]
        counted = serializer.validated_data["counted_balance"]
        money = DecimalField(max_digits=12, decimal_places=2)
        collections = Transaction.objects.filter(
            organization=organization,
            payment_method=method,
            created_at__date=business_date,
        ).aggregate(
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
        expense_total = Expense.objects.filter(
            organization=organization,
            payment_method=method,
            expense_date=business_date,
            status=Expense.POSTED,
        ).aggregate(
            total=Coalesce(Sum("amount"), Value(Decimal("0.00")), output_field=money)
        )["total"]
        expected = opening + collections - expense_total
        serializer.save(
            organization=organization,
            created_by=self.request.user,
            closed_by=self.request.user,
            collections=collections,
            expenses=expense_total,
            expected_balance=expected,
            variance=counted - expected,
        )


class OverdueReminderViewSet(TenantModelViewSet):
    http_method_names = ["get", "post", "head", "options"]
    queryset = OverdueReminder.objects.select_related(
        "invoice__enroll__student__user"
    )
    serializer_class = OverdueReminderSerializer
    filterset_fields = ["invoice", "channel", "status"]
    ordering_fields = ["created_at", "sent_at"]

    @action(detail=True, methods=["post"])
    def send(self, request, pk=None):
        reminder = self.get_object()
        if reminder.status == OverdueReminder.SENT:
            raise ValidationError("This reminder has already been sent.")
        invoice = reminder.invoice
        if invoice.balance <= 0:
            raise ValidationError("The invoice is already paid.")
        if reminder.channel == OverdueReminder.EMAIL:
            student = invoice.enroll.student
            message = reminder.message or (
                f"Payment reminder for {invoice.invoice_number}. "
                f"The outstanding balance is {invoice.balance} and was due on {invoice.due_date}."
            )
            try:
                send_email.delay(
                    subject=f"Payment reminder: {invoice.invoice_number}",
                    plain_message=message,
                    html_content=f"<p>{message}</p>",
                    to_email=[student.user.email],
                )
            except Exception as exc:
                reminder.status = OverdueReminder.FAILED
                reminder.save(update_fields=["status", "updated_at"])
                raise ValidationError("The reminder could not be queued.") from exc
        reminder.status = OverdueReminder.SENT
        reminder.sent_at = timezone.now()
        reminder.save(update_fields=["status", "sent_at", "updated_at"])
        return Response(self.get_serializer(reminder).data)


class FinanceSummaryView(APIView):
    permission_classes = [IsOrgStaff]
    serializer_class = FinanceSummarySerializer

    def get(self, request):
        organization = resolve_request_organization(request)
        enrollments = Enroll.with_financials().filter(status=Enroll.ACTIVE)
        transactions = Transaction.objects.all()
        expenses = Expense.objects.filter(status=Expense.POSTED)
        invoices = Invoice.objects.select_related("enroll")
        if organization is not None:
            enrollments = enrollments.filter(organization=organization)
            transactions = transactions.filter(organization=organization)
            expenses = expenses.filter(organization=organization)
            invoices = invoices.filter(organization=organization)

        money = DecimalField(max_digits=12, decimal_places=2)
        outstanding = enrollments.aggregate(
            total=Coalesce(Sum("balance_amount"), Value(Decimal("0.00")), output_field=money)
        )["total"]
        revenue = transactions.aggregate(
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
        expense_total = expenses.aggregate(
            total=Coalesce(Sum("amount"), Value(Decimal("0.00")), output_field=money)
        )["total"]
        overdue_count = sum(
            1
            for invoice in invoices
            if invoice.due_date < timezone.localdate() and invoice.balance > 0
        )
        return Response(
            {
                "invoiced": str(sum((row.net_payable for row in enrollments), Decimal("0.00"))),
                "collected": str(revenue),
                "outstanding": str(outstanding),
                "expenses": str(expense_total),
                "net_cash": str(revenue - expense_total),
                "overdue_invoices": overdue_count,
            }
        )
