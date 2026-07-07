from django.contrib import admin

from apps.events.models import WebsiteEvent


@admin.register(WebsiteEvent)
class WebsiteEventAdmin(admin.ModelAdmin):
    list_display = (
        "event_name",
        "organization",
        "user_identifier",
        "session_id",
        "url",
        "created_at",
    )
    list_filter = (
        "event_name",
        "created_at",
    )
    search_fields = (
        "user_identifier",
        "session_id",
        "url",
    )
    readonly_fields = (
        "id",
        "created_at",
    )

