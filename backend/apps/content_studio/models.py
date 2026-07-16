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


class BrandVoice(TimeStampedUUIDModel):

    tone = models.CharField(max_length=100, default="Professional", help_text="e.g., Professional, Casual, Humorous")
    target_audience = models.TextField(blank=True, help_text="Describe the target audience")
    guidelines = models.TextField(blank=True, help_text="Specific rules, do's and don'ts")

    class Meta:
        db_table = "brand_voices"

    def __str__(self):
        return "Brand Voice"


class ContentTemplate(TimeStampedUUIDModel):

    name = models.CharField(max_length=255, db_index=True)
    description = models.TextField(blank=True)
    prompt_template = models.TextField(help_text="Use {{variables}} for dynamic injection")
    
    content_type = models.CharField(
        max_length=20,
        choices=GeneratedContent.ContentType.choices,
        blank=True,
        null=True
    )
    

    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "content_templates"
        ordering = ["name"]

    def __str__(self):
        return self.name


# --- New Campaign Workflow Models ---

class ContentDraft(TimeStampedUUIDModel):
    class WorkflowState(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        IN_REVIEW = "IN_REVIEW", "In Review"
        APPROVED = "APPROVED", "Approved"
        PUBLISHED = "PUBLISHED", "Published"

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="content_drafts"
    )

    
    original_prompt = models.TextField(blank=True)
    enhanced_prompt = models.TextField(blank=True)
    
    workflow_state = models.CharField(
        max_length=20,
        choices=WorkflowState.choices,
        default=WorkflowState.DRAFT,
        db_index=True
    )
    
    current_version = models.PositiveIntegerField(default=1)

    class Meta:
        db_table = "content_draft_drafts"
        ordering = ["-created_at"]

    def __str__(self):
        return f"ContentDraft {self.id} by {self.owner.email}"


class ContentDraftVersion(TimeStampedUUIDModel):
    draft = models.ForeignKey(
        ContentDraft,
        on_delete=models.CASCADE,
        related_name="versions"
    )
    version_number = models.PositiveIntegerField()
    enhanced_prompt_snapshot = models.TextField(blank=True)
    regeneration_reason = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="content_versions_created"
    )

    class Meta:
        db_table = "content_draft_versions"
        unique_together = [("draft", "version_number")]
        ordering = ["-version_number"]


class ContentPlatform(TimeStampedUUIDModel):
    class PlatformChoices(models.TextChoices):
        FACEBOOK = "FACEBOOK", "Facebook"
        INSTAGRAM = "INSTAGRAM", "Instagram"
        LINKEDIN = "LINKEDIN", "LinkedIn"
        X = "X", "X (Twitter)"

    class PlatformStatus(models.TextChoices):
        PENDING = "PENDING", "Pending"
        POSTED = "POSTED", "Posted"
        FAILED = "FAILED", "Failed"

    class ApprovalStatus(models.TextChoices):
        NONE = "NONE", "None"
        REQUESTED = "REQUESTED", "Requested"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    draft = models.ForeignKey(
        ContentDraft,
        on_delete=models.CASCADE,
        related_name="platforms"
    )
    platform = models.CharField(
        max_length=20,
        choices=PlatformChoices.choices
    )
    
    image_size = models.CharField(max_length=50, blank=True)
    status = models.CharField(
        max_length=20, 
        choices=PlatformStatus.choices, 
        default=PlatformStatus.PENDING
    )
    approval_status = models.CharField(
        max_length=20,
        choices=ApprovalStatus.choices,
        default=ApprovalStatus.NONE
    )
    
    scheduled_datetime = models.DateTimeField(null=True, blank=True)
    published_datetime = models.DateTimeField(null=True, blank=True)
    external_post_id = models.CharField(max_length=255, blank=True)
    error_message = models.TextField(blank=True)

    class Meta:
        db_table = "content_draft_platforms"
        unique_together = [("draft", "platform")]

    def __str__(self):
        return f"{self.draft.id} - {self.platform}"


class Caption(TimeStampedUUIDModel):
    platform = models.OneToOneField(
        ContentPlatform,
        on_delete=models.CASCADE,
        related_name="caption"
    )
    caption_text = models.TextField(blank=True)
    hashtags = models.TextField(blank=True)
    cta = models.CharField(max_length=255, blank=True)
    is_manually_edited = models.BooleanField(default=False)

    class Meta:
        db_table = "content_captions"


class Approval(TimeStampedUUIDModel):
    class ApprovalState(models.TextChoices):
        REQUESTED = "REQUESTED", "Requested"
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    draft = models.ForeignKey(
        ContentDraft,
        on_delete=models.CASCADE,
        related_name="approvals"
    )
    status = models.CharField(
        max_length=20,
        choices=ApprovalState.choices,
        default=ApprovalState.REQUESTED
    )
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="content_reviews"
    )
    review_notes = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "content_approvals"
        ordering = ["-created_at"]


class ImageReference(TimeStampedUUIDModel):
    platform = models.ForeignKey(
        ContentPlatform,
        on_delete=models.CASCADE,
        related_name="images"
    )
    asset = models.ForeignKey(
        "asset_library.Asset",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="content_images"
    )

    class Meta:
        db_table = "content_image_references"
