from rest_framework.exceptions import ValidationError
from apps.accounts.models import MAUser
from apps.tasks.models import TaskAssignment
from apps.campaigns.models import (
    Template,
    CampaignChannel,
    CampaignTemplate,
    Campaign
)
from apps.common.utils import filter_by_tenant


class TemplateService:

    @staticmethod
    def create_template(
        *,
        validated_data,
        user,
    ):
        ma_user = MAUser.objects.filter(
            user_id=user
        ).first()

        if not ma_user or ma_user.role != "USER":
            raise ValidationError(
                "Only users can create templates."
            )

        return Template.objects.create(
            name=validated_data["name"],
            channel=validated_data["channel"],
            subject=validated_data.get("subject"),
            body=validated_data["body"],
            status=validated_data["status"],
            created_by=user,
        )

    @staticmethod
    def list_templates(
        *,
        user,
    ):
        templates = Template.objects.filter(status=Template.Status.ACTIVE)
        return filter_by_tenant(templates, user, "created_by").order_by("name")


class CampaignTemplateService:

    @staticmethod
    def assign_template(
        *,
        validated_data,
        user,
    ):
        campaign = validated_data["campaign"]
        channel = validated_data["channel"]
        template = validated_data["template"]

        # Rule 1
        if not TaskAssignment.objects.filter(
            task=campaign.task,
            user=user,
        ).exists():
            raise ValidationError(
                "You are not assigned to this task."
            )

        # Rule 2
        if not CampaignChannel.objects.filter(
            campaign=campaign,
            channel=channel,
        ).exists():
            raise ValidationError(
                "This channel is not assigned to the campaign."
            )
        
        # Rule 3: Template must belong to the logged-in user
        if template.created_by != user:
            raise ValidationError(
                "You can only assign your own templates."
            )
        
        # Rule 4: Template channel must match selected channel
        if template.channel != channel:
            raise ValidationError(
                "Template channel does not match the selected channel."
            )
        
        # Rule 5: Template must be ACTIVE
        if template.status != Template.Status.ACTIVE:
            raise ValidationError(
                "Only active templates can be assigned."
            )

        # Rule 6: Campaign must be editable
        if campaign.status != Campaign.Status.DRAFT:
            raise ValidationError(
                "Templates can only be assigned while the campaign is in DRAFT status."
            )

        campaign_template, created = CampaignTemplate.objects.update_or_create(
            campaign=campaign,
            channel=channel,
            defaults={
                "template": template,
            },
        )

        return campaign_template