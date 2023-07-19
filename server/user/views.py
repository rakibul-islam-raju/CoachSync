from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend

from .models import User
from .permissions import IsSuperUser, IsRequesteduser
from .serializers import UserSerializer, UserCreateSerializer


class UserListView(ListCreateAPIView):
    permission_classes = [IsSuperUser]
    queryset = User.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["is_active", "is_staff", "is_superuser", "role"]
    search_fields = ["email", "first_name", "last_name", "phone"]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return UserCreateSerializer
        else:
            return UserSerializer


class UserDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsSuperUser]
    queryset = User.objects.all()
