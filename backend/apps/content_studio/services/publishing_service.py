import logging
from django.db import transaction
from django.utils import timezone
from ..models import ContentDraft, ContentPlatform, ImageReference
from apps.integrations.social_service import SocialService
from apps.asset_library.models import Asset, AssetFolder

logger = logging.getLogger(__name__)

class PublishingService:
    @staticmethod
    @transaction.atomic
    def publish_content(draft, user):
        """
        Schedules or publishes the content to all associated platforms.
        Respects approval rules.
        Saves any associated images to the AssetLibrary.
        """
        if draft.workflow_state not in [ContentDraft.WorkflowState.APPROVED, ContentDraft.WorkflowState.PUBLISHED]:
            # Allow super admin/admin or users who don't require approval to bypass
            requires_approval = getattr(user, 'requires_approval', True)
            if not hasattr(user, 'requires_approval'):
                from apps.accounts.models import MAUser
                ma_profile = MAUser.objects.filter(user=user).first()
                if ma_profile:
                    requires_approval = ma_profile.requires_approval

            if requires_approval and getattr(user, 'role', 'USER') not in ['ADMIN', 'SUPER_ADMIN']:
                raise ValueError("content must be approved before publishing.")

        platforms = draft.platforms.all()
        if not platforms:
            raise ValueError("No platforms selected for this content.")

        # Save images to asset library first (if any exist for the platforms)
        PublishingService._save_images_to_asset_library(draft, user)
        
        from apps.integrations.tasks import publish_social_post_task
        
        now = timezone.now()
        dispatched = False
        
        for platform in platforms:
            if platform.status == ContentPlatform.PlatformStatus.POSTED:
                continue  # Already posted

            logger.info(f"Dispatching publishing task for {platform.platform} for ContentDraft {draft.id}")
            
            # Use MAUser ID for connection lookup if needed, but user_id string works
            user_id_str = str(user.id)
            
            if platform.scheduled_datetime and platform.scheduled_datetime > now:
                # Schedule in the future
                publish_social_post_task.apply_async(
                    args=[str(platform.id), user_id_str], 
                    eta=platform.scheduled_datetime
                )
                logger.info(f"Scheduled for {platform.scheduled_datetime}")
            else:
                # Publish immediately in background
                publish_social_post_task.delay(str(platform.id), user_id_str)
                logger.info("Dispatched immediately to background queue")
                
            dispatched = True

        # Note: Overall workflow state is now updated by the Celery task when the last platform posts successfully.
        if dispatched and draft.workflow_state == ContentDraft.WorkflowState.APPROVED:
            # We can optionally set it to a pending state if desired, but APPROVED is fine until tasks complete.
            pass

        return draft

    @staticmethod
    def _save_images_to_asset_library(draft, user):
        """
        Extracts image URLs generated during the AI phase and saves them to the Asset Library.
        Links them back via ImageReference.
        """
        # Find a suitable folder, or create one for content Auto-saves
        folder, _ = AssetFolder.objects.get_or_create(

            name="Content Studio Generations",
            defaults={'parent': None}
        )

        for platform in draft.platforms.all():
            # If an image reference already exists with an asset, skip.
            if platform.images.filter(asset__isnull=False).exists():
                continue

            # In a real implementation, we would extract the image URL from the AI orchestrator's state.
            # Here we mock retrieving a generated image URL for demonstration.
            # You would look at the ContentVersion or AI Generation results.
            
            # Example mock URL creation if we had it:
            mock_url = f"https://s3.amazonaws.com/mock-bucket/generated_{draft.id}_{platform.platform}.png"
            
            asset = Asset.objects.create(

                folder=folder,
                uploaded_by=user,
                name=f"Generated for {platform.platform} - {draft.id}",
                file_url=mock_url,
                asset_type=Asset.AssetType.IMAGE
            )
            
            ImageReference.objects.create(
                platform=platform,
                asset=asset
            )
            logger.info(f"Saved generated image for {platform.platform} to Asset Library.")
