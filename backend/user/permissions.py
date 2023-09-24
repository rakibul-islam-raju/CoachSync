from rest_framework.permissions import BasePermission

from .models import ADMIN, ADMIN_STAFF, ORG_ADMIN, ORG_STAFF


class IsRequesteduser(BasePermission):
    """
    Allows access only to owner of the object.
    """

    def has_object_permission(self, request, view, obj):
        if request.user == obj:
            return True


class IsSuperUser(BasePermission):
    """
    Allows access only to superusers.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_superuser


class IsAdminStaff(BasePermission):
    """
    Allows access only to admin staff and above.
    """

    def has_permission(self, request, view):
        if request.user.role == ADMIN_STAFF or request.user.role == ADMIN:
            return True


class IsOrgAdmin(BasePermission):
    """
    Allows access only to organization admin and above.
    """

    def has_permission(self, request, view):
        if (
            request.user.role == ORG_ADMIN
            or request.user.role == ADMIN_STAFF
            or request.user.role == ADMIN
        ):
            return True


class IsOrgStaff(BasePermission):
    """
    Allows access only to organization staff and above.
    """

    def has_permission(self, request, view):
        if (
            request.user.role == ORG_STAFF
            or request.user.role == ORG_ADMIN
            or request.user.role == ADMIN_STAFF
            or request.user.role == ADMIN
        ):
            return True
