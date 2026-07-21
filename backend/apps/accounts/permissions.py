from rest_framework.permissions import BasePermission
from .models import MAUser


def get_request_role(user):
    """Resolve roles consistently with login/profile responses."""
    if not user or not user.is_authenticated:
        return None
    ma_role = MAUser.objects.filter(user=user).values_list("role", flat=True).first()
    if ma_role:
        return ma_role
    return "SUPER_ADMIN" if user.is_superuser else None


class IsAdminOrSuperAdmin(BasePermission):
    """
    Allows access only to Admin and Super Admin users.
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        from apps.common.ownership import get_admin_profile, is_super_admin
        if is_super_admin(request.user):
            return True
            
        profile = get_admin_profile(request.user)
        return profile is not None and profile.role == "ADMIN"

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
            return target_ma.role == 'ADMIN'
        elif ma.role == 'ADMIN':
            return getattr(target_ma, 'managed_by_id', None) == ma.id
            
        return False


class IsContentStudioAuthorized(BasePermission):
    """
    Role-based access control for Content Studio:
    Super Admin / Admin: Can approve, reject, schedule, and publish directly.
    User: Can create, edit, request approval. Cannot publish unless approved or approvals not required.
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        ma_user = MAUser.objects.filter(user=request.user).first()
        if not ma_user:
            return False
            
        request.user.role = ma_user.role  # Cache it on request.user for view logic
        return True

class IsSuperAdmin(BasePermission):
    """
    Allows access only to Super Admin users.
    """

    def has_permission(self, request, view):
        from apps.common.ownership import is_super_admin
        return is_super_admin(request.user)

class IsAdmin(BasePermission):
    """
    Allows access only to Admin users.
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        from apps.common.ownership import get_admin_profile
        profile = get_admin_profile(request.user)
        return profile is not None and profile.role == "ADMIN"

class IsMarketingUser(BasePermission):
    """
    Allows access only to Marketing users.
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        from apps.common.ownership import get_admin_profile
        profile = get_admin_profile(request.user)
        return profile is not None and profile.role == "USER"


class CanBootstrapSuperAdmin(BasePermission):
    """Allow a one-time anonymous bootstrap, then require a Super Admin."""

    message = "Super Admin creation is restricted to an existing Super Admin."

    def has_permission(self, request, view):
        if not MAUser.objects.filter(role="SUPER_ADMIN").exists():
            return True

        if not request.user.is_authenticated:
            return False

        return MAUser.objects.filter(
            user=request.user,
            role="SUPER_ADMIN",
        ).exists()
