from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.common.models import Company
from .models import ContentDraft, ContentPlatform
from .services.publishing_service import PublishingService
from unittest.mock import patch

User = get_user_model()

class PublishingServiceTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(email="admin@test.com", password="pwd")
        self.admin.role = "ADMIN"
        self.admin.save()
        
        self.user = User.objects.create_user(email="user@test.com", password="pwd")
        self.user.role = "USER"
        self.user.save()
        
        self.draft = ContentDraft.objects.create(
            owner=self.user,
            workflow_state=ContentDraft.WorkflowState.APPROVED,
            enhanced_prompt="Test prompt"
        )
        self.platform1 = ContentPlatform.objects.create(
            draft=self.draft,
            platform=ContentPlatform.PlatformChoices.FACEBOOK
        )
        self.platform2 = ContentPlatform.objects.create(
            draft=self.draft,
            platform=ContentPlatform.PlatformChoices.INSTAGRAM
        )

    @patch('apps.content_studio.services.publishing_service.SocialService.publish_post')
    def test_successful_publish(self, mock_publish):
        mock_publish.return_value = {"success": True, "platform_post_id": "123"}
        
        updated_draft = PublishingService.publish_content(self.draft, self.admin)
        
        self.assertEqual(updated_draft.workflow_state, ContentDraft.WorkflowState.PUBLISHED)
        self.platform1.refresh_from_db()
        self.assertEqual(self.platform1.status, ContentPlatform.PlatformStatus.POSTED)
        self.assertEqual(self.platform1.external_post_id, "123")

    @patch('apps.content_studio.services.publishing_service.SocialService.publish_post')
    def test_failed_publish_one_platform(self, mock_publish):
        def side_effect(platform, content, image_url):
            if platform == 'FACEBOOK':
                return {"success": False, "error": "Invalid token"}
            return {"success": True, "platform_post_id": "456"}
            
        mock_publish.side_effect = side_effect
        
        updated_draft = PublishingService.publish_content(self.draft, self.admin)
        
        self.assertEqual(updated_draft.workflow_state, ContentDraft.WorkflowState.APPROVED) # Overall not published because one failed
        
        self.platform1.refresh_from_db()
        self.assertEqual(self.platform1.status, ContentPlatform.PlatformStatus.FAILED)
        self.assertEqual(self.platform1.error_message, "Invalid token")
        
        self.platform2.refresh_from_db()
        self.assertEqual(self.platform2.status, ContentPlatform.PlatformStatus.POSTED)

    def test_unauthorized_user_cannot_publish_unapproved(self):
        self.draft.workflow_state = ContentDraft.WorkflowState.DRAFT
        self.draft.save()
        
        with self.assertRaises(ValueError):
            PublishingService.publish_content(self.draft, self.user)
            
    @patch('apps.content_studio.services.publishing_service.SocialService.publish_post')
    def test_admin_can_bypass_approval(self, mock_publish):
        mock_publish.return_value = {"success": True}
        self.draft.workflow_state = ContentDraft.WorkflowState.DRAFT
        self.draft.save()
        
        # Admin can publish even if draft
        updated_draft = PublishingService.publish_content(self.draft, self.admin)
        self.assertEqual(updated_draft.workflow_state, ContentDraft.WorkflowState.PUBLISHED)
