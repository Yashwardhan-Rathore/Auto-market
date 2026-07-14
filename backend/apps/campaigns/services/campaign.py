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

    @staticmethod
    def submit_campaign(*, campaign, user):
        from rest_framework.exceptions import ValidationError
        from apps.campaigns.models import CampaignTemplate
        from django.utils import timezone
        
        if campaign.created_by != user:
            raise PermissionDenied("You can only submit your own campaigns.")

        if not TaskAssignment.objects.filter(task=campaign.task, user=user).exists():
            raise PermissionDenied("You are not assigned to this task.")

        if campaign.status != Campaign.Status.DRAFT:
            raise ValidationError("Only draft campaigns can be submitted.")

        if not CampaignAudience.objects.filter(campaign=campaign).exists():
            raise ValidationError("Campaign has no recipients.")

        campaign_channels = CampaignChannel.objects.filter(campaign=campaign)
        template_count = CampaignTemplate.objects.filter(campaign=campaign).count()

        if template_count == 0 or template_count != campaign_channels.count():
            raise ValidationError("Every selected channel must have an assigned template.")

        campaign.status = Campaign.Status.PENDING_APPROVAL
        campaign.submitted_by = user
        campaign.submitted_at = timezone.now()
        campaign.save(update_fields=["status", "submitted_by", "submitted_at"])
        
        return campaign

    @staticmethod
    def approve_campaign(*, campaign, admin_user):
        from rest_framework.exceptions import ValidationError
        from django.utils import timezone
        
        ma_user = MAUser.objects.filter(user_id=admin_user).first()
        if not ma_user or ma_user.role not in ["ADMIN", "SUPER_ADMIN"]:
            raise PermissionDenied("Only ADMIN or SUPER_ADMIN can approve campaigns.")

        if campaign.status != Campaign.Status.PENDING_APPROVAL:
            raise ValidationError("Campaign must be pending approval.")

        campaign.status = Campaign.Status.APPROVED
        campaign.approved_by = admin_user
        campaign.approved_at = timezone.now()
        campaign.save(update_fields=["status", "approved_by", "approved_at"])
        
        return campaign

    @staticmethod
    def reject_campaign(*, campaign, admin_user, rejection_reason):
        from rest_framework.exceptions import ValidationError
        from django.utils import timezone
        
        ma_user = MAUser.objects.filter(user_id=admin_user).first()
        if not ma_user or ma_user.role not in ["ADMIN", "SUPER_ADMIN"]:
            raise PermissionDenied("Only ADMIN or SUPER_ADMIN can reject campaigns.")

        if campaign.status != Campaign.Status.PENDING_APPROVAL:
            raise ValidationError("Campaign must be pending approval.")

        campaign.status = Campaign.Status.REJECTED
        campaign.approved_by = admin_user
        campaign.approved_at = timezone.now()
        campaign.rejection_reason = rejection_reason
        campaign.save(update_fields=["status", "approved_by", "approved_at", "rejection_reason"])
        
        return campaign