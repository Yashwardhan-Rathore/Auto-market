from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..serializers import CampaignCreateSerializer
from ..serializers.campaign_list import CampaignListSerializer
from ..services import CampaignService
from ..models import Campaign
from apps.common.utils import filter_by_tenant

class CampaignListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        campaigns = filter_by_tenant(Campaign.objects.all(), request.user, "created_by")
        serializer = CampaignListSerializer(campaigns, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CampaignCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CampaignCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        campaign = CampaignService.create_campaign(
            validated_data=serializer.validated_data,
            user=request.user,
        )

        return Response(
            {
                "message": "Campaign created successfully.",
                "campaign": {
                    "id": campaign.id,
                    "task": campaign.task.id,
                    "name": campaign.name,
                    "description": campaign.description,
                    "status": campaign.status,
                    "created_by": campaign.created_by.email,
                    "created_at": campaign.created_at,
                },
            },
            status=status.HTTP_201_CREATED,
        )