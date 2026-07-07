from rest_framework.permissions import BasePermission
from apps.accounts.models import MAUser


class CanAccessForms(BasePermission):

    def has_permission(self, request, view):

        if not request.user.is_authenticated:
            return False

        ma_user = MAUser.objects.filter(
            user_id=request.user
        ).first()

        if not ma_user:
            return False

        return ma_user.role in [
            "ADMIN",
            "USER",
        ]


class IsFormOwner(BasePermission):

    def has_object_permission(
        self,
        request,
        view,
        obj,
    ):
        return obj.created_by == request.user