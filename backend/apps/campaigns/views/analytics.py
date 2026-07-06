from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.campaigns.models import Campaign
from apps.campaigns.serializers import CampaignAnalyticsSerializer
from apps.campaigns.services.analytics import AnalyticsService


class CampaignAnalyticsAPIView(APIView):
    """
    Campaign Analytics API.
    """

    permission_classes = [
        IsAuthenticated,
    ]

    def get(self, request, campaign_id):

        campaign = Campaign.objects.filter(
            id=campaign_id,
            is_active=True,
            is_deleted=False,
        ).first()

        if campaign is None:
            return Response(
                {
                    "detail": "Campaign not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        analytics = AnalyticsService.get_campaign_summary(
            campaign=campaign,
        )

        serializer = CampaignAnalyticsSerializer(
            analytics,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )