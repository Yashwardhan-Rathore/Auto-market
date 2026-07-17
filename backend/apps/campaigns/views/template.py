from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.campaigns.serializers import (
    TemplateCreateSerializer,
    TemplateSerializer,
    CampaignTemplateAssignSerializer,
    TemplateUpdateSerializer
)
from apps.campaigns.services import (
    TemplateService,
    CampaignTemplateService
)

class TemplateCreateAPIView(APIView):

    permission_classes = [
        IsAuthenticated,
    ]

    def post(self, request):

        serializer = TemplateCreateSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        template = TemplateService.create_template(
            validated_data=serializer.validated_data,
            user=request.user,
        )

        return Response(
            TemplateSerializer(template).data,
            status=status.HTTP_201_CREATED,
        )
    
class TemplateListAPIView(APIView):

    permission_classes = [
        IsAuthenticated,
    ]

    def get(self, request):

        templates = TemplateService.list_templates(user=request.user)

        return Response(
            TemplateSerializer(
                templates,
                many=True,
            ).data
        )
    

class CampaignTemplateAssignAPIView(APIView):

    permission_classes = [
        IsAuthenticated,
    ]

    def post(self, request):

        serializer = CampaignTemplateAssignSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        campaign_template = CampaignTemplateService.assign_template(
            validated_data=serializer.validated_data,
            user=request.user,
        )

        return Response(
            {
                "message": "Template assigned to campaign successfully."
            },
            status=status.HTTP_201_CREATED,
        )
    
class TemplateUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, template_id):
        from django.shortcuts import get_object_or_404
        from apps.campaigns.models import Template
        
        template = get_object_or_404(Template, id=template_id)
        
        serializer = TemplateUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        template = TemplateService.update_template(
            template=template,
            user=request.user,
            validated_data=serializer.validated_data,
        )

        return Response(
            {
                "message": "Template updated successfully.",
                "campaign_status": "DRAFT"
            },
            status=status.HTTP_200_OK,
        )
