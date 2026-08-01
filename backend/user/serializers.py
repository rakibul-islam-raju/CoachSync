import random
import string

from django.conf import settings
from django.utils.html import strip_tags
from django.template.loader import render_to_string

from rest_framework import serializers

from .models import ADMIN_STAFF, User
from .permissions import can_manage_employee, get_manageable_employee_roles

from utilities.tasks import send_email


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
            "is_staff": {"read_only": True},
            "is_superuser": {"read_only": True},
            "created_at": {"read_only": True},
            "updated_at": {"read_only": True},
            "last_login": {"read_only": True},
        }

    def validate(self, attrs):
        request_user = self.context["request"].user
        privileged_fields = {"is_staff", "is_superuser"}.intersection(
            self.initial_data.keys()
        )
        if privileged_fields:
            raise serializers.ValidationError(
                {
                    field: "This field cannot be changed through the employee API."
                    for field in privileged_fields
                }
            )

        if self.instance and not can_manage_employee(request_user, self.instance):
            raise serializers.ValidationError(
                "You don't have permission to update this employee."
            )

        new_role = attrs.get("role", getattr(self.instance, "role", None))
        if new_role not in get_manageable_employee_roles(request_user):
            raise serializers.ValidationError(
                {"role": "You don't have permission to assign this role."}
            )

        return attrs

    def create(self, validated_data):
        validated_data["is_staff"] = validated_data.get("role") == ADMIN_STAFF
        validated_data["is_superuser"] = False
        user = super().create(validated_data)
        self.send_creation_email(user)
        return user

    def update(self, instance, validated_data):
        updated_user = super().update(instance, validated_data)
        updated_user.is_staff = updated_user.role == ADMIN_STAFF
        updated_user.is_superuser = False
        updated_user.save(update_fields=["is_staff", "is_superuser"])
        return updated_user

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
        send_email.delay(
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
