from rest_framework.permissions import BasePermission
from apps.accounts.models import MAUser


class RolePermission(BasePermission):

    def get_role(self, request):
        if not request.user.is_authenticated:
            return None

        ma_user = MAUser.objects.filter(
            user_id=request.user
        ).first()

        if not ma_user:
            return None

        return ma_user.role


class IsAdminManager(RolePermission):
    """
    Allow only ADMIN and SUPER_ADMIN.
    """

    def has_permission(self, request, view):
        role = self.get_role(request)

        return role in [
            "ADMIN",
            "SUPER_ADMIN",
        ]


class IsAssignedUser(BasePermission):
    """
    User can access only their own assignment.
    """

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class IsTaskOwner(RolePermission):
    """
    Admin can manage only their own tasks.
    """

    def has_object_permission(self, request, view, obj):

        role = self.get_role(request)

        if role == "SUPER_ADMIN":
            return True

        return obj.created_by == request.user


class CanApproveTask(RolePermission):
    """
    Admin can approve only their own team's tasks.
    """

    def has_object_permission(self, request, view, obj):

        role = self.get_role(request)

        if role == "SUPER_ADMIN":
            return True

        return obj.task.created_by == request.user


class CanViewTeamTasks(RolePermission):
    """
    Admin can view only own team tasks.
    """

    def has_permission(self, request, view):

        role = self.get_role(request)

        return role in [
            "ADMIN",
            "SUPER_ADMIN",
        ]


class IsNotUser(RolePermission):

    def has_permission(self, request, view):

        role = self.get_role(request)

        return role != "USER"