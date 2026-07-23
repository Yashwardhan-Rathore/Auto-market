from rest_framework.permissions import BasePermission

from .models import MAUser, User


SUPER_ADMIN = "SUPER_ADMIN"
ADMIN = "ADMIN"
USER = "USER"


def _is_authenticated(user):
    """Return a real boolean for Django users, anonymous users, and None."""
    return bool(user and getattr(user, "is_authenticated", False))


def get_request_role(user):
    """Resolve a user's effective role consistently across the API."""
    if not _is_authenticated(user):
        return None

    # A Django superuser must never be downgraded by a stale MAUser row.
    if getattr(user, "is_superuser", False):
        return SUPER_ADMIN

    return (
        MAUser.objects.filter(user=user)
        .values_list("role", flat=True)
        .first()
    )


def _get_role_profile(user, role=None):
    """Return the MAUser row matching the user's effective (or requested) role."""
    if not _is_authenticated(user):
        return None

    expected_role = role or get_request_role(user)
    if expected_role is None:
        return None

    return (
        MAUser.objects.select_related("user", "managed_by")
        .filter(user=user, role=expected_role)
        .first()
    )


def _get_target_profile(obj):
    """Resolve an MAUser profile from either an MAUser or a User instance."""
    if isinstance(obj, MAUser):
        return obj
    if isinstance(obj, User):
        return _get_role_profile(obj)
    return None


class IsAdminOrSuperAdmin(BasePermission):
    """Allow authenticated Admin and Super Admin users."""

    message = "Admin or Super Admin access is required."

    def has_permission(self, request, view):
        return get_request_role(getattr(request, "user", None)) in {
            ADMIN,
            SUPER_ADMIN,
        }


class IsSuperAdminOrOwnManagedUser(BasePermission):
    """Allow Super Admins to manage Admins and Admins to manage their Users."""

    message = "You do not have permission to manage this account."

    def has_permission(self, request, view):
        return get_request_role(getattr(request, "user", None)) in {
            ADMIN,
            SUPER_ADMIN,
        }

    def has_object_permission(self, request, view, obj):
        request_user = getattr(request, "user", None)
        request_role = get_request_role(request_user)
        target_profile = _get_target_profile(obj)

        if target_profile is None:
            return False

        if request_role == SUPER_ADMIN:
            return target_profile.role == ADMIN

        if request_role != ADMIN or target_profile.role != USER:
            return False

        admin_profile = _get_role_profile(request_user, ADMIN)
        return bool(
            admin_profile
            and target_profile.managed_by_id == admin_profile.id
        )


class IsContentStudioAuthorized(BasePermission):
    """Allow authenticated platform roles to use Content Studio."""

    message = "A valid Auto Market account is required."

    def has_permission(self, request, view):
        request_user = getattr(request, "user", None)
        role = get_request_role(request_user)
        if role not in {SUPER_ADMIN, ADMIN, USER}:
            return False

        profile = _get_role_profile(request_user, role)
        if profile is None and role != SUPER_ADMIN:
            return False

        # Content services consume these effective values during the request.
        request_user.role = role
        request_user.requires_approval = (
            profile.requires_approval if profile is not None else False
        )
        return True


class IsSuperAdmin(BasePermission):
    """Allow only effective Super Admin users."""

    message = "Super Admin access is required."

    def has_permission(self, request, view):
        return get_request_role(getattr(request, "user", None)) == SUPER_ADMIN


class IsAdmin(BasePermission):
    """Allow only effective Admin users."""

    message = "Admin access is required."

    def has_permission(self, request, view):
        return get_request_role(getattr(request, "user", None)) == ADMIN


class IsMarketingUser(BasePermission):
    """Allow only effective Marketing User accounts."""

    message = "Marketing User access is required."

    def has_permission(self, request, view):
        return get_request_role(getattr(request, "user", None)) == USER


class CanBootstrapSuperAdmin(BasePermission):
    """Allow one anonymous bootstrap, then require an existing Super Admin."""

    message = "Super Admin creation is restricted to an existing Super Admin."

    def has_permission(self, request, view):
        super_admin_exists = (
            MAUser.objects.filter(role=SUPER_ADMIN).exists()
            or User.objects.filter(is_superuser=True).exists()
        )
        if not super_admin_exists:
            return True

        return get_request_role(getattr(request, "user", None)) == SUPER_ADMIN
