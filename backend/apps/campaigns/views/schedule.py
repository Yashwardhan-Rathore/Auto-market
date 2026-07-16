from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.campaigns.serializers import (
    CampaignScheduleSerializer,
    CampaignScheduleUpdateSerializer
)

from apps.campaigns.services import (
    CampaignScheduleService,
)


class CampaignScheduleAPIView(APIView):

    permission_classes = [
        IsAuthenticated,
    ]

    def post(self, request):

        serializer = CampaignScheduleSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        campaign = CampaignScheduleService.schedule(
            campaign=serializer.validated_data["campaign"],
            scheduled_at=serializer.validated_data["scheduled_at"],
            user=request.user,
        )

        return Response(
            {
                "message": "Campaign scheduled successfully.",
                "campaign": campaign.id,
                "status": campaign.status,
                "scheduled_at": campaign.scheduled_at,
            }
        )

class CampaignScheduleUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, campaign_id):
        from django.shortcuts import get_object_or_404
        from apps.campaigns.models import Campaign
        
        campaign = get_object_or_404(Campaign, id=campaign_id)
        
        serializer = CampaignScheduleUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        campaign = CampaignScheduleService.update_schedule(
            campaign=campaign,
            scheduled_at=serializer.validated_data["scheduled_at"],
            user=request.user,
        )

        return Response(
            {
                "message": "Campaign schedule updated successfully.",
                "campaign": {
                    "id": campaign.id,
                    "status": campaign.status,
                    "scheduled_at": campaign.scheduled_at,
                }
            },
            status=200
        )