import logging
from django.db import transaction
from django.utils import timezone
from ..models import ContentDraft, Approval, ContentPlatform

logger = logging.getLogger(__name__)

class ApprovalService:
    @staticmethod
    @transaction.atomic
    def request_approval(draft):
        """
        Transitions the draft to IN_REVIEW and creates an Approval tracking record.
        Also updates platform approval statuses to REQUESTED.
        """
        if draft.workflow_state != ContentDraft.WorkflowState.DRAFT:
            raise ValueError("Only DRAFT contents can request approval.")
            
        draft.workflow_state = ContentDraft.WorkflowState.IN_REVIEW
        draft.save(update_fields=['workflow_state'])
        
        # Set all platforms to requested
        draft.platforms.update(approval_status=ContentPlatform.ApprovalStatus.REQUESTED)
        
        approval = Approval.objects.create(
            draft=draft,
            status=Approval.ApprovalState.REQUESTED
        )
        logger.info(f"Requested approval for ContentDraft {draft.id}")
        return approval

    @staticmethod
    @transaction.atomic
    def approve_content(draft, reviewer, notes=""):
        """
        Approves the content and marks it as APPROVED.
        """
        if draft.workflow_state != ContentDraft.WorkflowState.IN_REVIEW:
            raise ValueError("content must be IN_REVIEW to be approved.")
            
        draft.workflow_state = ContentDraft.WorkflowState.APPROVED
        draft.save(update_fields=['workflow_state'])
        
        draft.platforms.update(approval_status=ContentPlatform.ApprovalStatus.APPROVED)
        
        # Update pending approval record
        approval = draft.approvals.filter(status=Approval.ApprovalState.REQUESTED).order_by('-created_at').first()
        if approval:
            approval.status = Approval.ApprovalState.APPROVED
            approval.reviewer = reviewer
            approval.review_notes = notes
            approval.reviewed_at = timezone.now()
            approval.save()
            
        logger.info(f"ContentDraft {draft.id} approved by {reviewer.email}")
        return draft

    @staticmethod
    @transaction.atomic
    def reject_content(draft, reviewer, notes=""):
        """
        Rejects the content and sends it back to DRAFT state.
        """
        if draft.workflow_state != ContentDraft.WorkflowState.IN_REVIEW:
            raise ValueError("content must be IN_REVIEW to be rejected.")
            
        draft.workflow_state = ContentDraft.WorkflowState.DRAFT
        draft.save(update_fields=['workflow_state'])
        
        draft.platforms.update(approval_status=ContentPlatform.ApprovalStatus.REJECTED)
        
        approval = draft.approvals.filter(status=Approval.ApprovalState.REQUESTED).order_by('-created_at').first()
        if approval:
            approval.status = Approval.ApprovalState.REJECTED
            approval.reviewer = reviewer
            approval.review_notes = notes
            approval.reviewed_at = timezone.now()
            approval.save()
            
        logger.info(f"ContentDraft {draft.id} rejected by {reviewer.email}")
        return draft
