from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.communications.models import (
    CommunicationEvent,
    OrganizationEmailProvider,
    OrganizationSMSProvider,
    OrganizationWhatsAppProvider,
)
from apps.communications.serializers import (
    CommunicationEventSerializer,
    OrganizationEmailProviderSerializer,
    OrganizationSMSProviderSerializer,
    OrganizationWhatsAppProviderSerializer,
)


class EmailProviderListCreateView(APIView):
    def get(self, request):
        providers = OrganizationEmailProvider.objects.filter(
            organization=request.user
        )
        serializer = OrganizationEmailProviderSerializer(
            providers,
            many=True,
        )
        return Response(serializer.data)

    def post(self, request):
        serializer = OrganizationEmailProviderSerializer(
            data=request.data
        )
        serializer.is_valid(
            raise_exception=True
        )
        serializer.save(
            organization=request.user
        )
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )

class SMSProviderListCreateView(APIView):
    def get(self, request):
        providers = OrganizationSMSProvider.objects.filter(organization=request.user)
        serializer = OrganizationSMSProviderSerializer(providers, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = OrganizationSMSProviderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(organization=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class WhatsAppProviderListCreateView(APIView):
    def get(self, request):
        providers = OrganizationWhatsAppProvider.objects.filter(organization=request.user)
        serializer = OrganizationWhatsAppProviderSerializer(providers, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = OrganizationWhatsAppProviderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(organization=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CommunicationEventListView(APIView):
    def get(self, request):
        events = CommunicationEvent.objects.filter(
            organization=request.user
        ).order_by("-created_at")[:200]
        serializer = CommunicationEventSerializer(
            events,
            many=True,
        )
        return Response(serializer.data)

