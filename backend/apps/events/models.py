import uuid

from django.conf import settings
from django.db import models


class WebsiteEvent(models.Model):
    SUPPORTED_EVENTS = [
        ("PAGE_VISITED", "Page Visited"),
        ("BUTTON_CLICKED", "Button Clicked"),
        ("LINK_CLICKED", "Link Clicked"),
        ("PRODUCT_VIEWED", "Product Viewed"),
        ("CART_ABANDONED", "Cart Abandoned"),
        ("CHECKOUT_STARTED", "Checkout Started"),
        ("CHECKOUT_COMPLETED", "Checkout Completed"),
    ]

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    organization = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="website_events",
    )
    event_name = models.CharField(
        max_length=100,
        choices=SUPPORTED_EVENTS,
        db_index=True,
    )
    user_identifier = models.CharField(
        max_length=255,
        db_index=True,
    )
    session_id = models.CharField(
        max_length=255,
        blank=True,
        db_index=True,
    )
    url = models.CharField(
        max_length=2048,
        blank=True,
    )
    metadata = models.JSONField(
        default=dict,
        blank=True,
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
    )

    class Meta:
        db_table = "website_event"
        indexes = [
            models.Index(fields=["organization", "event_name"]),
            models.Index(fields=["organization", "user_identifier"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"{self.event_name} - {self.user_identifier}"

