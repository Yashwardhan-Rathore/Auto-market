from rest_framework.permissions import BasePermission


class CanAccessForms(BasePermission):

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated
            and request.user.role in [
                "ADMIN",
                "USER",
            ]
        )


class IsFormOwner(BasePermission):

    def has_object_permission(
        self,
        request,
        view,
        obj
    ):
        return obj.created_by == request.user