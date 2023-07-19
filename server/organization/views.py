from rest_framework.generics import (
    ListAPIView,
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)

from user.models import User
from user.permissions import IsOrgStaff

from .models import Subject, Teacher
from .serializers import SubjectCerateSerializer, SubjectSerializer, TeacherSerializer


class SubjectListCreateView(ListCreateAPIView):
    queryset = Subject.objects.all()
    permission_classes = [IsOrgStaff]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return SubjectCerateSerializer
        return SubjectSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class SubjectRetrieveUpdateDeleteView(RetrieveUpdateDestroyAPIView):
    queryset = Subject.objects.all()
    permission_classes = [IsOrgStaff]

    def get_serializer_class(self):
        if self.request.method == "PATCH" or self.request.method == "PUT":
            return SubjectCerateSerializer
        return SubjectSerializer


class TeacherListView(ListAPIView):
    queryset = Teacher.objects.all()
    permission_classes = [IsOrgStaff]
    serializer_class = TeacherSerializer


class TeacherDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Teacher.objects.all()
    permission_classes = [IsOrgStaff]
    serializer_class = TeacherSerializer

    def perform_destroy(self, instance):
        user = User.objects.delete(id=instance.user__id)
