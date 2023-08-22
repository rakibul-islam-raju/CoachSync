from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.generics import (
    ListCreateAPIView,
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)

from user.models import User
from user.permissions import IsOrgStaff

from .models import Subject, Teacher, Classs, Batch, ExamType, Exam, Schedule
from .serializers import (
    SubjectSerializer,
    TeacherSerializer,
    TeacherCreateSerializer,
    ClasssSerializer,
    BatchCreateSerializer,
    BatchSerializer,
    ExamTypeCreateSerializer,
    ExamTypeSerializer,
    ExamCreateSerializer,
    ExamSerializer,
    ScheduleCreateSerializer,
    ScheduleSerializer,
)


class SubjectListCreateView(ListCreateAPIView):
    queryset = Subject.objects.all()
    permission_classes = [IsOrgStaff]
    serializer_class = SubjectSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["name", "code", "is_active"]
    search_fields = [
        "name",
        "code",
    ]
    ordering_fields = ["name", "code", "created_at", "updated_at"]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class SubjectDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Subject.objects.all()
    permission_classes = [IsOrgStaff]
    serializer_class = SubjectSerializer


class TeacherListCreateView(ListCreateAPIView):
    permission_classes = [IsOrgStaff]
    queryset = Teacher.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["is_active"]
    search_fields = [
        "user__first_name",
        "user__last_name",
        "user__email",
        "user__phone",
    ]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return TeacherCreateSerializer
        return TeacherSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class TeacherDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Teacher.objects.all()
    permission_classes = [IsOrgStaff]
    serializer_class = TeacherSerializer

    def perform_destroy(self, instance):
        user = User.objects.delete(id=instance.user__id)


class ClasssListCreateView(ListCreateAPIView):
    queryset = Classs.objects.all()
    serializer_class = ClasssSerializer
    permission_classes = [IsOrgStaff]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["is_active"]
    search_fields = [
        "name",
        "numeric",
    ]
    ordering_fields = ["name", "numeric", "created_at", "updated_at"]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ClasssDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Classs.objects.all()
    serializer_class = ClasssSerializer
    permission_classes = [IsOrgStaff]


class BatchListCreateView(ListCreateAPIView):
    permission_classes = [IsOrgStaff]
    queryset = Batch.objects.all()

    def get_serializer_class(self):
        if self.request.method == "POST":
            return BatchCreateSerializer
        return BatchSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class BatchDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsOrgStaff]
    queryset = Batch.objects.all()
    serializer_class = BatchSerializer


class ExamTypeListCreateView(ListCreateAPIView):
    permission_classes = [IsOrgStaff]
    queryset = ExamType.objects.all()

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ExamTypeCreateSerializer
        return ExamTypeSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ExamTypeDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsOrgStaff]
    queryset = ExamType.objects.all()
    serializer_class = ExamTypeSerializer


class ExamListCreateView(ListCreateAPIView):
    permission_classes = [IsOrgStaff]
    queryset = Exam.objects.all()

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ExamCreateSerializer
        return ExamSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ExamDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsOrgStaff]
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer


class ScheduleListCreateView(ListCreateAPIView):
    permission_classes = [IsOrgStaff]
    queryset = Schedule.objects.all()

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ScheduleCreateSerializer
        return ScheduleSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ScheduleDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsOrgStaff]
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer
