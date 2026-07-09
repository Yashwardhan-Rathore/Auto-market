from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.campaigns.models import CustomerUpload
from ..serializers import CustomerUploadSerializer,CustomerUploadListSerializer, CampaignCreateSerializer
from ..serializers.customer_record import CustomerRecordSerializer
from ..services import CustomerImportService , CampaignService
from ..models import CustomerRecord
from apps.common.utils import filter_by_tenant


class CustomerUploadAPIView(APIView):
    def post(self, request):
        serializer = CustomerUploadSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        result = CustomerImportService.import_file(
            uploaded_file=serializer.validated_data["file"],
            uploaded_by=request.user,
        )

        return Response(
            result,
            status=status.HTTP_200_OK,
        )

class CustomerUploadListAPIView(APIView):

    def get(self, request):

        uploads = filter_by_tenant(CustomerUpload.objects.all(), request.user, "uploaded_by").order_by("-uploaded_at")

        serializer = CustomerUploadListSerializer(
            uploads,
            many=True,
        )

        return Response(serializer.data)


class CustomerRecordListAPIView(APIView):
    def get(self, request):
        customers = filter_by_tenant(CustomerRecord.objects.all(), request.user, "upload__uploaded_by").order_by("-created_at")[:100]
        serializer = CustomerRecordSerializer(customers, many=True)
        return Response(serializer.data)

class CampaignCreateAPIView(APIView):

    def post(self, request):

        serializer = CampaignCreateSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        campaign = CampaignService.create_campaign(
            serializer.validated_data,
            request.user,
        )

        return Response(
            {
                "id": campaign.id,
                "name": campaign.name,
                "status": campaign.status,
            },
            status=status.HTTP_201_CREATED,
        )
    
