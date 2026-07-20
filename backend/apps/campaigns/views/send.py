from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.campaigns.serializers import CampaignSendSerializer
from apps.campaigns.services.delivery import DeliveryService


from apps.campaigns.tasks import send_campaign_background

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

        # Trigger background task
        send_campaign_background.delay(campaign.id)

        return Response(
            {
                "message": "Campaign sent successfully."
            },
            status=status.HTTP_200_OK,
        )