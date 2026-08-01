from datetime import date, time

from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from user.models import ORG_STAFF, User

from .models import (
    Batch,
    Classs,
    Exam,
    ExamType,
    Organization,
    OrganizationMembership,
    Schedule,
    Subject,
    Teacher,
)


class TenantApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.org_a = Organization.objects.create(name="Alpha", slug="alpha")
        self.org_b = Organization.objects.create(name="Beta", slug="beta")
        self.staff = User.objects.create_user(
            email="alpha@example.com",
            password="Password123!",
            first_name="Alpha",
            last_name="Staff",
            phone="01710000001",
            role=ORG_STAFF,
            is_active=True,
        )
        OrganizationMembership.objects.create(
            organization=self.org_a, user=self.staff, is_default=True
        )
        self.class_a = Classs.objects.create(
            organization=self.org_a, name="Seven", numeric=7
        )
        self.class_b = Classs.objects.create(
            organization=self.org_b, name="Seven", numeric=7
        )
        self.subject_a = Subject.objects.create(
            organization=self.org_a, name="Math", code="MATH"
        )
        self.subject_b = Subject.objects.create(
            organization=self.org_b, name="Math", code="MATH"
        )
        self.batch_a = Batch.objects.create(
            organization=self.org_a,
            name="A batch",
            code="A1",
            classs=self.class_a,
        )
        self.batch_b = Batch.objects.create(
            organization=self.org_b,
            name="B batch",
            code="B1",
            classs=self.class_b,
        )
        self.client.force_authenticate(self.staff)

    def test_lists_and_details_are_tenant_scoped(self):
        response = self.client.get("/api/v1/organizations/classes")
        hidden = self.client.get(f"/api/v1/organizations/classes/{self.class_b.pk}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([row["id"] for row in response.data["results"]], [self.class_a.pk])
        self.assertEqual(hidden.status_code, status.HTTP_404_NOT_FOUND)

    def test_cross_tenant_relationship_is_rejected(self):
        response = self.client.post(
            "/api/v1/organizations/batches",
            {"name": "Invalid", "code": "INV", "classs": self.class_b.pk},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("classs", response.data)

    def test_platform_write_requires_explicit_organization(self):
        admin = User.objects.create_superuser(
            email="admin@example.com",
            password="Password123!",
            first_name="Platform",
            last_name="Admin",
            phone="01710000002",
        )
        self.client.force_authenticate(admin)

        response = self.client.post(
            "/api/v1/organizations/classes",
            {"name": "Eight", "numeric": 8},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("organization", response.data)


class ExamAndScheduleApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.organization = Organization.objects.create(name="Alpha", slug="alpha")
        self.staff = User.objects.create_user(
            email="staff@example.com",
            password="Password123!",
            first_name="Org",
            last_name="Staff",
            phone="01720000001",
            role=ORG_STAFF,
            is_active=True,
        )
        OrganizationMembership.objects.create(
            organization=self.organization, user=self.staff, is_default=True
        )
        classs = Classs.objects.create(
            organization=self.organization, name="Nine", numeric=9
        )
        self.batch = Batch.objects.create(
            organization=self.organization, name="Nine A", code="N9A", classs=classs
        )
        self.subject = Subject.objects.create(
            organization=self.organization, name="Science", code="SCI"
        )
        teacher_user = User.objects.create(
            email="teacher@example.com",
            first_name="Test",
            last_name="Teacher",
            phone="01720000002",
            role="teacher",
        )
        self.teacher = Teacher.objects.create(
            organization=self.organization, user=teacher_user
        )
        self.exam_type = ExamType.objects.create(
            organization=self.organization,
            name="Final",
            start_date=date(2026, 8, 1),
            end_date=date(2026, 8, 10),
            batch=self.batch,
        )
        self.exam = Exam.objects.create(
            organization=self.organization,
            exam_type=self.exam_type,
            subject=self.subject,
            name="Science final",
            date=date(2026, 8, 5),
            pass_mark=40,
            total_mark=100,
        )
        self.client.force_authenticate(self.staff)

    def schedule_payload(self, start="10:00:00", duration=60, title="Lesson"):
        return {
            "title": title,
            "subject": self.subject.pk,
            "teacher": self.teacher.pk,
            "batch": self.batch.pk,
            "duration": duration,
            "date": "2026-08-05",
            "time": start,
        }

    def test_exam_update_accepts_relationship_ids(self):
        response = self.client.patch(
            f"/api/v1/organizations/exams/{self.exam.pk}",
            {"exam_type": self.exam_type.pk, "subject": self.subject.pk, "pass_mark": 45},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.exam.refresh_from_db()
        self.assertEqual(self.exam.pass_mark, 45)

    def test_persisted_overlap_is_rejected_and_adjacent_succeeds(self):
        Schedule.objects.create(
            organization=self.organization,
            title="Existing",
            subject=self.subject,
            teacher=self.teacher,
            batch=self.batch,
            duration=60,
            date=date(2026, 8, 5),
            time=time(10, 0),
        )

        overlap = self.client.post(
            "/api/v1/organizations/schedules",
            [self.schedule_payload(start="10:30:00")],
            format="json",
        )
        adjacent = self.client.post(
            "/api/v1/organizations/schedules",
            [self.schedule_payload(start="11:00:00", title="Adjacent")],
            format="json",
        )

        self.assertEqual(overlap.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(adjacent.status_code, status.HTTP_201_CREATED)

    def test_conflict_inside_bulk_request_rolls_back_everything(self):
        response = self.client.post(
            "/api/v1/organizations/schedules",
            [
                self.schedule_payload(start="10:00:00", title="First"),
                self.schedule_payload(start="10:30:00", title="Second"),
            ],
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Schedule.objects.count(), 0)
