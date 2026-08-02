import csv
from datetime import datetime
from decimal import Decimal
from io import StringIO

from django.db import transaction
from django.db.models import Case, DecimalField, F, Sum, Value, When
from django.db.models.functions import ExtractMonth
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.generics import (
    ListAPIView,
    ListCreateAPIView,
    RetrieveUpdateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.response import Response
from rest_framework.views import APIView

from organization.tenancy import TenantQuerysetMixin, resolve_request_organization
from user.permissions import IsOrgStaff

from .models import Enroll, Student, StudentGuardian, Transaction
from .serializers import (
    CreateStudentSerializer,
    EnrollCreateSerializer,
    EnrollmentCancellationSerializer,
    EnrollListSerializer,
    EnrollSerializer,
    StudentSerializer,
    StudentGuardianCreateSerializer,
    StudentGuardianSerializer,
    StudentsShortStatSerializer,
    TransactionReversalSerializer,
    TransactionSerializer,
    YearlyTransactionStatsSerializer,
)


class StudentGuardianListCreateView(TenantQuerysetMixin, ListCreateAPIView):
    permission_classes = [IsOrgStaff]
    queryset = StudentGuardian.objects.select_related("guardian", "student")

    def get_student(self):
        organization = resolve_request_organization(self.request)
        return get_object_or_404(
            Student,
            organization=organization,
            student_id=self.kwargs["student_id"],
        )

    def get_queryset(self):
        return super().get_queryset().filter(student=self.get_student())

    def get_serializer_class(self):
        if self.request.method == "POST":
            return StudentGuardianCreateSerializer
        return StudentGuardianSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["student"] = self.get_student()
        return context


class StudentGuardianDetailView(TenantQuerysetMixin, RetrieveUpdateDestroyAPIView):
    permission_classes = [IsOrgStaff]
    serializer_class = StudentGuardianSerializer
    queryset = StudentGuardian.objects.select_related("guardian", "student")
    http_method_names = ["get", "delete", "head", "options"]


class StudentListView(TenantQuerysetMixin, ListCreateAPIView):
    permission_classes = [IsOrgStaff]
    serializer_class = CreateStudentSerializer
    queryset = Student.objects.select_related("user", "organization")
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["is_active", "blood_group"]
    search_fields = [
        "student_id",
        "emergency_contact_no",
        "user__first_name",
        "user__last_name",
        "user__email",
        "user__phone",
    ]
    ordering_fields = [
        "student_id",
        "user__first_name",
        "user__last_name",
        "created_at",
        "updated_at",
    ]

    def perform_create(self, serializer):
        organization = resolve_request_organization(
            self.request, data=self.request.data, write=True
        )
        serializer.save(organization=organization, created_by=self.request.user)


class StudentDetailView(TenantQuerysetMixin, RetrieveUpdateDestroyAPIView):
    lookup_field = "student_id"
    lookup_url_kwarg = "student_id"
    permission_classes = [IsOrgStaff]
    queryset = Student.objects.select_related("user", "organization")

    def get_serializer_class(self):
        if self.request.method in {"PUT", "PATCH"}:
            return CreateStudentSerializer
        return StudentSerializer

    def perform_update(self, serializer):
        organization = resolve_request_organization(
            self.request, data=self.request.data, write=True
        )
        if serializer.instance.organization_id != organization.id:
            raise ValidationError("The student belongs to another organization.")
        serializer.save(organization=organization)

    def perform_destroy(self, instance):
        if instance.enrolls.exists():
            raise ValidationError(
                "Students with enrollment history cannot be deleted; deactivate them instead."
            )
        instance.user.delete()


class EnrollListCreateView(TenantQuerysetMixin, ListCreateAPIView):
    permission_classes = [IsOrgStaff]
    queryset = Enroll.objects.select_related("student__user", "batch", "organization")
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["batch", "student", "status"]
    search_fields = [
        "student__student_id",
        "student__emergency_contact_no",
        "student__user__first_name",
        "student__user__last_name",
        "student__user__email",
        "student__user__phone",
    ]
    ordering_fields = ["created_at", "updated_at", "total_amount", "discount_amount"]

    def get_serializer_class(self):
        return EnrollCreateSerializer if self.request.method == "POST" else EnrollListSerializer

    def perform_create(self, serializer):
        organization = resolve_request_organization(
            self.request, data=self.request.data, write=True
        )
        serializer.save(organization=organization, created_by=self.request.user)


class EnrollDetailView(TenantQuerysetMixin, RetrieveUpdateAPIView):
    permission_classes = [IsOrgStaff]
    queryset = Enroll.objects.select_related("student__user", "batch", "organization")

    def get_serializer_class(self):
        if self.request.method in {"PUT", "PATCH"}:
            return EnrollCreateSerializer
        return EnrollSerializer

    def perform_update(self, serializer):
        organization = resolve_request_organization(
            self.request, data=self.request.data, write=True
        )
        serializer.save(organization=organization)


class TransactionListCreateView(TenantQuerysetMixin, ListCreateAPIView):
    permission_classes = [IsOrgStaff]
    serializer_class = TransactionSerializer
    queryset = Transaction.objects.select_related("enroll", "organization")
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["transaction_type"]
    ordering_fields = ["created_at", "amount"]

    def get_enroll(self, *, lock=False):
        organization = resolve_request_organization(self.request)
        queryset = Enroll.objects.filter(organization=organization)
        if lock:
            queryset = queryset.select_for_update()
        return get_object_or_404(queryset, pk=self.kwargs["pk"])

    def get_queryset(self):
        return super().get_queryset().filter(enroll_id=self.kwargs["pk"])

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["enroll"] = self.get_enroll()
        return context

    @transaction.atomic
    def perform_create(self, serializer):
        from finance.models import PaymentMethod

        organization = resolve_request_organization(
            self.request, data=self.request.data, write=True
        )
        enroll = self.get_enroll(lock=True)
        # Re-run balance validation after acquiring the enrollment lock.
        serializer.context["enroll"] = enroll
        serializer.validate(serializer.validated_data)
        payment_method = serializer.validated_data.get("payment_method")
        if payment_method is None:
            payment_method = PaymentMethod.objects.filter(
                organization=organization,
                method_type=PaymentMethod.CASH,
                is_active=True,
            ).first()
        serializer.save(
            organization=organization,
            enroll=enroll,
            transaction_type=Transaction.PAYMENT,
            payment_method=payment_method,
            created_by=self.request.user,
        )


class TransactionReversalView(APIView):
    permission_classes = [IsOrgStaff]
    serializer_class = TransactionReversalSerializer

    @transaction.atomic
    def post(self, request, pk, transaction_pk):
        organization = resolve_request_organization(request, data=request.data, write=True)
        enroll = get_object_or_404(
            Enroll.objects.select_for_update(), pk=pk, organization=organization
        )
        original = get_object_or_404(
            Transaction.objects.select_for_update(),
            pk=transaction_pk,
            enroll=enroll,
            organization=organization,
            transaction_type=Transaction.PAYMENT,
        )
        if hasattr(original, "reversal"):
            raise ValidationError("This payment has already been reversed.")
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        remark = serializer.validated_data["remark"]
        reversal = Transaction.objects.create(
            organization=organization,
            enroll=enroll,
            amount=original.amount,
            transaction_type=Transaction.REVERSAL,
            reversal_of=original,
            payment_method=original.payment_method,
            installment=original.installment,
            reference_number=original.reference_number,
            remark=remark,
            created_by=request.user,
        )
        replacement = None
        replacement_amount = serializer.validated_data.get("replacement_amount")
        if replacement_amount:
            enroll.refresh_from_db()
            if enroll.status != Enroll.ACTIVE:
                raise ValidationError("Cancelled enrollments cannot receive replacement payments.")
            if replacement_amount > enroll.balance:
                raise ValidationError(
                    {"replacement_amount": "Replacement exceeds the outstanding balance."}
                )
            replacement = Transaction.objects.create(
                organization=organization,
                enroll=enroll,
                amount=replacement_amount,
                transaction_type=Transaction.PAYMENT,
                payment_method=original.payment_method,
                installment=original.installment,
                reference_number=original.reference_number,
                remark=f"Replacement for transaction #{original.pk}: {remark}",
                created_by=request.user,
            )
        return Response(
            {
                "reversal": TransactionSerializer(reversal).data,
                "replacement": TransactionSerializer(replacement).data if replacement else None,
            },
            status=status.HTTP_201_CREATED,
        )


class EnrollmentCancellationView(APIView):
    permission_classes = [IsOrgStaff]
    serializer_class = EnrollmentCancellationSerializer

    @transaction.atomic
    def post(self, request, pk):
        organization = resolve_request_organization(request, data=request.data, write=True)
        enroll = get_object_or_404(
            Enroll.objects.select_for_update(), pk=pk, organization=organization
        )
        if enroll.status == Enroll.CANCELLED:
            raise ValidationError("Enrollment is already cancelled.")
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        enroll.status = Enroll.CANCELLED
        enroll.is_active = False
        enroll.cancelled_at = timezone.now()
        enroll.cancelled_by = request.user
        enroll.cancellation_reason = serializer.validated_data["reason"]
        enroll.save(
            update_fields=[
                "status",
                "is_active",
                "cancelled_at",
                "cancelled_by",
                "cancellation_reason",
                "updated_at",
            ]
        )
        return Response(EnrollSerializer(enroll).data)


class EnrollmentExportView(APIView):
    permission_classes = [IsOrgStaff]
    serializer_class = EnrollListSerializer

    def get(self, request):
        organization = resolve_request_organization(request)
        queryset = Enroll.objects.filter(organization=organization).select_related(
            "student__user", "batch"
        )
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(
            [
                "Enrollment ID",
                "Student ID",
                "Student",
                "Batch",
                "Status",
                "Total",
                "Discount",
                "Net payable",
                "Paid",
                "Balance",
            ]
        )
        for enroll in queryset:
            writer.writerow(
                [
                    enroll.pk,
                    enroll.student.student_id,
                    enroll.student.user.full_name(),
                    enroll.batch.name,
                    enroll.status,
                    enroll.total_amount,
                    enroll.discount_amount or 0,
                    enroll.net_payable,
                    enroll.total_paid,
                    enroll.balance,
                ]
            )
        response = HttpResponse(output.getvalue(), content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="enrollments.csv"'
        return response


class StudentShortStatsView(APIView):
    permission_classes = [IsOrgStaff]
    serializer_class = StudentsShortStatSerializer

    def get(self, request, *args, **kwargs):
        organization = resolve_request_organization(request)
        student_scope = Student.objects.all()
        enroll_scope = Enroll.objects.all()
        if organization is not None:
            student_scope = student_scope.filter(organization=organization)
            enroll_scope = enroll_scope.filter(organization=organization)
        students = student_scope.count()
        active_students = student_scope.filter(is_active=True).count()
        enrolls = enroll_scope.count()
        paid_enrolls = enroll_scope.filter(
            pk__in=Enroll.get_paid_enrolls().values("pk")
        ).count()
        data = {
            "students": students,
            "active_students": active_students,
            "inactive_students": students - active_students,
            "enrolls": enrolls,
            "paid_enrolls": paid_enrolls,
            "due_enrolls": enrolls - paid_enrolls,
        }
        serializer = self.serializer_class(data=data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TransactionStatsView(ListAPIView):
    permission_classes = [IsOrgStaff]
    serializer_class = YearlyTransactionStatsSerializer
    pagination_class = None
    filter_backends = []

    def get(self, request, *args, **kwargs):
        current_year = datetime.today().year
        year = self.request.query_params.get("year", current_year)
        organization = resolve_request_organization(request)
        transactions = Transaction.objects.filter(created_at__year=year)
        if organization is not None:
            transactions = transactions.filter(organization=organization)
        transactions = (
            transactions.annotate(
                signed_amount=Case(
                    When(transaction_type=Transaction.PAYMENT, then=F("amount")),
                    When(transaction_type=Transaction.REVERSAL, then=-F("amount")),
                    default=Value(Decimal("0.00")),
                    output_field=DecimalField(max_digits=12, decimal_places=2),
                ),
                month=ExtractMonth("created_at"),
            )
            .values("month")
            .annotate(total_amount=Sum("signed_amount"))
        )
        existing = {item["month"]: item["total_amount"] for item in transactions}
        data = [
            {"month": month, "total_amount": existing.get(month, 0)}
            for month in range(1, 13)
        ]
        serializer = self.serializer_class(data=data, many=True)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
