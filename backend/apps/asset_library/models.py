from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedUUIDModel


class AssetFolder(TimeStampedUUIDModel):
    company = models.ForeignKey(
        "common.Company",
        on_delete=models.CASCADE,
        related_name="asset_folders"
    )
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="subfolders"
    )
    name = models.CharField(max_length=255, db_index=True)

    class Meta:
        db_table = "asset_folders"
        unique_together = [("company", "parent", "name")]
        ordering = ["name"]

    def __str__(self):
        return self.name


class AssetTag(TimeStampedUUIDModel):
    company = models.ForeignKey(
        "common.Company",
        on_delete=models.CASCADE,
        related_name="asset_tags"
    )
    name = models.CharField(max_length=50, db_index=True)

    class Meta:
        db_table = "asset_tags"
        unique_together = [("company", "name")]

    def __str__(self):
        return self.name


class Asset(TimeStampedUUIDModel):
    class AssetType(models.TextChoices):
        IMAGE = "IMAGE", "Image"
        DOCUMENT = "DOCUMENT", "Document"
        VIDEO = "VIDEO", "Video"
        OTHER = "OTHER", "Other"

    company = models.ForeignKey(
        "common.Company",
        on_delete=models.CASCADE,
        related_name="assets"
    )
    folder = models.ForeignKey(
        AssetFolder,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assets"
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="uploaded_assets"
    )

    name = models.CharField(max_length=255, db_index=True)
    file_url = models.URLField(max_length=2048)
    asset_type = models.CharField(max_length=20, choices=AssetType.choices, default=AssetType.OTHER)
    
    is_personal = models.BooleanField(
        default=False,
        help_text="If True, only the uploaded_by user can view this. Otherwise, it is shared with the company."
    )

    tags = models.ManyToManyField(AssetTag, blank=True, related_name="assets")

    class Meta:
        db_table = "assets"
        ordering = ["-created_at"]

    def __str__(self):
        return self.name
