from datetime import date

from django.test import TestCase
from unittest.mock import patch
from rest_framework import status
from rest_framework.test import APIClient

from organization.models import (
    Batch,
    Classs,
    Exam,
    ExamType,
    Organization,
    OrganizationMembership,
    Subject,
)
from student.models import Enroll, Student, StudentGuardian
from user.models import GUARDIAN, ORG_ADMIN, STUDENT, User

from .models import ExamMark, Outcome, ResultPublication


class AssessmentWorkflowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.organization = Organization.objects.create(name="Alpha", slug="alpha")
        self.admin = User.objects.create_user(
            email="assessment-admin@example.com",
            password="Password123!",
            first_name="Assessment",
            last_name="Admin",
            phone="01730000001",
            role=ORG_ADMIN,
            is_active=True,
        )
        OrganizationMembership.objects.create(
            organization=self.organization, user=self.admin, is_default=True
        )
        classs = Classs.objects.create(
            organization=self.organization, name="Ten", numeric=10
        )
        self.batch = Batch.objects.create(
            organization=self.organization,
            name="Ten A",
            code="T10A",
            classs=classs,
        )
        self.subject = Subject.objects.create(
            organization=self.organization, name="Mathematics", code="MATH"
        )
        self.exam_type = ExamType.objects.create(
            organization=self.organization,
            name="Final 2026",
            start_date=date(2026, 8, 1),
            end_date=date(2026, 8, 10),
            batch=self.batch,
        )
        self.exam = Exam.objects.create(
            organization=self.organization,
            exam_type=self.exam_type,
            subject=self.subject,
            name="Mathematics final",
            date=date(2026, 8, 2),
            pass_mark=40,
            total_mark=100,
        )
        self.students = []
        for index in range(2):
            user = User.objects.create_user(
                email=f"assessment-student-{index}@example.com",
                password="Password123!",
                first_name=f"Student{index}",
                last_name="Example",
                phone=f"0173000001{index + 2}",
                role=STUDENT,
                is_active=True,
            )
            student = Student.objects.create(
                organization=self.organization, user=user
            )
            Enroll.objects.create(
                organization=self.organization,
                student=student,
                batch=self.batch,
                total_amount=1000,
            )
            self.students.append(student)
        self.client.force_authenticate(self.admin)

    def create_grade_scale(self):
        response = self.client.post(
            "/api/v1/assessments/grade-scales",
            {
                "name": "Default",
                "is_default": True,
                "bands": [
                    {
                        "minimum_percentage": "0.00",
                        "maximum_percentage": "59.99",
                        "grade": "F",
                        "grade_point": "0.00",
                    },
                    {
                        "minimum_percentage": "60.00",
                        "maximum_percentage": "100.00",
                        "grade": "A",
                        "grade_point": "4.00",
                    },
                ],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        return response.data["id"]

    def prepare_verified_marks(self):
        generated = self.client.post(
            f"/api/v1/assessments/exam-types/{self.exam_type.pk}/candidates/generate"
        )
        self.assertEqual(generated.status_code, status.HTTP_201_CREATED)
        candidates = generated.data["candidates"]
        saved = self.client.put(
            f"/api/v1/assessments/exams/{self.exam.pk}/marks",
            [
                {
                    "candidate": candidate["id"],
                    "attendance_status": "present",
                    "obtained_mark": 80 - index * 20,
                    "remark": "",
                }
                for index, candidate in enumerate(candidates)
            ],
            format="json",
        )
        self.assertEqual(saved.status_code, status.HTTP_200_OK, saved.data)
        submitted = self.client.post(
            f"/api/v1/assessments/exams/{self.exam.pk}/marks/submit"
        )
        verified = self.client.post(
            f"/api/v1/assessments/exams/{self.exam.pk}/marks/verify"
        )
        self.assertEqual(submitted.status_code, status.HTTP_200_OK)
        self.assertEqual(verified.status_code, status.HTTP_200_OK)

    def test_complete_mark_review_and_publication_workflow(self):
        grade_scale_id = self.create_grade_scale()
        self.prepare_verified_marks()

        review = self.client.get(
            f"/api/v1/assessments/exam-types/{self.exam_type.pk}/review"
        )
        published = self.client.post(
            f"/api/v1/assessments/exam-types/{self.exam_type.pk}/publish",
            {"grade_scale": grade_scale_id, "show_rank": True},
            format="json",
        )

        self.assertTrue(review.data["ready_to_publish"])
        self.assertEqual(published.status_code, status.HTTP_201_CREATED, published.data)
        self.assertEqual(Outcome.objects.count(), 2)
        self.assertEqual(ResultPublication.objects.count(), 1)
        self.assertEqual(
            list(Outcome.objects.order_by("rank").values_list("rank", flat=True)),
            [1, 2],
        )

        locked = self.client.put(
            f"/api/v1/assessments/exams/{self.exam.pk}/marks",
            [
                {
                    "candidate": self.exam_type.candidates.first().pk,
                    "attendance_status": "present",
                    "obtained_mark": 90,
                }
            ],
            format="json",
        )
        self.assertEqual(locked.status_code, status.HTTP_400_BAD_REQUEST)

    def test_student_and_guardian_only_see_authorized_published_results(self):
        grade_scale_id = self.create_grade_scale()
        self.prepare_verified_marks()
        self.client.post(
            f"/api/v1/assessments/exam-types/{self.exam_type.pk}/publish",
            {"grade_scale": grade_scale_id},
            format="json",
        )
        guardian = User.objects.create_user(
            email="guardian@example.com",
            password="Password123!",
            first_name="Guardian",
            last_name="One",
            phone="01730000020",
            role=GUARDIAN,
            is_active=True,
        )
        StudentGuardian.objects.create(
            organization=self.organization,
            student=self.students[0],
            guardian=guardian,
        )

        self.client.force_authenticate(self.students[0].user)
        own = self.client.get("/api/v1/assessments/my-outcomes")
        self.assertEqual(own.status_code, status.HTTP_200_OK)
        self.assertEqual(len(own.data), 1)
        self.assertEqual(own.data[0]["student"]["id"], self.students[0].pk)
        self.assertIsNone(own.data[0]["rank"])

        self.client.force_authenticate(guardian)
        children = self.client.get("/api/v1/assessments/my-children")
        allowed = self.client.get(
            f"/api/v1/assessments/my-children/{self.students[0].pk}/outcomes"
        )
        denied = self.client.get(
            f"/api/v1/assessments/my-children/{self.students[1].pk}/outcomes"
        )
        self.assertEqual(len(children.data), 1)
        self.assertEqual(len(allowed.data), 1)
        self.assertEqual(denied.status_code, status.HTTP_404_NOT_FOUND)

    def test_reopen_preserves_snapshot_and_resets_marks(self):
        grade_scale_id = self.create_grade_scale()
        self.prepare_verified_marks()
        published = self.client.post(
            f"/api/v1/assessments/exam-types/{self.exam_type.pk}/publish",
            {"grade_scale": grade_scale_id},
            format="json",
        )
        reopened = self.client.post(
            f"/api/v1/assessments/publications/{published.data['id']}/reopen"
        )
        self.assertEqual(reopened.status_code, status.HTTP_200_OK)
        self.assertFalse(
            ResultPublication.objects.filter(status="published").exists()
        )
        self.assertEqual(
            set(ExamMark.objects.values_list("workflow_status", flat=True)),
            {ExamMark.DRAFT},
        )
        self.assertEqual(Outcome.objects.count(), 2)

    @patch("student.serializers.send_email.delay")
    def test_staff_can_link_and_invite_guardian(self, send_email):
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.post(
                f"/api/v1/students/{self.students[0].student_id}/guardians",
                {
                    "first_name": "Parent",
                    "last_name": "Example",
                    "email": "invited-parent@example.com",
                    "phone": "01730000030",
                    "relationship": "mother",
                    "is_primary": True,
                    "result_email_enabled": True,
                },
                format="json",
            )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        link = StudentGuardian.objects.get(student=self.students[0])
        self.assertEqual(link.guardian.role, GUARDIAN)
        self.assertTrue(link.guardian.password_reset_token)
        self.assertTrue(
            OrganizationMembership.objects.filter(
                organization=self.organization, user=link.guardian
            ).exists()
        )
        send_email.assert_called_once()
