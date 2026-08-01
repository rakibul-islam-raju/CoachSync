from rest_framework.permissions import BasePermission

from .models import ADMIN, ADMIN_STAFF, ORG_ADMIN, ORG_STAFF

OPERATIONAL_ROLES = {ADMIN, ADMIN_STAFF, ORG_ADMIN, ORG_STAFF}


def is_operational_user(user):
    return bool(
        user
        and user.is_authenticated
        and (user.is_superuser or user.role in OPERATIONAL_ROLES)
    )


def get_manageable_employee_roles(user):
    if not user or not user.is_authenticated:
        return set()
    if user.is_superuser or user.role == ADMIN:
        return {ADMIN_STAFF, ORG_ADMIN, ORG_STAFF}
    if user.role == ADMIN_STAFF:
        return {ORG_ADMIN, ORG_STAFF}
    if user.role == ORG_ADMIN:
        return {ORG_STAFF}
    return set()


def can_manage_employee(user, employee):
    return bool(
        employee
        and user != employee
        and not employee.is_superuser
        and employee.role in get_manageable_employee_roles(user)
    )


class IsRequesteduser(BasePermission):
    """
    Allows access only to owner of the object.
    """

    def has_object_permission(self, request, view, obj):
        return request.user == obj


class IsSuperUser(BasePermission):
    """
    Allows access only to superusers.
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)


class IsAdminStaff(BasePermission):
    """
    Allows access only to admin staff and above.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                request.user.is_superuser
                or request.user.role in {ADMIN, ADMIN_STAFF}
            )
        )


class IsOrgAdmin(BasePermission):
    """
    Allows access only to organization admin and above.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                request.user.is_superuser
                or request.user.role in {ADMIN, ADMIN_STAFF, ORG_ADMIN}
            )
        )


class IsOrgStaff(BasePermission):
    """
    Allows access only to organization staff and above.
    """

    def has_permission(self, request, view):
        return is_operational_user(request.user)


class EmployeePermission(BasePermission):
    """
    Operational roles may read employees; only roles with subordinates may mutate.
    """

    def has_permission(self, request, view):
        if not is_operational_user(request.user):
            return False
        if request.method in {"GET", "HEAD", "OPTIONS"}:
            return True
        return bool(get_manageable_employee_roles(request.user))

    def has_object_permission(self, request, view, obj):
        if request.method in {"GET", "HEAD", "OPTIONS"}:
            return True
        return can_manage_employee(request.user, obj)
