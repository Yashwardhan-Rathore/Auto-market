from django.contrib import admin

from apps.communications.models import (
    CommunicationEvent,
    OrganizationEmailProvider,
)


@admin.register(OrganizationEmailProvider)
class OrganizationEmailProviderAdmin(admin.ModelAdmin):
    list_display = (
        "organization",
        "provider",
        "verified_domain",
        "daily_limit",
        "monthly_limit",
        "is_active",
    )
    list_filter = (
        "provider",
        "is_active",
    )
    search_fields = (
        "organization__email",
        "verified_domain",
    )
    readonly_fields = (
        "id",
        "created_at",
        "updated_at",
    )


@admin.register(CommunicationEvent)
class CommunicationEventAdmin(admin.ModelAdmin):
    list_display = (
        "channel",
        "event_name",
        "recipient",
        "status",
        "organization",
        "created_at",
    )
    list_filter = (
        "channel",
        "event_name",
        "status",
    )
    search_fields = (
        "recipient",
        "provider_message_id",
        "organization__email",
    )
    readonly_fields = (
        "id",
        "created_at",
    )

