from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.campaigns.serializers import CampaignPreviewSerializer
from apps.campaigns.services import CampaignPreviewService


class CampaignPreviewAPIView(APIView):

    permission_classes = [
        IsAuthenticated,
    ]

    def post(self, request):

        serializer = CampaignPreviewSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        preview = CampaignPreviewService.preview(campaign=serializer.validated_data["campaign"])

        return Response(preview)