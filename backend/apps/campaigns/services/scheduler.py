from django.utils import timezone

from apps.campaigns.models import Campaign
from apps.campaigns.services.delivery import DeliveryService
import logging

logger = logging.getLogger(__name__)

class SchedulerService:
    """
    Executes scheduled campaigns.

    Responsibilities:
        • Find due campaigns
        • Send campaigns
        • Return execution summary
    """

    @classmethod
    def run(cls):
        """
        Execute all due campaigns.
        """

        campaigns = cls._get_due_campaigns()

        processed = 0
        success = 0
        failed = 0

        for campaign in campaigns:

            processed += 1

            try:
                cls._process_campaign(campaign)

                success += 1

            except Exception:
                failed += 1

                logger.exception(
                    "Campaign %s failed",
                    campaign.id,
                )

        return {
            "processed": processed,
            "success": success,
            "failed": failed,
        }

    # =====================================================
    # Query
    # =====================================================

    @staticmethod
    def _get_due_campaigns():
        """
        Return campaigns ready to send.
        """

        return Campaign.objects.filter(
            status=Campaign.Status.SCHEDULED,
            scheduled_at__lte=timezone.now(),
        ).order_by(
            "scheduled_at",
        )

    # =====================================================
    # Processing
    # =====================================================

    @staticmethod
    def _process_campaign(campaign):
        from apps.campaigns.tasks import send_campaign_background

        send_campaign_background.delay(campaign.id)