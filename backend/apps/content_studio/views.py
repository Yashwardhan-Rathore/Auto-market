from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import GeneratedContent, ContentVersion
from .services import ContentStudioService

class GenerateContentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        prompt = request.data.get('prompt')
        content_type = request.data.get('content_type')
        platform = request.data.get('platform', 'NONE')
        
        if not prompt or not content_type:
            return Response({"error": "prompt and content_type are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            generated, version = ContentStudioService.generate_initial_content(
                user=request.user,
                prompt=prompt,
                content_type=content_type,
                platform=platform
            )
            return Response({
                "id": generated.id,
                "content_type": generated.content_type,
                "platform": generated.platform,
                "text_content": version.text_content,
                "image_url": version.image_url,
                "version_id": version.id
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UpdateContentVersionAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        generated_content = get_object_or_404(GeneratedContent, id=pk, created_by=request.user)
        text_content = request.data.get('text_content')
        
        latest_version = generated_content.versions.first()
        if not latest_version:
            return Response({"error": "No version found"}, status=status.HTTP_404_NOT_FOUND)
            
        if text_content is not None:
            latest_version.text_content = text_content
            latest_version.save()
            
        return Response({"message": "Content updated successfully"}, status=status.HTTP_200_OK)

class ContentActionAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        generated_content = get_object_or_404(GeneratedContent, id=pk, created_by=request.user)
        action = request.data.get('action')
        
        latest_version = generated_content.versions.first()
        if not latest_version:
            return Response({"error": "No version found"}, status=status.HTTP_404_NOT_FOUND)
            
        if action == 'save_to_library':
            ContentStudioService.save_to_library(generated_content, latest_version)
            return Response({"message": "Saved to library successfully"})
        elif action == 'post':
            ContentStudioService.post_content(generated_content, latest_version)
            return Response({"message": "Posted successfully"})
        elif action == 'schedule':
            scheduled_time = request.data.get('scheduled_time')
            if not scheduled_time:
                return Response({"error": "scheduled_time is required for scheduling"}, status=status.HTTP_400_BAD_REQUEST)
            ContentStudioService.schedule_post(generated_content, latest_version, scheduled_time)
            return Response({"message": "Scheduled successfully"})
            
        return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)

from rest_framework import generics
from .models import BrandVoice, ContentTemplate
from .serializers import BrandVoiceSerializer, ContentTemplateSerializer, GeneratedContentSerializer

class BrandVoiceAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        brand_voice, created = BrandVoice.objects.get_or_create()
        serializer = BrandVoiceSerializer(brand_voice)
        return Response(serializer.data)

    def put(self, request):
        brand_voice, created = BrandVoice.objects.get_or_create()
        serializer = BrandVoiceSerializer(brand_voice, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ContentTemplateListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ContentTemplateSerializer

    def get_queryset(self):
        return ContentTemplate.objects.all()

    def perform_create(self, serializer):
        serializer.save()

class ContentTemplateDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ContentTemplateSerializer

    def get_queryset(self):
        return ContentTemplate.objects.all()

class GeneratedContentListAPIView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = GeneratedContentSerializer

    def get_queryset(self):
        return GeneratedContent.objects.all()

class RegenerateContentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        generated_content = get_object_or_404(GeneratedContent, id=pk, created_by=request.user)
        new_prompt = request.data.get('prompt')
        
        if not new_prompt:
            return Response({"error": "prompt is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            version = ContentStudioService.regenerate_content(generated_content, new_prompt)

            return Response({
                "message": "Content regenerated",
                "text_content": version.text_content,
                "image_url": version.image_url,
                "version_id": version.id
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# --- New Content Workflow Views ---
from rest_framework import viewsets
from rest_framework.decorators import action
from apps.accounts.permissions import IsContentStudioAuthorized
from .models import ContentDraft
from .serializers import (
    ContentDraftSerializer, ContentDraftCreateSerializer,
    ContentDraftUpdateSerializer, ContentScheduleSerializer
)
from .services.content_draft_service import ContentDraftService
from .services.approval_service import ApprovalService
from .services.schedule_service import ScheduleService
from .services.publishing_service import PublishingService

class ContentDraftViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsContentStudioAuthorized]
    serializer_class = ContentDraftSerializer

    def get_queryset(self):
        return ContentDraft.objects.all()

    @action(detail=False, methods=['post'])
    def analyze_prompt(self, request):
        from .serializers import AnalyzePromptSerializer
        from .ai.services import AILifecycleService
        
        serializer = AnalyzePromptSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        prompt = serializer.validated_data['prompt']
        lifecycle = AILifecycleService()
        
        try:
            result = lifecycle.process_content_spec_and_questions(prompt)
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def enhance_prompt(self, request, pk=None):
        from .serializers import EnhancePromptSerializer
        from .ai.services import AILifecycleService
        
        draft = self.get_object()
        serializer = EnhancePromptSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        content_spec = serializer.validated_data['content_spec']
        user_answers = serializer.validated_data['user_answers']
        
        lifecycle = AILifecycleService()
        try:
            enhanced_prompt, version = lifecycle.enhance_content_prompt(draft, content_spec, user_answers, request.user)
            return Response({
                "enhanced_prompt": enhanced_prompt,
                "version_id": version.id
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request, *args, **kwargs):
        serializer = ContentDraftCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
            
        platforms = serializer.validated_data['platforms']
        original_prompt = serializer.validated_data['original_prompt']
        draft = ContentDraftService.create_content_draft(request.user, original_prompt, platforms)
        
        return Response(ContentDraftSerializer(draft).data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        draft = self.get_object()
        serializer = ContentDraftUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        updated_draft = ContentDraftService.update_content_partial(draft, serializer.validated_data)
        return Response(ContentDraftSerializer(updated_draft).data)

    @action(detail=True, methods=['post'])
    def request_approval(self, request, pk=None):
        draft = self.get_object()
        try:
            ApprovalService.request_approval(draft)
            return Response({"message": "Approval requested successfully."})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        if request.user.role not in ['ADMIN', 'SUPER_ADMIN']:
            return Response({"error": "Only Admins can approve contents."}, status=status.HTTP_403_FORBIDDEN)
            
        draft = self.get_object()
        notes = request.data.get('notes', '')
        try:
            ApprovalService.approve_content(draft, request.user, notes)
            return Response({"message": "Content approved."})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        if request.user.role not in ['ADMIN', 'SUPER_ADMIN']:
            return Response({"error": "Only Admins can reject contents."}, status=status.HTTP_403_FORBIDDEN)
            
        draft = self.get_object()
        notes = request.data.get('notes', '')
        try:
            ApprovalService.reject_content(draft, request.user, notes)
            return Response({"message": "Content rejected."})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def schedule(self, request, pk=None):
        draft = self.get_object()
        serializer = ContentScheduleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            ScheduleService.save_schedules(draft, serializer.validated_data['schedules'])
            return Response({"message": "Schedules saved successfully."})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def regenerate(self, request, pk=None):
        """Regeneration to capture version snapshot and call AI"""
        draft = self.get_object()
        reason = request.data.get('reason', '')
        
        try:
            # First create the version snapshot
            version = ContentDraftService.create_content_version(draft, request.user, reason)
            
            # Now trigger actual generation for each platform
            from apps.content_studio.ai.services import AILifecycleService
            lifecycle = AILifecycleService()
            for platform in draft.platforms.all():
                lifecycle.generate_image_for_platform(platform, request.user, reason)
                lifecycle.generate_caption_for_platform(platform, request.user, reason)
                
            return Response({
                "message": "Content generated successfully.",
                "version_id": version.id,
                "version_number": version.version_number
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        draft = self.get_object()
        try:
            PublishingService.publish_content(draft, request.user)
            # Reload to get updated statuses
            draft.refresh_from_db()
            return Response(ContentDraftSerializer(draft).data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
