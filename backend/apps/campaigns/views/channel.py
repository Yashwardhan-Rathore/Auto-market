from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from apps.campaigns.models import Campaign
from apps.campaigns.serializers import CampaignChannelSerializer
from apps.campaigns.services import assign_channels


class AssignChannelsView(APIView):

    permission_classes = [
        IsAuthenticated,
    ]

    def post(self, request, campaign_id):

        serializer = CampaignChannelSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        campaign = get_object_or_404(
            Campaign,
            id=campaign_id,
            is_deleted=False,
        )

        # Only USER can modify campaigns
        if request.user.role != "USER":
            return Response(
                {
                    "detail": "Only marketing users can modify campaigns."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # USER can modify only their own campaigns
        if campaign.created_by != request.user:
            return Response(
                {
                    "detail": "You can modify only your own campaign."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        assign_channels(
            campaign=campaign,
            channel_ids=serializer.validated_data["channels"],
        )

        return Response(
            {
                "message": "Channels assigned successfully."
            },
            status=status.HTTP_200_OK,
        )