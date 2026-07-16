from django.db import models
from apps.common.models import TimeStampedUUIDModel


class IntegrationProvider(TimeStampedUUIDModel):
    class ProviderType(models.TextChoices):
        OPENAI = "OPENAI", "OpenAI"
        AWS_S3 = "AWS_S3", "AWS S3"
        FACEBOOK = "FACEBOOK", "Facebook"
        INSTAGRAM = "INSTAGRAM", "Instagram"
        LINKEDIN = "LINKEDIN", "LinkedIn"
        X = "X", "X (Twitter)"



    provider_type = models.CharField(
        max_length=20,
        choices=ProviderType.choices,
        unique=True,
        db_index=True
    )

    credentials = models.JSONField(
        default=dict,
        help_text="Store API keys, secrets, or OAuth tokens here"
    )

    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "integration_providers"


    def __str__(self):
        return f"{self.provider_type}"
