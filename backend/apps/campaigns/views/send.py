from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.campaigns.serializers import CampaignSendSerializer
from apps.campaigns.services.delivery import DeliveryService


class CampaignSendAPIView(APIView):
    """
    Send a campaign immediately.
    """

    permission_classes = [
        IsAuthenticated,
    ]

    def post(self, request):

        serializer = CampaignSendSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        campaign = serializer.validated_data[
            "campaign"
        ]

        campaign = DeliveryService.send_campaign(
            campaign=campaign,
        )

        return Response(
            {
                "message": "Campaign sent successfully.",
                "campaign": campaign.id,
                "status": campaign.status,
            },
            status=status.HTTP_200_OK,
        )