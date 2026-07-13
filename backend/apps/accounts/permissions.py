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

class IsSuperAdminOrOwnManagedUser(BasePermission):
    """
    Allows modification only if:
    - User is SUPER_ADMIN modifying an ADMIN
    - User is ADMIN modifying a USER they manage
    """

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False

        ma = getattr(request.user, 'ma_users', None)
        ma = ma.first() if ma else None
        if not ma:
            return False

        # Assuming obj is a User model instance
        target_ma = getattr(obj, 'ma_users', None)
        target_ma = target_ma.first() if target_ma else None
        if not target_ma:
            return False

        if ma.role == 'SUPER_ADMIN':
            return target_ma.role == 'ADMIN' and obj.company == request.user.company
        elif ma.role == 'ADMIN':
            return getattr(target_ma, 'managed_by_id', None) == ma.id and obj.company == request.user.company
            
        return False