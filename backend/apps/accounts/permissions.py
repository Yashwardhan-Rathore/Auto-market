from rest_framework.permissions import BasePermission
from .models import MAUser


class IsAdminOrSuperAdmin(BasePermission):
    """
    Allows access only to Admin and Super Admin users.
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        ma_user = MAUser.objects.filter(user_id=request.user).first()

        if not ma_user:
            return False

        return ma_user.role in ["ADMIN", "SUPER_ADMIN"]

class IsSuperAdmin(BasePermission):
    """
    Allows access only to Super Admin users.
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        ma_user = MAUser.objects.filter(user=request.user).first()

        if not ma_user:
            return False

        return ma_user.role == "SUPER_ADMIN"

class IsAdmin(BasePermission):
    """
    Allows access only to Admin users.
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        ma_user = MAUser.objects.filter(user=request.user).first()

        if not ma_user:
            return False

        return ma_user.role == "ADMIN"