import logging
from django.db import transaction
from ..models import ContentDraft, ContentDraftVersion, ContentPlatform

logger = logging.getLogger(__name__)

class ContentDraftService:
    @staticmethod
    @transaction.atomic
    def create_content_draft(user, original_prompt, platforms):
        """
        Creates a new ContentDraft and its related platforms.
        `platforms` is a list of PlatformChoices strings.
        """
        draft = ContentDraft.objects.create(
            owner=user,
            original_prompt=original_prompt,
            workflow_state=ContentDraft.WorkflowState.DRAFT
        )
        
        for platform in platforms:
            ContentPlatform.objects.create(
                draft=draft,
                platform=platform
            )
            
        logger.info(f"Created ContentDraft {draft.id} with platforms {platforms}")
        return draft

    @staticmethod
    def update_content_partial(draft, update_fields):
        """
        Handles partial updates efficiently, e.g., for autosaving.
        `update_fields` is a dict of fields to update on the draft.
        """
        allowed_fields = {'original_prompt', 'enhanced_prompt'}
        
        to_save = False
        for field, value in update_fields.items():
            if field in allowed_fields:
                setattr(draft, field, value)
                to_save = True
                
        if to_save:
            draft.save(update_fields=list(update_fields.keys()))
            logger.info(f"Autosaved ContentDraft {draft.id}")
            
        return draft

    @staticmethod
    @transaction.atomic
    def create_content_version(draft, user, reason=""):
        """
        Captures a snapshot of the current enhanced_prompt into a ContentDraftVersion.
        """
        draft.current_version += 1
        draft.save(update_fields=['current_version'])
        
        version = ContentDraftVersion.objects.create(
            draft=draft,
            version_number=draft.current_version,
            enhanced_prompt_snapshot=draft.enhanced_prompt,
            regeneration_reason=reason,
            created_by=user
        )
        
        logger.info(f"Created version {version.version_number} for ContentDraft {draft.id}")
        return version
