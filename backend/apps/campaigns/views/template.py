from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.campaigns.serializers import (
    TemplateCreateSerializer,
    TemplateSerializer,
    CampaignTemplateAssignSerializer
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
            CampaignTemplateAssignSerializer(
                campaign_template,
            ).data,
            status=status.HTTP_201_CREATED,
        )
    
