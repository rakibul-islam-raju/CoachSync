from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from user.models import User
from organization.models import (
    Batch,
    Classs,
    Organization,
    OrganizationMembership,
)

from .models import Enroll, Student, Transaction


class StudentIdentifierApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.staff = User.objects.create_user(
            email="orgstaff@example.com",
            password="ExistingPass123!",
            first_name="Org",
            last_name="Staff",
            phone="01700000002",
            role="org_staff",
            is_active=True,
        )
        student_user = User.objects.create(
            email="student@example.com",
            first_name="Test",
            last_name="Student",
            phone="01700000003",
            role="student",
        )
        self.student = Student.objects.create(
            user=student_user,
            address="Old address",
            created_by=self.staff,
        )
        self.client.force_authenticate(self.staff)

    def test_student_can_be_partially_updated_by_student_id(self):
        response = self.client.patch(
            f"/api/v1/students/{self.student.student_id}",
            {"address": "New address"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.student.refresh_from_db()
        self.assertEqual(self.student.address, "New address")

    def test_student_can_be_deleted_by_student_id(self):
        response = self.client.delete(
            f"/api/v1/students/{self.student.student_id}",
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Student.objects.filter(pk=self.student.pk).exists())


class EnrollmentLedgerApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.organization = Organization.objects.create(name="Alpha", slug="alpha")
        self.other_organization = Organization.objects.create(name="Beta", slug="beta")
        self.staff = User.objects.create_user(
            email="finance@example.com",
            password="Password123!",
            first_name="Finance",
            last_name="Staff",
            phone="01730000001",
            role="org_staff",
            is_active=True,
        )
        OrganizationMembership.objects.create(
            organization=self.organization, user=self.staff, is_default=True
        )
        classs = Classs.objects.create(
            organization=self.organization, name="Ten", numeric=10
        )
        self.batch = Batch.objects.create(
            organization=self.organization, name="Ten A", code="T10A", classs=classs
        )
        student_user = User.objects.create(
            email="ledger-student@example.com",
            first_name="Ledger",
            last_name="Student",
            phone="01730000002",
            role="student",
        )
        self.student = Student.objects.create(
            organization=self.organization, user=student_user
        )
        self.enroll = Enroll.objects.create(
            organization=self.organization,
            student=self.student,
            batch=self.batch,
            total_amount=1000,
            discount_amount=200,
        )
        other_class = Classs.objects.create(
            organization=self.other_organization, name="Ten", numeric=10
        )
        self.other_batch = Batch.objects.create(
            organization=self.other_organization,
            name="Other",
            code="O10",
            classs=other_class,
        )
        self.client.force_authenticate(self.staff)

    def test_enrollment_update_excludes_current_instance(self):
        response = self.client.patch(
            f"/api/v1/students/enrolls/{self.enroll.pk}",
            {"discount_amount": 250},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_cross_tenant_batch_is_rejected(self):
        response = self.client.patch(
            f"/api/v1/students/enrolls/{self.enroll.pk}",
            {"batch": self.other_batch.pk},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("batch", response.data)

    def test_nested_url_controls_transaction_enrollment_and_overpayment_fails(self):
        other_enroll = Enroll.objects.create(
            organization=self.organization,
            student=self.student,
            batch=Batch.objects.create(
                organization=self.organization,
                name="Ten B",
                code="T10B",
                classs=self.batch.classs,
            ),
            total_amount=500,
        )
        payment = self.client.post(
            f"/api/v1/students/enrolls/{self.enroll.pk}/transactions",
            {"enroll": other_enroll.pk, "amount": 300},
            format="json",
        )
        overpayment = self.client.post(
            f"/api/v1/students/enrolls/{self.enroll.pk}/transactions",
            {"amount": 501},
            format="json",
        )

        self.assertEqual(payment.status_code, status.HTTP_201_CREATED)
        self.assertEqual(payment.data["enroll"], self.enroll.pk)
        self.assertEqual(overpayment.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reversal_preserves_history_and_restores_balance(self):
        payment = Transaction.objects.create(
            organization=self.organization,
            enroll=self.enroll,
            amount=500,
            transaction_type=Transaction.PAYMENT,
        )

        response = self.client.post(
            f"/api/v1/students/enrolls/{self.enroll.pk}/transactions/{payment.pk}/reverse",
            {"remark": "Entered against the wrong receipt", "replacement_amount": 300},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(self.enroll.total_paid, 300)
        self.assertEqual(self.enroll.net_payable, 800)
        self.assertEqual(self.enroll.balance, 500)
        self.assertEqual(self.enroll.transactions.count(), 3)

    def test_cancelled_enrollment_rejects_new_payments(self):
        cancel = self.client.post(
            f"/api/v1/students/enrolls/{self.enroll.pk}/cancel",
            {"reason": "Student withdrew"},
            format="json",
        )
        payment = self.client.post(
            f"/api/v1/students/enrolls/{self.enroll.pk}/transactions",
            {"amount": 100},
            format="json",
        )

        self.assertEqual(cancel.status_code, status.HTTP_200_OK)
        self.assertEqual(payment.status_code, status.HTTP_400_BAD_REQUEST)
