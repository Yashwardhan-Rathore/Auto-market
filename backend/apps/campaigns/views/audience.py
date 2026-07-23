from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from apps.campaigns.models import Audience
from apps.accounts.permissions import IsAdminOrSuperAdmin
from apps.campaigns.serializers import (
    AudiencePreviewSerializer,
    AudienceCreateSerializer,
    AudienceSerializer,
)
from apps.campaigns.services import AudienceService
from apps.common.ownership import filter_audiences_for_admin


class AudienceCreateAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]

    def post(self, request):
        serializer = AudienceCreateSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        audience = AudienceService.create_audience(
            validated_data=serializer.validated_data,
            user=request.user,
        )
        return Response(
            AudienceSerializer(audience, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class AudienceListAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]

    def get(self, request):
        audiences = filter_audiences_for_admin(
            Audience.objects.filter(is_active=True), request.user
        ).order_by("name")
        return Response(
            AudienceSerializer(audiences, many=True, context={"request": request}).data
        )


class AudienceDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]

    def _get_object(self, request, audience_id):
        return get_object_or_404(
            filter_audiences_for_admin(
                Audience.objects.filter(is_active=True), request.user
            ),
            id=audience_id,
        )

    def get(self, request, audience_id):
        audience = self._get_object(request, audience_id)
        return Response(AudienceSerializer(audience, context={"request": request}).data)

    def patch(self, request, audience_id):
        audience = self._get_object(request, audience_id)
        serializer = AudienceCreateSerializer(
            audience, data=request.data, partial=True, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(AudienceSerializer(audience, context={"request": request}).data)

    def delete(self, request, audience_id):
        audience = self._get_object(request, audience_id)
        audience.is_active = False
        audience.save(update_fields=["is_active", "updated_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)


class AudiencePreviewAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]

    def post(self, request):
        serializer = AudiencePreviewSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        customers = AudienceService.preview_audience(
            user=request.user,
            customer_upload=serializer.validated_data.get("customer_upload"),
            audience_definition=serializer.validated_data["audience_definition"],
        )
        full = str(request.data.get("full", "false")).lower() == "true"
        limit = 5000 if full else 20
        return Response(
            {
                "total_customers": customers.count(),
                "preview": [
                    {"id": c.id, "data": c.data}
                    for c in customers[:limit]
                ],
            }
        )
