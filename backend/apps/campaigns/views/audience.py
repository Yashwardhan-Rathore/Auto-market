from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.campaigns.models import Audience
from apps.accounts.permissions import IsAdminOrSuperAdmin
from apps.campaigns.serializers import AudiencePreviewSerializer , AudienceCreateSerializer , AudienceSerializer
from apps.campaigns.services import AudienceService
from apps.common.ownership import filter_audiences_for_admin

class AudienceCreateAPIView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdminOrSuperAdmin,
    ]

    def post(self, request):

        serializer = AudienceCreateSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        audience = AudienceService.create_audience(
            validated_data=serializer.validated_data,
            user=request.user,
        )

        return Response(
            AudienceSerializer(audience).data,
            status=status.HTTP_201_CREATED,
        )
    
class AudienceListAPIView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdminOrSuperAdmin,
    ]

    def get(self, request):

        audiences = filter_audiences_for_admin(
            Audience.objects.filter(is_active=True), 
            request.user
        ).order_by("name")

        return Response(
            AudienceSerializer(
                audiences,
                many=True,
            ).data
        )

class AudiencePreviewAPIView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdminOrSuperAdmin,
    ]

    def post(self, request):

        serializer = AudiencePreviewSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        customers = AudienceService.preview_audience(
            customer_upload=serializer.validated_data[
                "customer_upload"
            ],
            audience_definition=serializer.validated_data[
                "audience_definition"
            ],
        )

        return Response(
            {
                "total_customers": customers.count(),
                "preview": [
                    {
                        "id": customer.id,
                        "data": customer.data,
                    }
                    for customer in customers[:20]
                ],
            }
        )