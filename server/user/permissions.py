from rest_framework.permissions import BasePermission


class IsSuperUser(BasePermission):
    """
    Allows access only to superusers.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_superuser


class IsRequesteduser(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user == obj:
            return True


class IsOrgAdmin(BasePermission):
    def has_permission(self, request, view):
        if request.user.role == "OA":
            return True


class IsOrgAdmin(BasePermission):
    def has_permission(self, request, view):
        if request.user.role == "OA" or request.user.is_staff:
            return True


class IsOrgStaff(BasePermission):
    def has_permission(self, request, view):
        if (
            request.user.role == "OS"
            or request.user.role == "OA"
            or request.user.is_staff
        ):
            return True
