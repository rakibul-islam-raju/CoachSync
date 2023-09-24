import random
import string

from django.conf import settings
from django.utils.html import strip_tags
from django.template.loader import render_to_string

from rest_framework import serializers

from .models import User, ADMIN, ADMIN_STAFF, ORG_ADMIN, ORG_STAFF

from utilities.utils import send_email


# class UserCreateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = [
#             "first_name",
#             "last_name",
#             "email",
#             "phone",
#             "role",
#             "is_staff",
#             "is_superuser",
#         ]


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "phone",
            "role",
            "is_active",
            "is_staff",
            "is_superuser",
            "created_at",
            "updated_at",
            "last_login",
        ]

        extra_kwargs = {
            "id": {"read_only": True},
            "created_at": {"read_only": True},
            "updated_at": {"read_only": True},
            "last_login": {"read_only": True},
        }

    def create(self, validated_data):
        request_user = self.context["request"].user
        user_role = request_user.role
        new_user_role = validated_data.get("role")

        if user_role == ADMIN:
            user = super().create(validated_data)
            self.send_creation_email(user)
            return user
        elif user_role == ADMIN_STAFF and new_user_role in [
            ADMIN_STAFF,
            ORG_ADMIN,
            ORG_STAFF,
        ]:
            user = super().create(validated_data)
            self.send_creation_email(user)
            return user
        elif user_role == ORG_ADMIN and new_user_role in [
            ORG_ADMIN,
            ORG_STAFF,
        ]:
            user = super().create(validated_data)
            self.send_creation_email(user)
            return user
        elif user_role == ORG_STAFF and new_user_role == ORG_STAFF:
            user = super().create(validated_data)
            self.send_creation_email(user)
            return user
        else:
            raise serializers.ValidationError(
                "You don't have permission to create a user with this role."
            )

    def update(self, instance, validated_data):
        request_user = self.context["request"].user
        user_role = request_user.role

        if user_role == ADMIN:
            # Admin can update any user
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            return instance
        elif user_role == ADMIN_STAFF and instance.role in [ORG_ADMIN, ORG_STAFF]:
            # Admin staff can only update his lower level user
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            return instance
        elif user_role == ORG_ADMIN and instance.role == ORG_STAFF:
            # Org admin can only update his lower level user
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            return instance
        else:
            raise serializers.ValidationError(
                "You don't have permission to update a user with this role."
            )

    def send_creation_email(self, user):
        # generate token for set new password
        token = "".join(random.choices(string.ascii_letters + string.digits, k=100))
        user.password_reset_token = token
        user.save()

        # email content
        to_email = user.email
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


class ExtendedUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "email",
            "phone",
        ]
