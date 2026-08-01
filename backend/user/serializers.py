import random
import string

from django.conf import settings
from django.db import transaction
from django.utils.html import strip_tags
from django.template.loader import render_to_string

from rest_framework import serializers

from .models import ADMIN_STAFF, ORG_ADMIN, ORG_STAFF, User
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
    organization = serializers.IntegerField(write_only=True, required=False)
    organizations = serializers.SerializerMethodField()

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
            "organization",
            "organizations",
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
        from organization.tenancy import resolve_request_organization

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

        organization = attrs.pop("organization", None)
        if new_role in {ORG_ADMIN, ORG_STAFF}:
            request_data = dict(self.initial_data)
            if organization:
                request_data["organization"] = organization
            attrs["_organization"] = resolve_request_organization(
                self.context["request"], data=request_data, write=True
            )
        elif organization:
            raise serializers.ValidationError(
                {"organization": "Platform employees do not belong to an organization."}
            )
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        organization = validated_data.pop("_organization", None)
        validated_data["is_staff"] = validated_data.get("role") == ADMIN_STAFF
        validated_data["is_superuser"] = False
        user = super().create(validated_data)
        if organization:
            from organization.models import OrganizationMembership

            OrganizationMembership.objects.create(
                organization=organization,
                user=user,
                is_default=True,
                created_by=self.context["request"].user,
            )
        self.send_creation_email(user)
        return user

    @transaction.atomic
    def update(self, instance, validated_data):
        organization = validated_data.pop("_organization", None)
        updated_user = super().update(instance, validated_data)
        updated_user.is_staff = updated_user.role == ADMIN_STAFF
        updated_user.is_superuser = False
        updated_user.save(update_fields=["is_staff", "is_superuser"])
        if organization:
            from organization.models import OrganizationMembership

            OrganizationMembership.objects.update_or_create(
                organization=organization,
                user=updated_user,
                defaults={"is_default": True},
            )
        return updated_user

    def get_organizations(self, user) -> list[int]:
        return list(
            user.organization_memberships.filter(is_active=True).values_list(
                "organization_id", flat=True
            )
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


class SelfProfileSerializer(serializers.ModelSerializer):
    organizations = serializers.SerializerMethodField()

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
            "organizations",
        ]
        read_only_fields = ["id", "email", "role", "is_active", "organizations"]

    def get_organizations(self, user) -> list[dict]:
        return list(
            user.organization_memberships.filter(is_active=True).values(
                "organization_id", "organization__name", "is_default"
            )
        )
