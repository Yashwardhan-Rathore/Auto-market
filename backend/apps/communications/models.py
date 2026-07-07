import uuid

from django.conf import settings
from django.db import models


class OrganizationEmailProvider(models.Model):
    PROVIDERS = [
        ("SMTP", "SMTP"),
        ("AWS_SES", "Amazon SES"),
    ]

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    organization = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="email_providers",
    )
    provider = models.CharField(
        max_length=50,
        choices=PROVIDERS,
        default="SMTP",
    )
    aws_access_key = models.CharField(
        max_length=255,
        blank=True,
    )
    aws_secret_key = models.CharField(
        max_length=255,
        blank=True,
    )
    aws_region = models.CharField(
        max_length=100,
        blank=True,
    )
    verified_domain = models.CharField(
        max_length=255,
        blank=True,
    )
    daily_limit = models.PositiveIntegerField(
        default=0,
    )
    monthly_limit = models.PositiveIntegerField(
        default=0,
    )
    is_active = models.BooleanField(
        default=True,
        db_index=True,
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
    )
    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        db_table = "organization_email_provider"
        indexes = [
            models.Index(fields=["organization", "is_active"]),
            models.Index(fields=["provider"]),
        ]

    def __str__(self):
        return f"{self.organization} - {self.provider}"


class CommunicationEvent(models.Model):
    CHANNELS = [
        ("EMAIL", "Email"),
        ("SMS", "SMS"),
        ("WHATSAPP", "WhatsApp"),
        ("NOTIFICATION", "Notification"),
    ]
    STATUSES = [
        ("SENT", "Sent"),
        ("DELIVERED", "Delivered"),
        ("OPENED", "Opened"),
        ("CLICKED", "Clicked"),
        ("READ", "Read"),
        ("REPLIED", "Replied"),
        ("BOUNCED", "Bounced"),
        ("UNSUBSCRIBED", "Unsubscribed"),
        ("FAILED", "Failed"),
    ]

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    organization = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="communication_events",
    )
    execution = models.ForeignKey(
        "automation.AutomationExecution",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="communication_events",
    )
    channel = models.CharField(
        max_length=30,
        choices=CHANNELS,
        db_index=True,
    )
    event_name = models.CharField(
        max_length=100,
        db_index=True,
    )
    recipient = models.CharField(
        max_length=255,
        db_index=True,
    )
    status = models.CharField(
        max_length=30,
        choices=STATUSES,
        db_index=True,
    )
    provider_message_id = models.CharField(
        max_length=255,
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
        db_table = "communication_event"
        indexes = [
            models.Index(fields=["organization", "channel", "status"]),
            models.Index(fields=["event_name"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"{self.channel} - {self.event_name} - {self.recipient}"

