from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import PasswordResetOTP, User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    ordering = ("email",)

    list_display = (
        "email",
        "is_staff",
        "is_superuser",
        "is_active",
    )

    search_fields = ("email",)

    fieldsets = (
        (None, {"fields": ("email", "password")}),
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
        ("Important dates", {"fields": ("last_login",)}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "password1",
                    "password2",
                    "is_staff",
                    "is_superuser",
                    "is_active",
                ),
            },
        ),
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
    list_filter = ("is_used", "created_at", "expires_at")
    search_fields = ("user__email", "otp")
    readonly_fields = ("created_at",)
