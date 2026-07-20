import logging
from django.db import transaction
from .orchestrator import AIOrchestrator
from apps.billing.services import BillingService
from ..models import ContentDraft, BrandVoice, Caption, ImageReference
from ..services.content_draft_service import ContentDraftService

logger = logging.getLogger(__name__)

class AILifecycleService:
    """
    Coordinates the higher-level lifecycle of an AI operation.
    Manages billing deductions and version tracking around the AIOrchestrator calls.
    """
    
    def __init__(self):
        self.orchestrator = AIOrchestrator()
        
    def _get_brand_identity(self) -> dict:
        try:
            bv = BrandVoice.objects.first()
            if bv:
                return {
                    "tone": bv.tone,
                    "target_audience": bv.target_audience,
                    "guidelines": bv.guidelines
                }
            return {}
        except Exception:
            return {}

    @transaction.atomic
    def process_content_spec_and_questions(self, user_prompt: str) -> dict:
        """
        Deducts credits, extracts the spec, and generates questions in one workflow step.
        """
        # Deduct credits for the combined spec + questions extraction
        BillingService.consume_credits(
            amount=5,
            description="Extracted content spec and generated questions"
        )
        
        # 1. Extract Spec
        content_spec = self.orchestrator.extract_content_spec(user_prompt)
        
        # 2. Generate Questions
        brand_identity = self._get_brand_identity()
        questions = self.orchestrator.generate_questions(content_spec, brand_identity)
        
        return {
            "content_spec": content_spec,
            "questions": questions
        }

    @transaction.atomic
    def enhance_content_prompt(self, draft: ContentDraft, content_spec: dict, user_answers: dict, user):
        """
        Deducts credits, enhances the prompt, and captures a new content version.
        """
        BillingService.consume_credits(
            amount=3,
            description=f"Enhanced prompt for ContentDraft {draft.id}",
            reference_id=str(draft.id)
        )
        
        enhanced_prompt = self.orchestrator.enhance_prompt(content_spec, user_answers)
        
        # Update draft
        draft.enhanced_prompt = enhanced_prompt
        draft.save(update_fields=['enhanced_prompt'])
        
        # Capture Version
        version = ContentDraftService.create_content_version(draft, user, reason="Initial Prompt Enhancement")
        
        return enhanced_prompt, version

    @transaction.atomic
    def generate_image_for_platform(self, platform_record, user, reason="Image Generation"):
        """
        Generates an image for a specific platform and saves a reference.
        """
        draft = platform_record.draft
        
        BillingService.consume_credits(
            amount=10,
            description=f"Generated Image for {platform_record.platform}",
            reference_id=str(draft.id)
        )
        
        brand_identity = self._get_brand_identity()
        
        # Determine size logic based on platform
        size = platform_record.image_size or "1024x1024"
        
        image_url = self.orchestrator.build_and_generate_image(
            enhanced_prompt=draft.enhanced_prompt,
            brand_identity=brand_identity,
            platform=platform_record.platform,
            size=size
        )
        
        # Capture version snapshot since content changed
        ContentDraftService.create_content_version(draft, user, reason=reason)
        
        # In a real system, we'd upload `image_url` to Asset Library.
        # Now we create an Asset object with the local url.
        from apps.asset_library.models import Asset
        
        asset = Asset.objects.create(
            uploaded_by=user,
            name=f"Generated Image for {platform_record.platform}",
            file_url=image_url,
            asset_type=Asset.AssetType.IMAGE
        )
        
        image_ref = ImageReference.objects.create(
            platform=platform_record,
            asset=asset
        )
        
        return image_url, image_ref

    @transaction.atomic
    def generate_caption_for_platform(self, platform_record, user, reason="Caption Generation"):
        """
        Generates a caption for a specific platform.
        """
        draft = platform_record.draft
        
        BillingService.consume_credits(
            amount=5,
            description=f"Generated Caption for {platform_record.platform}",
            reference_id=str(draft.id)
        )
        
        brand_identity = self._get_brand_identity()
        
        caption_text = self.orchestrator.build_and_generate_caption(
            enhanced_prompt=draft.enhanced_prompt,
            platform=platform_record.platform,
            brand_identity=brand_identity
        )
        
        # Create or update caption record
        caption, created = Caption.objects.get_or_create(platform=platform_record)
        caption.caption_text = caption_text
        caption.is_manually_edited = False
        caption.save()
        
        # Capture version snapshot
        ContentDraftService.create_content_version(draft, user, reason=reason)
        
        return caption
