import random
import string
from django.conf import settings
from django.core.mail import send_mail
from django.utils.html import strip_tags
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from django.core.exceptions import ObjectDoesNotExist, ValidationError

from rest_framework.views import APIView
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.exceptions import TokenError

from .serializers import (
    CustomTokenObtainPairSerializer,
    UserCreationSerializer,
    UserSetPasswordSerializer,
    ForgetPasswordSerializer,
    ChangePasswordSerializer,
    LogoutSerializer,
)

from user.models import User
from user.permissions import IsSuperUser


class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer


class LogoutView(APIView):
    serializer_class = LogoutSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            refresh = RefreshToken(serializer.validated_data["refresh"])
            print(refresh)
            refresh.blacklist()
        except TokenError:
            pass

        return Response({"detail": "Successfully logged out."})


class UserCreateView(generics.CreateAPIView):
    """
    Super admin will create user without password
    """

    permission_classes = [IsSuperUser]
    queryset = User.objects.all()
    serializer_class = UserCreationSerializer

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
            subject = "Set your password"
            to_email = email
            reset_url = f"{settings.FRONTEND_BASE_URL}/set-password/{token}"
            html_content = render_to_string(
                "set_password_email.html", {"reset_url": reset_url, "user": user}
            )

            # send email to set password
            plain_message = strip_tags(html_content)
            send_mail(
                subject,
                plain_message,
                settings.DEFAULT_FROM_EMAIL,
                [to_email],
                html_message=html_content,
            )

            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data, status=status.HTTP_201_CREATED, headers=headers
            )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ForgetPasswordView(APIView):
    permission_classes = [AllowAny]
    serializer_class = ForgetPasswordSerializer()

    def post(self, request):
        serializer = ForgetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        user = get_object_or_404(User, email=email)
        if user:
            # generate token for set new password
            token = "".join(random.choices(string.ascii_letters + string.digits, k=100))
            user.password_reset_token = token
            user.save()

            # email content
            subject = "Set your password"
            to_email = email
            reset_url = f"{settings.FRONTEND_BASE_URL}/set-password/{token}"
            html_content = render_to_string(
                "set_password_email.html", {"reset_url": reset_url, "user": user}
            )

            # send email to set password
            plain_message = strip_tags(html_content)
            send_mail(
                subject,
                plain_message,
                settings.DEFAULT_FROM_EMAIL,
                [to_email],
                html_message=html_content,
            )

            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data, status=status.HTTP_201_CREATED, headers=headers
            )
        return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)


class UserSetPasswordView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = UserSetPasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data["token"]
            password = serializer.validated_data["password"]
            try:
                user = User.objects.get(password_reset_token=token)
                user.set_password(password)
                user.password_reset_token = ""
                user.is_active = True
                user.save()
                return Response(
                    {"message": "Password set successfully."}, status=status.HTTP_200_OK
                )
            except ObjectDoesNotExist:
                return Response(
                    {"message": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST
                )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    def post(self, request, *args, **kwargs):
        user = get_object_or_404(User, pk=self.kwargs.get("pk"))

        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        old_password = serializer.validated_data["old_password"]
        new_password = serializer.validated_data["new_password"]

        if not user.check_password(old_password):
            raise ValidationError("Invalid old password.")

        user.set_password(new_password)
        user.save()

        return Response({"message": "Password changed"}, status=status.HTTP_200_OK)
