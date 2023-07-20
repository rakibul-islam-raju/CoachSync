import random
import string
from django.conf import settings
from django.utils.html import strip_tags
from django.template.loader import render_to_string
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework import status
from rest_framework.response import Response
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend

from .models import User
from .permissions import IsSuperUser
from .serializers import UserSerializer, UserCreateSerializer

from utilities.utils import send_email


class UserListCreateView(ListCreateAPIView):
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

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            user = serializer.save(password=None, is_active=False)

            # generate token for set new password
            token = "".join(random.choices(string.ascii_letters + string.digits, k=100))
            user.password_reset_token = token
            user.save()

            # email content
            to_email = email
            reset_url = f"{settings.FRONTEND_BASE_URL}/set-password/{token}"
            html_content = render_to_string(
                "set_password_email.html", {"reset_url": reset_url, "user": user}
            )
            plain_message = strip_tags(html_content)

            # send email to set password
            send_email(
                subject="Set your password",
                plain_message=plain_message,
                to_email=[to_email],
                html_content=html_content,
            )

            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data, status=status.HTTP_201_CREATED, headers=headers
            )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsSuperUser]
    queryset = User.objects.all()
