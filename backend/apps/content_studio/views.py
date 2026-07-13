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

        # Get company from user (assuming one company for now)
        company = request.user.companies.first()
        if not company:
            return Response({"error": "User does not belong to a company"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            generated, version = ContentStudioService.generate_initial_content(
                company=company,
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
