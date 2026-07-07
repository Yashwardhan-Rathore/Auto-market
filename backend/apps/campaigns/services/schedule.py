from django.utils import timezone

from rest_framework.exceptions import (
    ValidationError,
    PermissionDenied,
)

from apps.campaigns.models import (
    Campaign,
    CampaignAudience,
    CampaignChannel,
    CampaignTemplate,
)


class CampaignScheduleService:

    @staticmethod
    def schedule(
        *,
        campaign,
        scheduled_at,
        user,
    ):

        # Campaign owner
        if campaign.created_by != user:
            raise PermissionDenied(
                "You can only schedule your own campaign."
            )

        # Campaign status
        if campaign.status != Campaign.Status.DRAFT:
            raise ValidationError(
                "Only draft campaigns can be scheduled."
            )

        # Future date
        if scheduled_at <= timezone.now():
            raise ValidationError(
                "Schedule time must be in the future."
            )

        # Must have recipients
        if not CampaignAudience.objects.filter(
            campaign=campaign,
        ).exists():
            raise ValidationError(
                "Campaign has no recipients."
            )

        # Must have channels
        campaign_channels = CampaignChannel.objects.filter(
            campaign=campaign,
        )

        if not campaign_channels.exists():
            raise ValidationError(
                "Campaign has no channels."
            )

        # Every channel must have a template
        template_count = CampaignTemplate.objects.filter(
            campaign=campaign,
        ).count()

        if template_count != campaign_channels.count():
            raise ValidationError(
                "Assign templates for all channels before scheduling."
            )

        campaign.status = Campaign.Status.SCHEDULED
        campaign.scheduled_at = scheduled_at

        campaign.save()

        return campaign