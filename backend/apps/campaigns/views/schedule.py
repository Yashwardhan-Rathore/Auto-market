from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.campaigns.serializers import (
    CampaignScheduleSerializer,
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