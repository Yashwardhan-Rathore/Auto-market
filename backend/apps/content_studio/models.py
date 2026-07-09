from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedUUIDModel


class GeneratedContent(TimeStampedUUIDModel):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"
        PUBLISHED = "PUBLISHED", "Published"

    class ContentType(models.TextChoices):
        EMAIL = "EMAIL", "Email"
        BLOG = "BLOG", "Blog"
        AD_COPY = "AD_COPY", "Ad Copy"
        SOCIAL = "SOCIAL", "Social Media"
        CAPTION = "CAPTION", "Caption"

    class Platform(models.TextChoices):
        NONE = "NONE", "None"
        FACEBOOK = "FACEBOOK", "Facebook"
        INSTAGRAM = "INSTAGRAM", "Instagram"
        LINKEDIN = "LINKEDIN", "LinkedIn"
        X = "X", "X (Twitter)"

    company = models.ForeignKey(
        "common.Company",
        on_delete=models.CASCADE,
        related_name="generated_contents"
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="generated_contents"
    )

    content_type = models.CharField(
        max_length=20,
        choices=ContentType.choices,
        db_index=True
    )

    platform = models.CharField(
        max_length=20,
        choices=Platform.choices,
        default=Platform.NONE,
        db_index=True
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True
    )

    class Meta:
        db_table = "generated_contents"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.content_type} by {self.created_by.email}"


class ContentVersion(TimeStampedUUIDModel):
    generated_content = models.ForeignKey(
        GeneratedContent,
        on_delete=models.CASCADE,
        related_name="versions"
    )

    version_number = models.PositiveIntegerField()

    prompt = models.TextField()
    
    text_content = models.TextField(blank=True, null=True)
    image_url = models.URLField(max_length=2048, blank=True, null=True)

    class Meta:
        db_table = "content_versions"
        unique_together = [("generated_content", "version_number")]
        ordering = ["-version_number"]

    def __str__(self):
        return f"{self.generated_content} - v{self.version_number}"
