from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import RetrieveUpdateAPIView
from django.shortcuts import get_object_or_404

from ..serializers import (
    CampaignCreateSerializer,
    CampaignRetrieveUpdateSerializer
)
from ..serializers.campaign_list import CampaignListSerializer
from ..services import CampaignService
from ..models import Campaign
from apps.common.utils import filter_by_tenant

class CampaignListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        campaigns = filter_by_tenant(Campaign.objects.filter(is_deleted=False), request.user, "created_by")
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

class CampaignRetrieveUpdateAPIView(RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CampaignRetrieveUpdateSerializer
    lookup_field = "id"

    def get_queryset(self):
        # Only allow editing own campaigns that are not deleted
        # and only if they are DRAFT or SCHEDULED
        return Campaign.objects.filter(
            created_by=self.request.user,
            is_deleted=False,
        )

class CampaignDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, campaign_id):
        campaign = get_object_or_404(Campaign, id=campaign_id)
        if campaign.created_by != request.user:
            return Response(
                {"detail": "You do not have permission to delete this campaign."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Soft delete
        campaign.is_deleted = True
        campaign.save(update_fields=["is_deleted"])
        return Response(status=status.HTTP_204_NO_CONTENT)