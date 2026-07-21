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

    @classmethod
    def update_campaign(cls, *, campaign, user, validated_data):
        from rest_framework.exceptions import ValidationError
        
        if campaign.created_by != user:
            raise PermissionDenied("You can only edit your own campaigns.")
            
        if campaign.status not in [Campaign.Status.DRAFT, Campaign.Status.REJECTED]:
            raise ValidationError("Only draft or rejected campaigns can be edited.")
            
        was_rejected = campaign.status == Campaign.Status.REJECTED
        
        if "name" in validated_data:
            campaign.name = validated_data["name"]
        if "description" in validated_data:
            campaign.description = validated_data["description"]
            
        if was_rejected:
            cls.handle_rejected_to_draft(campaign)
            
        campaign.save(update_fields=["name", "description", "updated_at"])
        return campaign

    @classmethod
    def handle_rejected_to_draft(cls, campaign):
        if campaign.status == Campaign.Status.REJECTED:
            return cls.change_status(
                campaign,
                Campaign.Status.DRAFT,
                approved_by=None,
                approved_at=None,
                rejection_reason=None,
                review_comments=None
            )
        return campaign

    @classmethod
    def change_status(cls, campaign, new_status, **update_fields):
        from apps.tasks.services import TaskStatusService
        
        campaign.status = new_status
        for field, value in update_fields.items():
            setattr(campaign, field, value)
            
        fields_to_save = ["status"] + list(update_fields.keys())
        campaign.save(update_fields=fields_to_save)
        
        TaskStatusService.update_task_status(campaign.task)
        
        return campaign

    @staticmethod
    def create_campaign(
        validated_data,
        user,
    ):
        task = validated_data["task"]

        ma_user = MAUser.objects.filter(
            user_id=user
        ).first()

        if not ma_user or ma_user.role not in ["USER", "ADMIN"]:
            raise PermissionDenied(
                "Only marketing users and admins can create campaigns."
            )

        user_can_create = ma_user.role == "USER" and TaskAssignment.objects.filter(task=task, user=user).exists()
        admin_can_create = ma_user.role == "ADMIN" and task.created_by_id == user.id
        if not user_can_create and not admin_can_create:
            raise PermissionDenied(
                "You can only create a campaign for an assigned or owned task."
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

    @classmethod
    def submit_campaign(cls,*, campaign, user):
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

        return cls.change_status(
            campaign,
            Campaign.Status.PENDING_APPROVAL,
            submitted_by=user,
            submitted_at=timezone.now()
        )

    @classmethod
    def approve_campaign(cls,*, campaign, admin_user):
        from rest_framework.exceptions import ValidationError
        from django.utils import timezone
        
        ma_user = MAUser.objects.filter(user_id=admin_user).first()
        if not ma_user or ma_user.role not in ["ADMIN", "SUPER_ADMIN"]:
            raise PermissionDenied("Only ADMIN or SUPER_ADMIN can approve campaigns.")

        if campaign.status != Campaign.Status.PENDING_APPROVAL:
            raise ValidationError("Campaign must be pending approval.")

        return cls.change_status(
            campaign,
            Campaign.Status.APPROVED,
            approved_by=admin_user,
            approved_at=timezone.now()
        )

    @classmethod
    def reject_campaign(cls,*, campaign, admin_user, rejection_reason, review_comments=None):
        from rest_framework.exceptions import ValidationError
        from django.utils import timezone
        
        ma_user = MAUser.objects.filter(user_id=admin_user).first()
        if not ma_user or ma_user.role not in ["ADMIN", "SUPER_ADMIN"]:
            raise PermissionDenied("Only ADMIN or SUPER_ADMIN can reject campaigns.")

        if campaign.status != Campaign.Status.PENDING_APPROVAL:
            raise ValidationError("Campaign must be pending approval.")

        return cls.change_status(
            campaign,
            Campaign.Status.REJECTED,
            approved_by=admin_user,
            approved_at=timezone.now(),
            rejection_reason=rejection_reason,
            review_comments=review_comments
        )
