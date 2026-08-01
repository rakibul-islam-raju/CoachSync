from django.shortcuts import get_object_or_404
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import User, ADMIN, ADMIN_STAFF, ORG_ADMIN, ORG_STAFF
from .permissions import EmployeePermission
from .serializers import UserSerializer


class MeApiView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get(self, request):
        user = get_object_or_404(User, id=self.request.user.id)
        serializer = self.serializer_class(user, context={"request": request})
        return Response(serializer.data)


class UserListCreateView(ListCreateAPIView):
    permission_classes = [EmployeePermission]
    serializer_class = UserSerializer
    queryset = User.objects.all()
    filterset_fields = ["is_active", "is_staff", "is_superuser", "role"]
    search_fields = ["email", "first_name", "last_name", "phone"]
    ordering_fields = [
        "first_name",
        "last_name",
        "created_at",
        "updated_at",
    ]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return self.queryset

        user = self.request.user
        queryset = User.get_non_student_teacher_users()

        if user.role in {ADMIN_STAFF, ORG_ADMIN, ORG_STAFF}:
            queryset = queryset.exclude(role__in=[ADMIN, ADMIN_STAFF])

        return queryset


class UserDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = UserSerializer
    permission_classes = [EmployeePermission]
    queryset = User.objects.all()

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return self.queryset

        user = self.request.user
        queryset = User.get_non_student_teacher_users()

        if user.role in {ADMIN_STAFF, ORG_ADMIN, ORG_STAFF}:
            return queryset.exclude(role__in=[ADMIN, ADMIN_STAFF])
        return queryset
