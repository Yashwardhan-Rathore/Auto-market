from django.db import models
from django.conf import settings
from apps.tasks.models import Task

class CustomerUpload(models.Model):
    class Status(models.TextChoices):
        PROCESSING = "PROCESSING", "Processing"
        COMPLETED = "COMPLETED", "Completed"
        FAILED = "FAILED", "Failed"

    original_file = models.FileField(
    upload_to="customer_uploads/",
    null=True,
    blank=True,
    )

    file_name = models.CharField(max_length=255)
    file_type = models.CharField(
    max_length=10,
    default="unknown",
    )

    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="customer_uploads",
    )

    uploaded_at = models.DateTimeField(auto_now_add=True)

    total_records = models.PositiveIntegerField(default=0)
    imported_records = models.PositiveIntegerField(default=0)
    failed_records = models.PositiveIntegerField(default=0)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PROCESSING,
    )

    def __str__(self):
        return self.file_name


class CustomerRecord(models.Model):
    upload = models.ForeignKey(
        CustomerUpload,
        on_delete=models.CASCADE,
        related_name="records",
    )
    data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Record {self.id}"
    


class Campaign(models.Model):

    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        SCHEDULED = "SCHEDULED", "Scheduled"
        SENDING = "SENDING", "Sending"
        COMPLETED = "COMPLETED", "Completed"
        PAUSED = "PAUSED", "Paused"
        CANCELLED = "CANCELLED", "Cancelled"
        FAILED = "FAILED", "Failed"

    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name="campaigns",
    )

    name = models.CharField(
        max_length=255,
        db_index=True,
    )

    description = models.TextField(
        blank=True,
        null=True,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True,
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="campaigns",
    )

    is_active = models.BooleanField(
        default=True,
    )

    is_deleted = models.BooleanField(
        default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        db_table = "campaigns"
        ordering = ["-created_at"]

        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["created_by"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return self.name
    
class Channel(models.Model):
    """
    Master table for communication channels.
    """

    name = models.CharField(
        max_length=100,
        unique=True,
    )

    code = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
    )

    description = models.TextField(
        blank=True,
        null=True,
    )

    icon = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    is_active = models.BooleanField(
        default=True,
    )

    display_order = models.PositiveIntegerField(
        default=1,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        db_table = "channels"
        ordering = ["display_order", "name"]

    def __str__(self):
        return self.name

class CampaignChannel(models.Model):
    """
    Channels selected for a campaign.
    """

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        SENDING = "SENDING", "Sending"
        COMPLETED = "COMPLETED", "Completed"
        FAILED = "FAILED", "Failed"

    campaign = models.ForeignKey(
        Campaign,
        on_delete=models.CASCADE,
        related_name="campaign_channels",
    )

    channel = models.ForeignKey(
        Channel,
        on_delete=models.PROTECT,
        related_name="campaign_channels",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        db_table = "campaign_channels"

        unique_together = [
            ("campaign", "channel")
        ]

    def __str__(self):
        return f"{self.campaign.name} - {self.channel.name}"
    
class CampaignAudience(models.Model):

    campaign = models.ForeignKey(
        Campaign,
        on_delete=models.CASCADE,
        related_name="audience",
    )

    customer = models.ForeignKey(
        CustomerRecord,
        on_delete=models.CASCADE,
        related_name="campaigns",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        db_table = "campaign_audience"

        unique_together = [
            ("campaign", "customer")
        ]

    def __str__(self):
        return f"{self.campaign.name} - Customer {self.customer.id}"
    
class Audience(models.Model):
    """
    Reusable audience definition.
    """

    name = models.CharField(
        max_length=255,
    )

    customer_upload = models.ForeignKey(
        CustomerUpload,
        on_delete=models.CASCADE,
        related_name="audiences",
    )

    definition = models.JSONField(
        default=dict,
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="audiences",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    is_active = models.BooleanField(
        default=True,
    )

    class Meta:
        db_table = "audiences"
        ordering = ["name"]

    def __str__(self):
        return self.name