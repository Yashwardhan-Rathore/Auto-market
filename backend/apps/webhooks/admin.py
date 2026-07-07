from django.contrib import admin

from apps.webhooks.models import WebhookEvent


@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    list_display = (
        "secret",
        "processed",
        "created_at",
    )
    list_filter = (
        "processed",
        "created_at",
    )
    search_fields = (
        "secret",
    )
    readonly_fields = (
        "id",
        "created_at",
    )

