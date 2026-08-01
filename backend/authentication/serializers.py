from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from user.models import User


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Token serializer
    """

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        user_info = {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone": user.phone,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "organizations": list(
                user.organization_memberships.filter(is_active=True).values_list(
                    "organization_id", flat=True
                )
            ),
        }
        token["user"] = user_info

        return token


class UserCreationSerializer(serializers.ModelSerializer):
    """
    User create serializer (Super admin will create the user without password)
    """

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "email",
            "phone",
            "is_active",
            "is_staff",
            "is_superuser",
            "role",
        ]


class UserSetPasswordSerializer(serializers.Serializer):
    """
    Serializer for password set
    """

    token = serializers.CharField(max_length=100)
    password = serializers.CharField(max_length=128)

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as error:
            raise serializers.ValidationError(error.messages) from error
        return value


class ForgetPasswordSerializer(serializers.Serializer):
    """
    Serializer for forget password
    """

    email = serializers.EmailField()


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for change password
    """

    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        try:
            validate_password(value, user=self.context.get("user"))
        except DjangoValidationError as error:
            raise serializers.ValidationError(error.messages) from error
        return value


class LogoutSerializer(serializers.Serializer):
    """
    Serializer for logout
    """

    refresh = serializers.CharField()
