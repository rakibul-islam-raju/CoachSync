from collections.abc import Mapping

from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied, ValidationError

from user.models import ADMIN, ADMIN_STAFF

from .models import (
    LEGACY_ORGANIZATION_SLUG,
    Organization,
    OrganizationMembership,
    get_legacy_organization_pk,
)


PLATFORM_ROLES = {ADMIN, ADMIN_STAFF}


def is_platform_user(user):
    return bool(
        user
        and user.is_authenticated
        and (user.is_superuser or user.role in PLATFORM_ROLES)
    )


def _requested_organization_id(request, data=None):
    requested = request.headers.get("X-Organization-ID")
    if not requested:
        requested = request.query_params.get("organization")
    if not requested and isinstance(data, Mapping):
        requested = data.get("organization")
    return getattr(requested, "pk", requested)


def resolve_request_organization(request, *, data=None, write=False):
    """Resolve and authorize the tenant selected for the current request."""

    requested_id = _requested_organization_id(request, data)
    if is_platform_user(request.user):
        if write and not requested_id:
            raise ValidationError(
                {"organization": "Platform-level writes require a target organization."}
            )
        if not requested_id:
            return None
        return get_object_or_404(Organization, pk=requested_id, is_active=True)

    memberships = OrganizationMembership.objects.filter(
        user=request.user, is_active=True, organization__is_active=True
    ).select_related("organization")
    if requested_id:
        membership = memberships.filter(organization_id=requested_id).first()
        if not membership:
            raise PermissionDenied("You do not belong to this organization.")
        return membership.organization

    membership = memberships.order_by("-is_default", "id").first()
    if membership:
        return membership.organization

    # Compatibility for users created before membership support. The migration
    # creates these memberships, while this fallback keeps old fixtures usable.
    return Organization.objects.get(pk=get_legacy_organization_pk())


def organization_ids_for_user(user):
    if is_platform_user(user):
        return None
    ids = list(
        OrganizationMembership.objects.filter(
            user=user, is_active=True, organization__is_active=True
        ).values_list("organization_id", flat=True)
    )
    return ids or [get_legacy_organization_pk()]


class TenantQuerysetMixin:
    organization_field = "organization"

    def get_queryset(self):
        queryset = super().get_queryset()
        organization = resolve_request_organization(self.request)
        if organization is None:
            return queryset
        return queryset.filter(
            **{f"{self.organization_field}_id": organization.pk}
        )

    def get_write_organization(self, data=None):
        return resolve_request_organization(self.request, data=data, write=True)


def validate_same_organization(organization, **relationships):
    errors = {}
    for field, value in relationships.items():
        if value is not None and value.organization_id != organization.id:
            errors[field] = "The selected record belongs to another organization."
    if errors:
        raise ValidationError(errors)


def legacy_organization():
    return Organization.objects.get(slug=LEGACY_ORGANIZATION_SLUG)
