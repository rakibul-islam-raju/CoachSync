from datetime import datetime

from django.db.models import Sum
from django.db.models.functions import ExtractMonth

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import (
    ListAPIView,
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
    RetrieveUpdateAPIView,
)
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend

from .models import Student, Enroll, Transaction
from .serializers import (
    StudentSerializer,
    CreateStudentSerializer,
    EnrollSerializer,
    EnrollCreateSerializer,
    TransactionSerializer,
    StudentsShortStatSerializer,
    YearlyTransactionStatsSerializer,
)

from user.permissions import IsOrgStaff


class StudentListView(ListCreateAPIView):
    permission_classes = [IsOrgStaff]
    serializer_class = CreateStudentSerializer
    queryset = Student.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["is_active", "blood_group"]
    search_fields = [
        "emergency_contact_no",
        "user__first_name",
        "user__last_name",
        "user__email",
        "user__phone",
    ]
    ordering_fields = [
        "user__first_name",
        "user__last_name",
        "created_at",
        "updated_at",
    ]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class StudentDetailView(RetrieveUpdateDestroyAPIView):
    lookup_field = "student_id"
    lookup_url_kwarg = "student_id"
    permission_classes = [IsOrgStaff]
    queryset = Student.objects.all()

    def get_serializer_class(self):
        if self.request.method == "PUT" or self.request.method == "PATCH":
            return CreateStudentSerializer
        return StudentSerializer


class EnrollListCreateView(ListCreateAPIView):
    permission_classes = [IsOrgStaff]
    queryset = Enroll.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["batch"]
    search_fields = [
        "student__emergency_contact_no",
        "student__user__first_name",
        "student__user__last_name",
        "student__user__email",
        "student__user__phone",
    ]
    ordering_fields = [
        "created_at",
        "updated_at",
    ]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return EnrollCreateSerializer
        return EnrollSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class EnrollDetailView(RetrieveUpdateAPIView):
    permission_classes = [IsOrgStaff]
    queryset = Enroll.objects.all()

    def get_serializer_class(self):
        if self.request.method == "PUT" or self.request.method == "PATCH":
            return EnrollCreateSerializer
        return EnrollSerializer


class TransactionListCreateView(ListCreateAPIView):
    permission_classes = [IsOrgStaff]
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["enroll"]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class StudentShortStatsView(APIView):
    permission_classes = [IsOrgStaff]
    serializer_class = StudentsShortStatSerializer

    def get(self, request, *args, **kwargs):
        # students
        students = Student.objects.all().count()
        active_students = Student.objects.filter(is_active=True).count()
        inactive_students = students - active_students

        # enrolls
        enrolls = Enroll.objects.all().count()
        paid_enrolls = Enroll.get_paid_enrolls().count()
        due_enrolls = enrolls - paid_enrolls
        data = {
            "students": students,
            "active_students": active_students,
            "inactive_students": inactive_students,
            "enrolls": enrolls,
            "paid_enrolls": paid_enrolls,
            "due_enrolls": due_enrolls,
        }

        serializer = StudentsShortStatSerializer(data=data)
        serializer.is_valid(raise_exception=True)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


class TransactionStatsView(ListAPIView):
    permission_classes = [IsOrgStaff]
    serializer_class = YearlyTransactionStatsSerializer
    pagination_class = None
    filter_backends = []

    def get(self, request, *args, **kwargs):
        current_date = datetime.today()
        current_year = current_date.year
        year = self.request.query_params.get("year") or current_year

        transactions = (
            Transaction.objects.filter(enroll__created_at__year=year)
            .annotate(
                month=ExtractMonth("enroll__created_at"),
            )
            .values("month")
            .annotate(total_amount=Sum("amount"))
        )

        serializer = self.serializer_class(data=list(transactions), many=True)
        serializer.is_valid(raise_exception=True)

        return Response(serializer.data, status=status.HTTP_200_OK)
