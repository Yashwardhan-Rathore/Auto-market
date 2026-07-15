from rest_framework import serializers
from .models import GeneratedContent, ContentVersion, BrandVoice, ContentTemplate

class BrandVoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = BrandVoice
        fields = ['id', 'tone', 'target_audience', 'guidelines', 'created_at', 'updated_at']

class ContentTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentTemplate
        fields = ['id', 'name', 'description', 'prompt_template', 'content_type', 'is_active', 'created_at', 'updated_at']

class ContentVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentVersion
        fields = ['id', 'version_number', 'prompt', 'text_content', 'image_url', 'created_at']

class GeneratedContentSerializer(serializers.ModelSerializer):
    versions = ContentVersionSerializer(many=True, read_only=True)
    
    class Meta:
        model = GeneratedContent
        fields = ['id', 'content_type', 'platform', 'status', 'versions', 'created_at']


# --- New Campaign Workflow Serializers ---

from .models import ContentDraft, ContentDraftVersion, ContentPlatform, Caption, Approval, ImageReference

class CaptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Caption
        fields = ['id', 'caption_text', 'hashtags', 'cta', 'is_manually_edited']


class ImageReferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageReference
        fields = ['id', 'asset']


class ContentPlatformSerializer(serializers.ModelSerializer):
    caption = CaptionSerializer(read_only=True)
    images = ImageReferenceSerializer(many=True, read_only=True)

    class Meta:
        model = ContentPlatform
        fields = [
            'id', 'platform', 'image_size', 'status', 'approval_status',
            'scheduled_datetime', 'published_datetime', 'error_message',
            'caption', 'images'
        ]


class ApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Approval
        fields = ['id', 'status', 'reviewer', 'review_notes', 'reviewed_at', 'created_at']


class ContentDraftVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentDraftVersion
        fields = ['id', 'version_number', 'enhanced_prompt_snapshot', 'regeneration_reason', 'created_at']


class ContentDraftSerializer(serializers.ModelSerializer):
    platforms = ContentPlatformSerializer(many=True, read_only=True)
    approvals = ApprovalSerializer(many=True, read_only=True)
    versions = ContentDraftVersionSerializer(many=True, read_only=True)

    class Meta:
        model = ContentDraft
        fields = [
            'id', 'owner', 'company', 'original_prompt', 'enhanced_prompt',
            'workflow_state', 'current_version', 'platforms', 'approvals', 'versions',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['owner', 'company', 'workflow_state', 'current_version']

class ContentDraftCreateSerializer(serializers.Serializer):
    platforms = serializers.ListField(
        child=serializers.ChoiceField(choices=ContentPlatform.PlatformChoices.choices),
        min_length=1
    )

class ContentDraftUpdateSerializer(serializers.Serializer):
    original_prompt = serializers.CharField(required=False, allow_blank=True)
    enhanced_prompt = serializers.CharField(required=False, allow_blank=True)

class ContentScheduleSerializer(serializers.Serializer):
    schedules = serializers.DictField(
        child=serializers.DateTimeField(),
        help_text="Dictionary of platform to scheduled_datetime"
    )

    def validate_schedules(self, value):
        from django.utils import timezone
        now = timezone.now()
        for k, v in value.items():
            if v and v <= now:
                raise serializers.ValidationError(f"Scheduled time for {k} must be in the future.")
        return value
