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
        Publishes the content to all associated platforms.
        Respects approval rules.
        Saves any associated images to the AssetLibrary.
        """
        if draft.workflow_state not in [ContentDraft.WorkflowState.APPROVED, ContentDraft.WorkflowState.PUBLISHED]:
            # Allow super admin/admin to bypass if needed, but standard flow requires approval
            if user.role not in ['ADMIN', 'SUPER_ADMIN']:
                raise ValueError("content must be approved before publishing.")

        platforms = draft.platforms.all()
        if not platforms:
            raise ValueError("No platforms selected for this content.")

        all_success = True
        
        # Save images to asset library first (if any exist for the platforms)
        PublishingService._save_images_to_asset_library(draft, user)

        for platform in platforms:
            if platform.status == ContentPlatform.PlatformStatus.POSTED:
                continue  # Already posted

            try:
                # We need content and image_url. 
                # Assuming caption is available via reverse relation.
                content = platform.caption.caption_text if hasattr(platform, 'caption') else draft.enhanced_prompt
                
                # Fetch image URL if an ImageReference exists for this platform
                image_url = None
                img_ref = platform.images.first()
                if img_ref and img_ref.asset:
                    image_url = img_ref.asset.file_url

                logger.info(f"Attempting to publish to {platform.platform} for ContentDraft {draft.id}")
                
                # SocialService publish_post acts as a unified facade for Integrations
                response = SocialService.publish_post(
                    company=draft.company,
                    platform=platform.platform,
                    content=content,
                    image_url=image_url
                )
                
                if response.get("success"):
                    platform.status = ContentPlatform.PlatformStatus.POSTED
                    platform.external_post_id = response.get("platform_post_id", "")
                    platform.published_datetime = timezone.now()
                    platform.error_message = ""
                    platform.save(update_fields=['status', 'external_post_id', 'published_datetime', 'error_message'])
                else:
                    all_success = False
                    platform.status = ContentPlatform.PlatformStatus.FAILED
                    platform.error_message = response.get("error", "Unknown publishing error")
                    platform.save(update_fields=['status', 'error_message'])

            except Exception as e:
                logger.error(f"Failed to publish to {platform.platform}: {str(e)}")
                all_success = False
                platform.status = ContentPlatform.PlatformStatus.FAILED
                platform.error_message = str(e)
                platform.save(update_fields=['status', 'error_message'])

        # Update overall draft state if everything is posted
        if all_success:
            draft.workflow_state = ContentDraft.WorkflowState.PUBLISHED
            draft.save(update_fields=['workflow_state'])

        return draft

    @staticmethod
    def _save_images_to_asset_library(draft, user):
        """
        Extracts image URLs generated during the AI phase and saves them to the Asset Library.
        Links them back via ImageReference.
        """
        # Find a suitable folder, or create one for content Auto-saves
        folder, _ = AssetFolder.objects.get_or_create(
            company=draft.company,
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
                company=draft.company,
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
