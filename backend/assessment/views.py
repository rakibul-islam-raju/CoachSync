from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from organization.models import Exam, ExamType
from organization.tenancy import TenantQuerysetMixin, resolve_request_organization
from student.models import Enroll, Student, StudentGuardian
from user.models import GUARDIAN, STUDENT
from user.permissions import IsOrgAdmin, IsOrgStaff

from .models import (
    ExamCandidate,
    ExamMark,
    GradeScale,
    Outcome,
    ResultPublication,
)
from .serializers import (
    AssessmentReviewSerializer,
    ChildSerializer,
    CountSerializer,
    DetailSerializer,
    ExamCandidateSerializer,
    ExamMarkInputSerializer,
    GradeScaleSerializer,
    OutcomeSerializer,
    PublicationSerializer,
    PublishSerializer,
)
from .services import publish_results, reopen_publication, review_exam_type


def organization_exam_type(request, pk):
    organization = resolve_request_organization(request)
    return organization, get_object_or_404(
        ExamType.objects.select_related("batch"), pk=pk, organization=organization
    )


def organization_exam(request, pk):
    organization = resolve_request_organization(request)
    return organization, get_object_or_404(
        Exam.objects.select_related("exam_type__batch", "subject"),
        pk=pk,
        organization=organization,
    )


class GradeScaleListCreateView(TenantQuerysetMixin, ListCreateAPIView):
    permission_classes = [IsOrgStaff]
    serializer_class = GradeScaleSerializer
    queryset = GradeScale.objects.prefetch_related("bands")
    filterset_fields = ["is_active", "is_default"]
    search_fields = ["name"]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class GradeScaleDetailView(TenantQuerysetMixin, RetrieveUpdateDestroyAPIView):
    permission_classes = [IsOrgStaff]
    serializer_class = GradeScaleSerializer
    queryset = GradeScale.objects.prefetch_related("bands")

    def perform_destroy(self, instance):
        if instance.publications.exists():
            raise ValidationError(
                "Published grade scales cannot be deleted; deactivate them instead."
            )
        instance.delete()


class CandidateGenerateView(APIView):
    permission_classes = [IsOrgStaff]
    serializer_class = ExamCandidateSerializer

    @transaction.atomic
    def post(self, request, exam_type_pk):
        organization, exam_type = organization_exam_type(request, exam_type_pk)
        if exam_type.result_publications.filter(
            status=ResultPublication.PUBLISHED
        ).exists():
            raise ValidationError("Published exam rosters cannot be changed.")
        enrollments = Enroll.objects.filter(
            organization=organization,
            batch=exam_type.batch,
            status=Enroll.ACTIVE,
            is_active=True,
            student__is_active=True,
        ).select_related("student")
        created = 0
        for enrollment in enrollments:
            _, was_created = ExamCandidate.objects.get_or_create(
                organization=organization,
                exam_type=exam_type,
                student=enrollment.student,
                defaults={
                    "enrollment": enrollment,
                    "created_by": request.user,
                },
            )
            created += int(was_created)
        candidates = ExamCandidate.objects.filter(
            organization=organization, exam_type=exam_type, is_active=True
        ).select_related("student__user")
        return Response(
            {
                "created": created,
                "count": candidates.count(),
                "candidates": ExamCandidateSerializer(candidates, many=True).data,
            },
            status=status.HTTP_201_CREATED,
        )


class CandidateListView(APIView):
    permission_classes = [IsOrgStaff]
    serializer_class = ExamCandidateSerializer

    def get(self, request, exam_type_pk):
        organization, exam_type = organization_exam_type(request, exam_type_pk)
        candidates = ExamCandidate.objects.filter(
            organization=organization, exam_type=exam_type, is_active=True
        ).select_related("student__user")
        return Response(ExamCandidateSerializer(candidates, many=True).data)


class ExamMarkSheetView(APIView):
    permission_classes = [IsOrgStaff]
    serializer_class = ExamMarkInputSerializer

    def get(self, request, exam_pk):
        organization, exam = organization_exam(request, exam_pk)
        candidates = list(
            ExamCandidate.objects.filter(
                organization=organization,
                exam_type=exam.exam_type,
                is_eligible=True,
                is_active=True,
            ).select_related("student__user")
        )
        marks = {
            mark.candidate_id: mark
            for mark in ExamMark.objects.filter(
                organization=organization, exam=exam, candidate__in=candidates
            )
        }
        rows = []
        for candidate in candidates:
            mark = marks.get(candidate.pk)
            rows.append(
                {
                    "candidate": candidate.pk,
                    "student": {
                        "id": candidate.student.pk,
                        "student_id": candidate.student.student_id,
                        "first_name": candidate.student.user.first_name,
                        "last_name": candidate.student.user.last_name,
                    },
                    "attendance_status": mark.attendance_status if mark else "present",
                    "obtained_mark": mark.obtained_mark if mark else None,
                    "remark": mark.remark if mark else "",
                    "workflow_status": mark.workflow_status if mark else "draft",
                }
            )
        return Response(
            {
                "exam": {
                    "id": exam.pk,
                    "name": exam.name,
                    "subject": exam.subject.name,
                    "total_mark": exam.total_mark,
                    "pass_mark": exam.pass_mark,
                    "exam_type": exam.exam_type_id,
                },
                "rows": rows,
            }
        )

    @transaction.atomic
    def put(self, request, exam_pk):
        organization, exam = organization_exam(request, exam_pk)
        if ResultPublication.objects.filter(
            organization=organization,
            exam_type=exam.exam_type,
            status=ResultPublication.PUBLISHED,
        ).exists():
            raise ValidationError("Published marks are locked.")
        if not isinstance(request.data, list) or not request.data:
            raise ValidationError("Submit a non-empty list of marks.")
        serializer = self.serializer_class(
            data=request.data, many=True, context={"exam": exam}
        )
        serializer.is_valid(raise_exception=True)
        candidate_ids = [item["candidate"] for item in serializer.validated_data]
        if len(candidate_ids) != len(set(candidate_ids)):
            raise ValidationError("Each candidate can appear only once.")
        candidates = {
            candidate.pk: candidate
            for candidate in ExamCandidate.objects.filter(
                pk__in=candidate_ids,
                organization=organization,
                exam_type=exam.exam_type,
                is_eligible=True,
                is_active=True,
            )
        }
        if len(candidates) != len(candidate_ids):
            raise ValidationError("One or more candidates are invalid for this exam.")
        for item in serializer.validated_data:
            ExamMark.objects.update_or_create(
                organization=organization,
                exam=exam,
                candidate=candidates[item["candidate"]],
                defaults={
                    "attendance_status": item["attendance_status"],
                    "obtained_mark": item.get("obtained_mark"),
                    "remark": item.get("remark", ""),
                    "workflow_status": ExamMark.DRAFT,
                    "entered_by": request.user,
                    "verified_by": None,
                    "verified_at": None,
                    "created_by": request.user,
                },
            )
        return self.get(request, exam_pk)


class ExamMarkSubmitView(APIView):
    permission_classes = [IsOrgStaff]
    serializer_class = CountSerializer

    @transaction.atomic
    def post(self, request, exam_pk):
        organization, exam = organization_exam(request, exam_pk)
        if ResultPublication.objects.filter(
            organization=organization,
            exam_type=exam.exam_type,
            status=ResultPublication.PUBLISHED,
        ).exists():
            raise ValidationError("Published marks are locked.")
        candidate_count = ExamCandidate.objects.filter(
            organization=organization,
            exam_type=exam.exam_type,
            is_eligible=True,
            is_active=True,
        ).count()
        marks = ExamMark.objects.filter(
            organization=organization, exam=exam, is_active=True
        )
        if not candidate_count or marks.count() != candidate_count:
            raise ValidationError("Enter a status or mark for every candidate first.")
        marks.update(workflow_status=ExamMark.SUBMITTED)
        return Response({"submitted": marks.count()})


class ExamMarkVerifyView(APIView):
    permission_classes = [IsOrgAdmin]
    serializer_class = CountSerializer

    @transaction.atomic
    def post(self, request, exam_pk):
        organization, exam = organization_exam(request, exam_pk)
        marks = ExamMark.objects.select_for_update().filter(
            organization=organization,
            exam=exam,
            is_active=True,
            workflow_status=ExamMark.SUBMITTED,
        )
        candidate_count = ExamCandidate.objects.filter(
            organization=organization,
            exam_type=exam.exam_type,
            is_eligible=True,
            is_active=True,
        ).count()
        if not candidate_count or marks.count() != candidate_count:
            raise ValidationError("Every candidate's marks must be submitted first.")
        now = timezone.now()
        marks.update(
            workflow_status=ExamMark.VERIFIED,
            verified_by=request.user,
            verified_at=now,
        )
        return Response({"verified": marks.count()})


class ExamTypeReviewView(APIView):
    permission_classes = [IsOrgStaff]
    serializer_class = AssessmentReviewSerializer

    def get(self, request, exam_type_pk):
        _organization, exam_type = organization_exam_type(request, exam_type_pk)
        return Response(review_exam_type(exam_type))


class PublishResultsView(APIView):
    permission_classes = [IsOrgAdmin]
    serializer_class = PublishSerializer

    def post(self, request, exam_type_pk):
        organization, exam_type = organization_exam_type(request, exam_type_pk)
        serializer = self.serializer_class(
            data=request.data, context={"organization": organization}
        )
        serializer.is_valid(raise_exception=True)
        publication = publish_results(
            exam_type=exam_type,
            organization=organization,
            grade_scale=serializer.validated_data["grade_scale"],
            user=request.user,
            message=serializer.validated_data.get("message", ""),
            show_rank=serializer.validated_data["show_rank"],
        )
        publication.refresh_from_db()
        return Response(
            PublicationSerializer(publication).data,
            status=status.HTTP_201_CREATED,
        )


class ReopenPublicationView(APIView):
    permission_classes = [IsOrgAdmin]
    serializer_class = DetailSerializer

    def post(self, request, publication_pk):
        organization = resolve_request_organization(request)
        publication = get_object_or_404(
            ResultPublication,
            pk=publication_pk,
            organization=organization,
        )
        reopen_publication(publication=publication, user=request.user)
        return Response({"detail": "Results reopened for correction."})


class ExamTypeOutcomeListView(APIView):
    permission_classes = [IsOrgStaff]
    serializer_class = OutcomeSerializer

    def get(self, request, exam_type_pk):
        organization, exam_type = organization_exam_type(request, exam_type_pk)
        outcomes = Outcome.objects.filter(
            organization=organization,
            publication__exam_type=exam_type,
            publication__status=ResultPublication.PUBLISHED,
        ).select_related(
            "student__user", "publication__exam_type__batch"
        ).prefetch_related("lines__exam__subject")
        return Response(OutcomeSerializer(outcomes, many=True).data)


class MyOutcomeListView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OutcomeSerializer

    def get(self, request):
        if request.user.role != STUDENT:
            raise PermissionDenied("This endpoint is for students.")
        student = get_object_or_404(Student, user=request.user)
        outcomes = Outcome.objects.filter(
            student=student,
            publication__status=ResultPublication.PUBLISHED,
        ).select_related(
            "student__user", "publication__exam_type__batch"
        ).prefetch_related("lines__exam__subject")
        return Response(OutcomeSerializer(outcomes, many=True).data)


class MyChildrenView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChildSerializer

    def get(self, request):
        if request.user.role != GUARDIAN:
            raise PermissionDenied("This endpoint is for guardians.")
        links = StudentGuardian.objects.filter(
            guardian=request.user, is_active=True, student__is_active=True
        ).select_related("student__user")
        return Response(
            [
                {
                    "id": link.student_id,
                    "student_id": link.student.student_id,
                    "first_name": link.student.user.first_name,
                    "last_name": link.student.user.last_name,
                    "relationship": link.relationship,
                }
                for link in links
            ]
        )


class ChildOutcomeListView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OutcomeSerializer

    def get(self, request, student_pk):
        if request.user.role != GUARDIAN:
            raise PermissionDenied("This endpoint is for guardians.")
        link = get_object_or_404(
            StudentGuardian,
            guardian=request.user,
            student_id=student_pk,
            is_active=True,
        )
        outcomes = Outcome.objects.filter(
            student=link.student,
            publication__status=ResultPublication.PUBLISHED,
        ).select_related(
            "student__user", "publication__exam_type__batch"
        ).prefetch_related("lines__exam__subject")
        return Response(OutcomeSerializer(outcomes, many=True).data)
