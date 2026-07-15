import logging
from django.utils import timezone
from ..models import ContentDraft, ContentPlatform

logger = logging.getLogger(__name__)

class ScheduleService:
    @staticmethod
    def save_schedules(draft, platform_schedules):
        """
        Saves schedules for platforms.
        `platform_schedules` is a dict mapping platform_name -> scheduled_datetime
        """
        # Validate all dates are in the future
        now = timezone.now()
        for dt in platform_schedules.values():
            if dt and dt <= now:
                raise ValueError("Scheduled time must be in the future.")
                
        # Bulk update platforms
        platforms = draft.platforms.filter(platform__in=platform_schedules.keys())
        updated = []
        for p in platforms:
            new_dt = platform_schedules.get(p.platform)
            if new_dt:
                p.scheduled_datetime = new_dt
                updated.append(p)
                
        if updated:
            ContentPlatform.objects.bulk_update(updated, ['scheduled_datetime'])
            logger.info(f"Updated schedules for platforms in draft {draft.id}")
            
        return updated
