from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import (
    User,
    MAUser,
    PasswordResetOTP,
    AccessRequest,
)


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    ordering = ("email",)

    list_display = (
        "email",
        "username",
        "is_staff",
        "is_superuser",
        "is_active",
    )

    search_fields = ("email", "username")

    fieldsets = (
        (None, {"fields": ("email", "username", "password")}),
        (
            "Personal Info",
            {
                "fields": (
                    "first_name",
                    "last_name",
                )
            },
        ),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        (
            "Important dates",
            {
                "fields": (
                    "last_login",
                    "date_joined",
                )
            },
        ),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "username",
                    "password1",
                    "password2",
                    "is_staff",
                    "is_superuser",
                    "is_active",
                ),
            },
        ),
    )


@admin.register(MAUser)
class MAUserAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user_id",
        "role",
        "created_at",
    )

    list_filter = (
        "role",
        "created_at",
    )

    search_fields = (
        "user_id__email",
        "user_id__username",
    )


@admin.register(AccessRequest)
class AccessRequestAdmin(admin.ModelAdmin):
    list_display = (
        "full_name",
        "email",
        "department",
        "designation",
        "status",
        "approved_by",
        "created_at",
    )

    list_filter = (
        "status",
        "department",
        "created_at",
    )

    search_fields = (
        "full_name",
        "email",
    )


@admin.register(PasswordResetOTP)
class PasswordResetOTPAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "otp",
        "expires_at",
        "is_used",
        "created_at",
    )

    list_filter = (
        "is_used",
        "created_at",
        "expires_at",
    )

    search_fields = (
        "user__email",
        "otp",
    )

    readonly_fields = ("created_at",)