from rest_framework.permissions import BasePermission


class IsAdminOrSuperAdmin(BasePermission):
    """
    Allows access only to Admin and Super Admin users.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in ["ADMIN", "SUPER_ADMIN"]
        )