from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
    RetrieveUpdateAPIView,
)
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend

from .models import Student, Enroll
from .serializers import (
    StudentSerializer,
    CreateStudentSerializer,
    EnrollSerializer,
    EnrollCreateSerializer,
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

    # def get_serializer_class(self):
    #     if self.request.method == "POST":
    #         return CreateStudentSerializer
    #     return StudentSerializer

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
    # serializer_class = EnrollSerializer

    def get_serializer_class(self):
        if self.request.method == "PUT" or self.request.method == "PATCH":
            return EnrollCreateSerializer
        return EnrollSerializer
