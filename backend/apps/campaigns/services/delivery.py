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

        # Lock the campaign to prevent race conditions during state transition
        campaign = Campaign.objects.select_for_update().get(id=campaign.id)

        cls._validate_campaign(campaign)

        cls._mark_campaign_sending(campaign)

        try:
            recipients = cls._load_recipients(campaign)
            templates = cls._load_templates(campaign)

            logger.info(
                "Campaign %s loaded %s recipients and %s templates.",
                campaign.id,
                recipients.count(),
                templates.count(),
            )

            for recipient in recipients.iterator(chunk_size=500):
                cls._process_recipient(
                    campaign=campaign,
                    recipient=recipient,
                    templates=templates,
                )

            failed = CampaignDelivery.objects.filter(
                campaign=campaign,
                status=CampaignDelivery.Status.FAILED,
            ).exists()

            if failed:
                cls._mark_campaign_failed(campaign)
            else:
                cls._mark_campaign_completed(campaign)
        except Exception:
            cls._mark_campaign_failed(campaign)
            logger.exception(
                "Campaign %s crashed during execution.",
                campaign.id,
            )
            raise




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
            Campaign.Status.APPROVED,
            Campaign.Status.SCHEDULED,
        ):
            raise ValidationError(
                "Campaign cannot be sent."
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

        from apps.campaigns.services.campaign import CampaignService

        CampaignService.change_status(
            campaign,
            Campaign.Status.SENDING,
            started_at=timezone.now()
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


        from apps.campaigns.services.campaign import CampaignService

        CampaignService.change_status(
            campaign,
            Campaign.Status.COMPLETED,
            completed_at=timezone.now()
        )

        logger.info(
            "Campaign %s completed successfully.",
            campaign.id,
        )

    @staticmethod
    def _mark_campaign_failed(campaign):
        from apps.campaigns.services.campaign import CampaignService

        CampaignService.change_status(
            campaign,
            Campaign.Status.FAILED,
        )

        logger.error(
            "Campaign %s finished with failed deliveries.",
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

        delivery, created = CampaignDelivery.objects.get_or_create(
            campaign=campaign,
            customer=customer,
            channel=campaign_template.channel,
            defaults={
                "rendered_message": message,
                "status": CampaignDelivery.Status.PENDING,
            },
        )

        if not created:
            logger.info(
                "Delivery already exists. Skipping. "
                "Campaign=%s Customer=%s Channel=%s",
                campaign.id,
                customer.id,
                campaign_template.channel.code,
            )
            return

        # -------------------------
        # Dispatch
        # -------------------------

        try:
            result = Dispatcher.send(
                delivery=delivery,
            )
        except Exception as exc:
            logger.exception(
                "Dispatcher crashed for campaign %s customer %s",
                campaign.id,
                customer.id,
            )

            delivery.status = CampaignDelivery.Status.FAILED
            delivery.error_message = str(exc)

            delivery.save(
                update_fields=[
                    "status",
                    "error_message",
                ]
            )

            return

        # -------------------------
        # Update Delivery Status
        # -------------------------

        if result.get("success"):

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
