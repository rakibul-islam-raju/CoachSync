from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import User, ADMIN, ADMIN_STAFF, ORG_ADMIN, ORG_STAFF
from .permissions import EmployeePermission
from .serializers import SelfProfileSerializer, UserSerializer
from organization.tenancy import is_platform_user, organization_ids_for_user


class MeApiView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SelfProfileSerializer

    def get(self, request):
        user = get_object_or_404(User, id=self.request.user.id)
        serializer = self.serializer_class(user, context={"request": request})
        return Response(serializer.data)

    def patch(self, request):
        serializer = self.serializer_class(
            request.user,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
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

        if not is_platform_user(user):
            organization_ids = organization_ids_for_user(user)
            queryset = queryset.exclude(role__in=[ADMIN, ADMIN_STAFF]).filter(
                Q(organization_memberships__organization_id__in=organization_ids)
                | Q(organization_memberships__isnull=True)
            )
        elif user.role == ADMIN_STAFF:
            queryset = queryset.exclude(role=ADMIN)

        return queryset.distinct()


class UserDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = UserSerializer
    permission_classes = [EmployeePermission]
    queryset = User.objects.all()

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return self.queryset

        user = self.request.user
        queryset = User.get_non_student_teacher_users()

        if not is_platform_user(user):
            organization_ids = organization_ids_for_user(user)
            queryset = queryset.exclude(role__in=[ADMIN, ADMIN_STAFF]).filter(
                Q(organization_memberships__organization_id__in=organization_ids)
                | Q(organization_memberships__isnull=True)
            )
        elif user.role == ADMIN_STAFF:
            queryset = queryset.exclude(role=ADMIN)
        return queryset.distinct()
