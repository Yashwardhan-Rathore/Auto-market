from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..serializers import CampaignCreateSerializer
from ..services import CampaignService


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

from django.shortcuts import get_object_or_404
from ..models import Campaign
from ..serializers import CampaignSubmitSerializer, CampaignApproveSerializer, CampaignRejectSerializer

class CampaignSubmitAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, campaign_id):
        serializer = CampaignSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        campaign = get_object_or_404(Campaign, id=campaign_id)

        campaign = CampaignService.submit_campaign(
            campaign=campaign,
            user=request.user,
        )

        return Response(
            {
                "message": "Campaign submitted for approval.",
                "status": campaign.status,
            },
            status=status.HTTP_200_OK,
        )


class CampaignApproveAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, campaign_id):
        serializer = CampaignApproveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        campaign = get_object_or_404(Campaign, id=campaign_id)

        campaign = CampaignService.approve_campaign(
            campaign=campaign,
            admin_user=request.user,
        )

        return Response(
            {
                "message": "Campaign approved.",
                "status": campaign.status,
            },
            status=status.HTTP_200_OK,
        )


class CampaignRejectAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, campaign_id):
        serializer = CampaignRejectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        campaign = get_object_or_404(Campaign, id=campaign_id)

        campaign = CampaignService.reject_campaign(
            campaign=campaign,
            admin_user=request.user,
            rejection_reason=serializer.validated_data["rejection_reason"],
        )

        return Response(
            {
                "message": "Campaign rejected.",
                "status": campaign.status,
            },
            status=status.HTTP_200_OK,
        )

from apps.accounts.permissions import IsAdminOrSuperAdmin
from ..serializers import PendingApprovalSerializer

class PendingApprovalAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]

    def get(self, request):
        campaigns = Campaign.objects.filter(
            status=Campaign.Status.PENDING_APPROVAL
        ).select_related(
            "task",
            "created_by",
            "submitted_by",
            "task__audience",
        ).prefetch_related(
            "campaign_channels__channel"
        ).order_by("submitted_at")

        serializer = PendingApprovalSerializer(campaigns, many=True)
        return Response(serializer.data)