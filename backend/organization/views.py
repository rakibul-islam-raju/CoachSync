from django.db import transaction
from rest_framework import status
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.response import Response
from rest_framework.views import APIView

from user.permissions import IsAdminStaff, IsOrgStaff

from .filters import ScheduleFilter
from .models import Batch, Classs, Exam, ExamType, Organization, Schedule, Subject, Teacher
from .scheduling import validate_schedule_conflicts
from .serializers import (
    BatchCreateSerializer,
    BatchSerializer,
    ClasssSerializer,
    ExamSerializer,
    ExamTypeSerializer,
    ExamTypeWriteSerializer,
    ExamWriteSerializer,
    OrganizationSerializer,
    OrgShortInfoSerializer,
    ScheduleSerializer,
    ScheduleWriteSerializer,
    SubjectSerializer,
    TeacherCreateSerializer,
    TeacherSerializer,
)
from .tenancy import TenantQuerysetMixin, resolve_request_organization


class TenantCreateMixin(TenantQuerysetMixin):
    def perform_create(self, serializer):
        organization = self.get_write_organization(self.request.data)
        serializer.save(organization=organization, created_by=self.request.user)

    def perform_update(self, serializer):
        organization = self.get_write_organization(self.request.data)
        if serializer.instance.organization_id != organization.id:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("The object belongs to another organization.")
        serializer.save(organization=organization)


class OrganizationListCreateView(ListCreateAPIView):
    permission_classes = [IsAdminStaff]
    serializer_class = OrganizationSerializer
    queryset = Organization.objects.all()
    search_fields = ["name", "slug"]
    ordering_fields = ["name", "created_at", "updated_at"]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class OrganizationDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminStaff]
    serializer_class = OrganizationSerializer
    queryset = Organization.objects.all()


class SubjectListCreateView(TenantCreateMixin, ListCreateAPIView):
    queryset = Subject.objects.all()
    permission_classes = [IsOrgStaff]
    serializer_class = SubjectSerializer
    filterset_fields = ["name", "code", "is_active"]
    search_fields = ["name", "code"]
    ordering_fields = ["name", "code", "created_at", "updated_at"]


class SubjectDetailView(TenantCreateMixin, RetrieveUpdateDestroyAPIView):
    queryset = Subject.objects.all()
    permission_classes = [IsOrgStaff]
    serializer_class = SubjectSerializer


class TeacherListCreateView(TenantCreateMixin, ListCreateAPIView):
    permission_classes = [IsOrgStaff]
    queryset = Teacher.objects.select_related("user", "organization")
    filterset_fields = ["is_active", "user__first_name", "user__last_name"]
    search_fields = [
        "user__first_name",
        "user__last_name",
        "user__email",
        "user__phone",
    ]
    ordering_fields = [
        "user__first_name",
        "user__last_name",
        "user__email",
        "user__phone",
        "created_at",
        "updated_at",
    ]

    def get_serializer_class(self):
        return TeacherCreateSerializer if self.request.method == "POST" else TeacherSerializer


class TeacherDetailView(TenantCreateMixin, RetrieveUpdateDestroyAPIView):
    queryset = Teacher.objects.select_related("user", "organization")
    permission_classes = [IsOrgStaff]

    def get_serializer_class(self):
        if self.request.method in {"PATCH", "PUT"}:
            return TeacherCreateSerializer
        return TeacherSerializer

    def perform_destroy(self, instance):
        instance.user.delete()


class ClasssListCreateView(TenantCreateMixin, ListCreateAPIView):
    queryset = Classs.objects.all()
    serializer_class = ClasssSerializer
    permission_classes = [IsOrgStaff]
    filterset_fields = ["is_active"]
    search_fields = ["name", "numeric"]
    ordering_fields = ["name", "numeric", "created_at", "updated_at"]


class ClasssDetailView(TenantCreateMixin, RetrieveUpdateDestroyAPIView):
    queryset = Classs.objects.all()
    serializer_class = ClasssSerializer
    permission_classes = [IsOrgStaff]


class BatchListCreateView(TenantCreateMixin, ListCreateAPIView):
    permission_classes = [IsOrgStaff]
    queryset = Batch.objects.select_related("classs", "organization")
    filterset_fields = ["is_active", "classs"]
    search_fields = ["name", "code", "classs__name", "classs__numeric"]
    ordering_fields = [
        "name",
        "code",
        "start_date",
        "end_date",
        "classs__name",
        "classs__numeric",
        "created_at",
        "updated_at",
    ]

    def get_serializer_class(self):
        return BatchCreateSerializer if self.request.method == "POST" else BatchSerializer


class BatchDetailView(TenantCreateMixin, RetrieveUpdateDestroyAPIView):
    permission_classes = [IsOrgStaff]
    queryset = Batch.objects.select_related("classs", "organization")

    def get_serializer_class(self):
        if self.request.method in {"PATCH", "PUT"}:
            return BatchCreateSerializer
        return BatchSerializer


class ExamTypeListCreateView(TenantCreateMixin, ListCreateAPIView):
    permission_classes = [IsOrgStaff]
    queryset = ExamType.objects.select_related("batch", "organization")
    filterset_fields = ["is_active", "batch", "start_date", "end_date"]
    search_fields = ["name", "batch__name", "batch__code"]
    ordering_fields = ["name", "start_date", "end_date", "created_at", "updated_at"]

    def get_serializer_class(self):
        return ExamTypeWriteSerializer if self.request.method == "POST" else ExamTypeSerializer


class ExamTypeDetailView(TenantCreateMixin, RetrieveUpdateDestroyAPIView):
    permission_classes = [IsOrgStaff]
    queryset = ExamType.objects.select_related("batch", "organization")

    def get_serializer_class(self):
        if self.request.method in {"PATCH", "PUT"}:
            return ExamTypeWriteSerializer
        return ExamTypeSerializer

    def perform_destroy(self, instance):
        if instance.candidates.exists() or instance.result_publications.exists():
            from rest_framework.exceptions import ValidationError

            raise ValidationError(
                "Exam periods with assessment history cannot be deleted; deactivate them instead."
            )
        instance.delete()


class ExamListCreateView(TenantCreateMixin, ListCreateAPIView):
    permission_classes = [IsOrgStaff]
    queryset = Exam.objects.select_related("exam_type", "subject", "organization")
    filterset_fields = ["is_active", "exam_type", "exam_type__batch", "subject", "date"]
    search_fields = ["name", "exam_type__name", "subject__name", "subject__code"]
    ordering_fields = ["name", "date", "pass_mark", "total_mark", "created_at", "updated_at"]

    def get_serializer_class(self):
        return ExamWriteSerializer if self.request.method == "POST" else ExamSerializer


class ExamDetailView(TenantCreateMixin, RetrieveUpdateDestroyAPIView):
    permission_classes = [IsOrgStaff]
    queryset = Exam.objects.select_related("exam_type", "subject", "organization")

    def get_serializer_class(self):
        if self.request.method in {"PATCH", "PUT"}:
            return ExamWriteSerializer
        return ExamSerializer

    def perform_destroy(self, instance):
        if instance.marks.exists():
            from rest_framework.exceptions import ValidationError

            raise ValidationError(
                "Exams with mark history cannot be deleted; deactivate them instead."
            )
        instance.delete()


class ScheduleListCreateView(TenantQuerysetMixin, ListCreateAPIView):
    permission_classes = [IsOrgStaff]
    filterset_class = ScheduleFilter
    queryset = Schedule.objects.select_related(
        "subject", "teacher__user", "batch__classs", "exam", "organization"
    )
    search_fields = [
        "title",
        "subject__name",
        "subject__code",
        "teacher__user__first_name",
        "teacher__user__last_name",
        "batch__name",
        "batch__code",
        "exam__name",
    ]
    ordering_fields = ["date", "time", "created_at", "updated_at"]

    def get_serializer_class(self):
        return ScheduleWriteSerializer if self.request.method == "POST" else ScheduleSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        if not isinstance(request.data, list) or not request.data:
            return Response(
                {"detail": "Submit a non-empty list of schedules."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        organization = resolve_request_organization(
            request, data=request.data[0], write=True
        )
        serializer = ScheduleWriteSerializer(
            data=request.data, many=True, context=self.get_serializer_context()
        )
        serializer.is_valid(raise_exception=True)
        values = serializer.validated_data
        Batch.objects.select_for_update().filter(
            organization=organization,
            pk__in={item["batch"].pk for item in values},
        ).count()
        Teacher.objects.select_for_update().filter(
            organization=organization,
            pk__in={item["teacher"].pk for item in values if item.get("teacher")},
        ).count()
        validate_schedule_conflicts(values, organization)
        serializer.save(organization=organization, created_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ScheduleDetailView(TenantCreateMixin, RetrieveUpdateDestroyAPIView):
    permission_classes = [IsOrgStaff]
    queryset = Schedule.objects.select_related(
        "subject", "teacher__user", "batch__classs", "exam", "organization"
    )

    def get_serializer_class(self):
        if self.request.method in {"PUT", "PATCH"}:
            return ScheduleWriteSerializer
        return ScheduleSerializer

    @transaction.atomic
    def perform_update(self, serializer):
        organization = self.get_write_organization(self.request.data)
        instance = serializer.instance
        values = {
            field: serializer.validated_data.get(field, getattr(instance, field))
            for field in ["batch", "teacher", "date", "time", "duration"]
        }
        Batch.objects.select_for_update().filter(pk=values["batch"].pk).count()
        if values["teacher"]:
            Teacher.objects.select_for_update().filter(pk=values["teacher"].pk).count()
        validate_schedule_conflicts([values], organization, instances=[instance])
        serializer.save(organization=organization)


class OrganizationShortInfoView(APIView):
    permission_classes = [IsOrgStaff]
    serializer_class = OrgShortInfoSerializer

    def get(self, request, *args, **kwargs):
        organization = resolve_request_organization(request)
        scope = {} if organization is None else {"organization": organization}
        data = {
            "active_batches": Batch.objects.filter(is_active=True, **scope).count(),
            "active_classes": Classs.objects.filter(is_active=True, **scope).count(),
            "active_teachers": Teacher.objects.filter(is_active=True, **scope).count(),
        }
        serializer = self.serializer_class(data=data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
