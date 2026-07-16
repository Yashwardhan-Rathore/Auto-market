import logging
from django.db import transaction
from ..models import GeneratedContent, ContentVersion, BrandVoice, ContentTemplate
from apps.billing.services import BillingService
from apps.integrations.openai_service import OpenAIService

logger = logging.getLogger(__name__)

class ContentStudioService:
    @staticmethod
    @transaction.atomic
    def generate_initial_content(user, prompt, content_type, platform="NONE", template_id=None):
        """
        Creates a new GeneratedContent and its first version.
        Charges 10 credits.
        """
        enhanced_prompt = prompt
        
        if template_id:
            try:
                template = ContentTemplate.objects.get(id=template_id)
                enhanced_prompt = f"Template: {template.prompt_template}\n\nUser Input: {prompt}"
            except ContentTemplate.DoesNotExist:
                pass
                
        try:
            brand_voice = BrandVoice.objects.first()
            if brand_voice:
                enhanced_prompt += f"\n\nBrand Tone: {brand_voice.tone}"
                if brand_voice.guidelines:
                    enhanced_prompt += f"\nBrand Guidelines: {brand_voice.guidelines}"
                if brand_voice.target_audience:
                    enhanced_prompt += f"\nTarget Audience: {brand_voice.target_audience}"
        except BrandVoice.DoesNotExist:
            pass

        # Consume credits first
        BillingService.consume_credits(
            amount=10,
            description=f"Generated {content_type} content",
        )

        # Call OpenAI
        ai_response = OpenAIService.generate_content(enhanced_prompt, content_type)

        # Create GeneratedContent
        generated = GeneratedContent.objects.create(
            created_by=user,
            content_type=content_type,
            platform=platform,
            status=GeneratedContent.Status.DRAFT
        )

        # Create ContentVersion
        version = ContentVersion.objects.create(
            generated_content=generated,
            version_number=1,
            prompt=prompt,
            text_content=ai_response
        )

        logger.info(f"Successfully generated initial content {generated.id}")
        return generated, version

    @staticmethod
    @transaction.atomic
    def regenerate_content(generated_content, new_prompt):
        """
        Generates a new version for an existing GeneratedContent.
        Charges 5 credits.
        """
        enhanced_prompt = new_prompt
        
        try:
            brand_voice = BrandVoice.objects.first()
            if brand_voice:
                enhanced_prompt += f"\n\nBrand Tone: {brand_voice.tone}"
                if brand_voice.guidelines:
                    enhanced_prompt += f"\nBrand Guidelines: {brand_voice.guidelines}"
                if brand_voice.target_audience:
                    enhanced_prompt += f"\nTarget Audience: {brand_voice.target_audience}"
        except BrandVoice.DoesNotExist:
            pass

        # Consume credits
        BillingService.consume_credits(
            amount=5,
            description=f"Regenerated content {generated_content.id}",
            reference_id=str(generated_content.id)
        )

        # Call OpenAI
        ai_response = OpenAIService.generate_content(enhanced_prompt, generated_content.content_type)

        # Get latest version number
        latest_version = generated_content.versions.first()
        next_version_num = latest_version.version_number + 1 if latest_version else 1

        # Create new ContentVersion
        version = ContentVersion.objects.create(
            generated_content=generated_content,
            version_number=next_version_num,
            prompt=new_prompt,
            text_content=ai_response
        )

        logger.info(f"Successfully regenerated content {generated_content.id} (v{next_version_num})")
        return version

    @staticmethod
    def save_to_library(generated_content, version):
        """
        Mock implementation to save generated content to asset library.
        """
        logger.info(f"Saved content {generated_content.id} version {version.version_number} to asset library.")
        return True
        
    @staticmethod
    def post_content(generated_content, version):
        """
        Mock implementation to post content directly.
        """
        logger.info(f"Posted content {generated_content.id} version {version.version_number} to {generated_content.platform}.")
        generated_content.status = GeneratedContent.Status.PUBLISHED
        generated_content.save()
        return True
        
    @staticmethod
    def schedule_post(generated_content, version, scheduled_time):
        """
        Mock implementation to schedule a post.
        """
        logger.info(f"Scheduled content {generated_content.id} version {version.version_number} for {scheduled_time}.")
        generated_content.status = GeneratedContent.Status.APPROVED
        generated_content.save()
        return True
