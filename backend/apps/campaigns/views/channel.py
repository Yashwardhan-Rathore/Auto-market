from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from apps.campaigns.models import Campaign, Channel
from apps.campaigns.serializers import CampaignChannelSerializer, ChannelListSerializer
from apps.campaigns.services import assign_channels


class ChannelListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        channels = Channel.objects.filter(is_active=True).order_by("display_order", "name")
        serializer = ChannelListSerializer(channels, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


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

        # Only the campaign creator can modify it
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