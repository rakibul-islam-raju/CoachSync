from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from user.models import User

from .models import Student


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
