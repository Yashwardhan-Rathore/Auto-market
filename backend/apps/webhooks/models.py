import uuid

from django.db import models


class WebhookEvent(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    secret = models.CharField(
        max_length=255,
        db_index=True,
    )
    payload = models.JSONField(
        default=dict,
        blank=True,
    )
    headers = models.JSONField(
        default=dict,
        blank=True,
    )
    processed = models.BooleanField(
        default=False,
        db_index=True,
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
    )

    class Meta:
        db_table = "webhook_event"
        indexes = [
            models.Index(fields=["secret", "processed"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"{self.secret} - {self.processed}"

