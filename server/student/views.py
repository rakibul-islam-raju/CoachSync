from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend

from .models import Student
from .serializers import (
    StudentSerializer,
    CreateStudentSerializer,
    EditStudentSerializer,
)

from user.permissions import IsOrgStaff


class StudentListView(ListCreateAPIView):
    permission_classes = [IsOrgStaff]
    queryset = Student.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["is_active", "classs", "batch", "blood_group"]
    search_fields = [
        "emergency_contact_no",
        "user__first_name",
        "user__last_name",
        "user__email",
        "user__phone",
    ]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CreateStudentSerializer
        return StudentSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class StudentDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsOrgStaff]
    queryset = Student.objects.all()

    def get_serializer_class(self):
        if self.request.method == "PUT" or self.request.method == "PATCH":
            return EditStudentSerializer
        return StudentSerializer
