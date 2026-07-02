from rest_framework.permissions import BasePermission

from .models import Task, TaskAssignment

class IsAdminManager(BasePermission):
    """
    Allow only ADMIN and SUPER_ADMIN.
    """

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated
            and request.user.role in [
                "ADMIN",
                "SUPER_ADMIN",
            ]
        )
    

class IsAssignedUser(BasePermission):
    """
    User can access only
    their own assignment.
    """

    def has_object_permission(
        self,
        request,
        view,
        obj,
    ):

        return obj.user == request.user
    

class IsTaskOwner(BasePermission):
    """
    Admin can manage
    only their own tasks.
    """

    def has_object_permission(
        self,
        request,
        view,
        obj,
    ):

        if request.user.role == "SUPER_ADMIN":
            return True

        return obj.created_by == request.user
    

class CanApproveTask(BasePermission):
    """
    Admin can approve
    only their own team's tasks.
    """

    def has_object_permission(
        self,
        request,
        view,
        obj,
    ):

        if request.user.role == "SUPER_ADMIN":
            return True

        return (
            obj.task.created_by
            == request.user
        )
    

class CanViewTeamTasks(
    BasePermission
):
    """
    Admin can view
    only own team tasks.
    """

    def has_permission(
        self,
        request,
        view,
    ):

        return (
            request.user.role
            in [
                "ADMIN",
                "SUPER_ADMIN",
            ]
        )
    
class IsNotUser(
    BasePermission
):

    def has_permission(
        self,
        request,
        view,
    ):

        return (
            request.user.role
            != "USER"
        )
    
class IsNotUser(
    BasePermission
):

    def has_permission(
        self,
        request,
        view,
    ):

        return (
            request.user.role
            != "USER"
        )
    
