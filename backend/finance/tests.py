from datetime import timedelta
from decimal import Decimal

from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from organization.models import Batch, Classs, Organization, OrganizationMembership
from student.models import Enroll, Student, Transaction
from user.models import User

from .models import Expense, ExpenseCategory, Invoice, PaymentMethod


class FinanceApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.organization = Organization.objects.create(name="Alpha", slug="alpha-finance")
        self.other_organization = Organization.objects.create(name="Beta", slug="beta-finance")
        self.staff = User.objects.create_user(
            email="finance-staff@example.com",
            password="Password123!",
            first_name="Finance",
            last_name="Staff",
            phone="01740000001",
            role="org_staff",
            is_active=True,
        )
        OrganizationMembership.objects.create(
            organization=self.organization, user=self.staff, is_default=True
        )
        classs = Classs.objects.create(
            organization=self.organization, name="Eleven", numeric=11
        )
        batch = Batch.objects.create(
            organization=self.organization, name="Eleven A", code="E11A", classs=classs
        )
        student_user = User.objects.create(
            email="finance-student@example.com",
            first_name="Finance",
            last_name="Student",
            phone="01740000002",
            role="student",
        )
        student = Student.objects.create(
            organization=self.organization, user=student_user
        )
        self.enroll = Enroll.objects.create(
            organization=self.organization,
            student=student,
            batch=batch,
            total_amount=Decimal("1000.00"),
            created_by=self.staff,
        )
        self.client.force_authenticate(self.staff)

    def test_enrollment_creates_invoice_and_organization_gets_manual_methods(self):
        self.assertTrue(Invoice.objects.filter(enroll=self.enroll).exists())
        self.assertEqual(
            set(
                PaymentMethod.objects.filter(organization=self.organization).values_list(
                    "method_type", flat=True
                )
            ),
            {"cash", "bank", "mobile"},
        )

    def test_finance_lists_are_tenant_scoped(self):
        PaymentMethod.objects.create(
            organization=self.other_organization, name="Other method", method_type="other"
        )
        response = self.client.get("/api/v1/finance/payment-methods")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn(
            "Other method", [method["name"] for method in response.data["results"]]
        )

    def test_scholarship_award_updates_enrollment_discount(self):
        scholarship = self.client.post(
            "/api/v1/finance/scholarships",
            {"name": "Merit 25", "discount_type": "percentage", "value": "25.00"},
            format="json",
        )
        award = self.client.post(
            "/api/v1/finance/scholarship-awards",
            {"scholarship": scholarship.data["id"], "enroll": self.enroll.id},
            format="json",
        )

        self.assertEqual(award.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Decimal(award.data["amount"]), Decimal("250.00"))
        self.enroll.refresh_from_db()
        self.assertEqual(self.enroll.discount_amount, Decimal("250.00"))
        self.assertEqual(self.enroll.balance, Decimal("750.00"))

    def test_installment_payment_records_method_and_rejects_over_allocation(self):
        invoice = self.enroll.invoice
        installment = self.client.post(
            "/api/v1/finance/installments",
            {
                "invoice": invoice.id,
                "title": "First installment",
                "sequence": 1,
                "due_date": invoice.due_date,
                "amount": "400.00",
            },
            format="json",
        )
        payment = self.client.post(
            f"/api/v1/students/enrolls/{self.enroll.id}/transactions",
            {
                "amount": "300.00",
                "payment_method": PaymentMethod.objects.get(
                    organization=self.organization, method_type="cash"
                ).id,
                "installment": installment.data["id"],
                "reference_number": "CASH-001",
            },
            format="json",
        )
        overpayment = self.client.post(
            f"/api/v1/students/enrolls/{self.enroll.id}/transactions",
            {"amount": "101.00", "installment": installment.data["id"]},
            format="json",
        )

        self.assertEqual(payment.status_code, status.HTTP_201_CREATED)
        self.assertEqual(payment.data["reference_number"], "CASH-001")
        self.assertEqual(overpayment.status_code, status.HTTP_400_BAD_REQUEST)

    def test_expense_void_and_reconciliation_use_posted_cash_movements(self):
        cash = PaymentMethod.objects.get(
            organization=self.organization, method_type="cash"
        )
        category = ExpenseCategory.objects.create(
            organization=self.organization, name="Rent"
        )
        Transaction.objects.create(
            organization=self.organization,
            enroll=self.enroll,
            amount=Decimal("300.00"),
            payment_method=cash,
        )
        expense = self.client.post(
            "/api/v1/finance/expenses",
            {
                "category": category.id,
                "payment_method": cash.id,
                "expense_date": timezone.localdate(),
                "amount": "50.00",
                "description": "Monthly room rent",
            },
            format="json",
        )
        reconciliation = self.client.post(
            "/api/v1/finance/reconciliations",
            {
                "payment_method": cash.id,
                "business_date": timezone.localdate(),
                "opening_balance": "100.00",
                "counted_balance": "360.00",
            },
            format="json",
        )

        self.assertEqual(expense.status_code, status.HTTP_201_CREATED)
        self.assertEqual(reconciliation.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Decimal(reconciliation.data["expected_balance"]), Decimal("350.00"))
        self.assertEqual(Decimal(reconciliation.data["variance"]), Decimal("10.00"))

        voided = self.client.post(
            f"/api/v1/finance/expenses/{expense.data['id']}/void",
            {"reason": "Duplicate entry"},
            format="json",
        )
        self.assertEqual(voided.status_code, status.HTTP_200_OK)
        self.assertEqual(voided.data["status"], Expense.VOID)

    def test_manual_overdue_reminder_preserves_audit_record(self):
        invoice = self.enroll.invoice
        invoice.issue_date = timezone.localdate() - timedelta(days=10)
        invoice.due_date = timezone.localdate() - timedelta(days=1)
        invoice.save()
        reminder = self.client.post(
            "/api/v1/finance/reminders",
            {"invoice": invoice.id, "channel": "manual", "message": "Called guardian"},
            format="json",
        )
        sent = self.client.post(
            f"/api/v1/finance/reminders/{reminder.data['id']}/send", {}, format="json"
        )

        self.assertEqual(reminder.status_code, status.HTTP_201_CREATED)
        self.assertEqual(sent.status_code, status.HTTP_200_OK)
        self.assertEqual(sent.data["status"], "sent")
        self.assertIsNotNone(sent.data["sent_at"])

