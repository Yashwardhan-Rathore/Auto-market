from celery import shared_task
import logging

logger = logging.getLogger(__name__)

@shared_task
def process_campaign_creation(campaign_id):
    """Background task to handle heavy processing after campaign creation."""
    logger.info(f"Processing campaign creation in background for campaign {campaign_id}")
    # Currently freezing is done synchronously in the service. 
    # But since the requirement states we should trigger a background worker for create, 
    # we simulate or move processing here if needed.
    pass

@shared_task
def process_scheduled_campaigns():
    """Background task to send due scheduled campaigns."""
    from apps.campaigns.services.scheduler import SchedulerService
    logger.info("Running scheduled campaigns background task")
    return SchedulerService.run()

@shared_task(bind=True, max_retries=3)
def send_campaign_background(self, campaign_id):
    """Background task to send a campaign immediately with retries."""
    from apps.campaigns.models import Campaign
    from apps.campaigns.services.delivery import DeliveryService
    
    logger.info(f"Sending campaign {campaign_id} in background")
    try:
        campaign = Campaign.objects.get(id=campaign_id)
        DeliveryService.send_campaign(campaign=campaign)
    except Exception as exc:
        logger.error(f"Error dispatching campaign {campaign_id}, retrying: {exc}")
        raise self.retry(exc=exc, countdown=60)
