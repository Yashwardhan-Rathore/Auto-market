import logging

from django.db import transaction
from django.utils import timezone

from rest_framework.exceptions import ValidationError

from apps.campaigns.models import (
    Campaign,
    CampaignDelivery,
)
from apps.campaigns.services.dispatcher import Dispatcher
from apps.campaigns.services.renderer import TemplateRenderer

logger = logging.getLogger(__name__)

class DeliveryService:
    """
    Executes a campaign.

    Responsibilities:
        • Validate campaign
        • Update campaign status
        • Load recipients
        • Load templates
        • Render messages
        • Create delivery records
        • Dispatch messages
        • Complete campaign
    """

    @classmethod
    @transaction.atomic
    def send_campaign(
        cls,
        *,
        campaign: Campaign,
    ):
        """
        Execute the complete campaign.
        """

        cls._validate_campaign(campaign)
        cls._validate_no_existing_deliveries(campaign)

        cls._mark_campaign_sending(campaign)

        recipients = cls._load_recipients(campaign)
        templates = cls._load_templates(campaign)

        logger.info(
            "Campaign %s loaded %s recipients and %s templates.",
            campaign.id,
            recipients.count(),
            templates.count(),
        )

        for recipient in recipients:
            cls._process_recipient(
                campaign=campaign,
                recipient=recipient,
                templates=templates,
            )

        cls._mark_campaign_completed(campaign)

        return campaign

    # ==========================================================
    # Validation
    # ==========================================================

    @staticmethod
    def _validate_campaign(
        campaign: Campaign,
    ):
        """
        Ensure campaign is eligible for sending.
        """

        if campaign.status not in (
            Campaign.Status.DRAFT,
            Campaign.Status.SCHEDULED,
        ):
            raise ValidationError(
                "Campaign cannot be sent."
            )

    @staticmethod
    def _validate_no_existing_deliveries(
        campaign: Campaign,
    ):
        """
        Prevent sending a campaign more than once.
        """

        if CampaignDelivery.objects.filter(
            campaign=campaign,
        ).exists():

            logger.warning(
                "Duplicate send prevented for campaign %s.",
                campaign.id,
            )

            raise ValidationError(
                "Campaign has already been sent."
            )

    # ==========================================================
    # Campaign Status
    # ==========================================================

    @staticmethod
    def _mark_campaign_sending(
        campaign: Campaign,
    ):
        """
        Mark campaign as sending.
        """

        campaign.status = Campaign.Status.SENDING
        campaign.started_at = timezone.now()

        campaign.save(
            update_fields=[
                "status",
                "started_at",
            ]
        )

        logger.info(
            "Campaign %s started.",
            campaign.id,
        )

    @staticmethod
    def _mark_campaign_completed(
        campaign: Campaign,
    ):
        """
        Mark campaign as completed.
        """


        campaign.status = Campaign.Status.COMPLETED
        campaign.completed_at = timezone.now()

        campaign.save(
            update_fields=[
                "status",
                "completed_at",
            ]
        )

        logger.info(
            "Campaign %s completed successfully.",
            campaign.id,
        )


    # ==========================================================
    # Data Loading
    # ==========================================================

    @staticmethod
    def _load_recipients(
        campaign: Campaign,
    ):
        """
        Load frozen campaign recipients.
        """

        return campaign.audience.select_related(
            "customer",
        )

    @staticmethod
    def _load_templates(
        campaign: Campaign,
    ):
        """
        Load campaign templates.
        """

        return campaign.campaign_templates.select_related(
            "channel",
            "template",
        )

    # ==========================================================
    # Processing
    # ==========================================================

    @classmethod
    def _process_recipient(
        cls,
        *,
        campaign: Campaign,
        recipient,
        templates,
    ):
        """
        Send every template to one recipient.
        """

        customer = recipient.customer

        logger.info(
            "Processing customer %s for campaign %s.",
            customer.id,
            campaign.id,
        )

        for campaign_template in templates:
            cls._send_delivery(
                campaign=campaign,
                customer=customer,
                campaign_template=campaign_template,
            )

    @staticmethod
    def _send_delivery(
        *,
        campaign: Campaign,
        customer,
        campaign_template,
    ):
        """
        Create and dispatch one delivery.
        """

        # -------------------------
        # Render Template
        # -------------------------

        message = TemplateRenderer.render(
            campaign_template.template.body,
            customer.data,
        )

        # -------------------------
        # Create Delivery Record
        # -------------------------

        delivery = CampaignDelivery.objects.create(
            campaign=campaign,
            customer=customer,
            channel=campaign_template.channel,
            rendered_message=message,
            status=CampaignDelivery.Status.PENDING,
        )

        # -------------------------
        # Dispatch
        # -------------------------

        result = Dispatcher.send(
            delivery=delivery,
        )

        # -------------------------
        # Update Delivery Status
        # -------------------------

        if result["success"]:

            delivery.status = CampaignDelivery.Status.SENT
            delivery.provider_message_id = result[
                "provider_message_id"
            ]
            delivery.sent_at = timezone.now()

        else:

            delivery.status = CampaignDelivery.Status.FAILED
            delivery.error_message = result.get(
                "error",
                "Unknown error",
            )

            logger.error(
                "Delivery failed | Campaign=%s Customer=%s Channel=%s Error=%s",
                campaign.id,
                customer.id,
                campaign_template.channel.code,
                delivery.error_message,
            )

        delivery.save(
            update_fields=[
                "status",
                "provider_message_id",
                "error_message",
                "sent_at",
            ]
        )


        # -------------------------
        # Logging
        # -------------------------

        logger.info(
            (
                "Delivery processed | "
                "Campaign=%s Customer=%s "
                "Channel=%s Status=%s"
            ),
            campaign.id,
            customer.id,
            campaign_template.channel.code,
            delivery.status,
        )