from rest_framework.exceptions import PermissionDenied

from apps.tasks.models import TaskAssignment

from apps.campaigns.models import (
    Campaign,
    CampaignAudience,
    CampaignChannel,
)
from apps.accounts.models import MAUser
from apps.campaigns.services.audience import AudienceService

class CampaignService:

    @staticmethod
    def create_campaign(
        validated_data,
        user,
    ):
        task = validated_data["task"]

        ma_user = MAUser.objects.filter(
            user_id=user
        ).first()

        # Only USER can create campaign
        if not ma_user or ma_user.role != "USER":
            raise PermissionDenied(
                "Only marketing users can create campaigns."
            )

        # USER must be assigned to task
        if not TaskAssignment.objects.filter(
            task=task,
            user=user,
        ).exists():
            raise PermissionDenied(
                "You are not assigned to this task."
            )

        # Create campaign
        campaign = Campaign.objects.create(
            task=task,
            name=validated_data["name"],
            description=validated_data.get("description"),
            created_by=user,
        )

        # Freeze recipients
        customers = AudienceService.get_customers(
            customer_upload=task.audience.customer_upload,
            audience_definition=task.audience.definition,
        )

        CampaignAudience.objects.bulk_create(
            [
                CampaignAudience(
                    campaign=campaign,
                    customer=customer,
                )
                for customer in customers
            ]
        )

        # Copy task channels
        CampaignChannel.objects.bulk_create(
            [
                CampaignChannel(
                    campaign=campaign,
                    channel=channel,
                )
                for channel in task.channels.all()
            ]
        )

        return campaign