from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q

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
from apps.accounts.permissions import IsAdminOrSuperAdmin


class EmailProviderListCreateView(ProviderManagementView):
    def get(self, request):
        providers = OrganizationEmailProvider.objects.all()
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
        serializer.save()
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )

class SMSProviderListCreateView(ProviderManagementView):
    def get(self, request):
        providers = OrganizationSMSProvider.objects.all()
        serializer = OrganizationSMSProviderSerializer(providers, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = OrganizationSMSProviderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class WhatsAppProviderListCreateView(ProviderManagementView):
    def get(self, request):
        providers = OrganizationWhatsAppProvider.objects.all()
        serializer = OrganizationWhatsAppProviderSerializer(providers, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = OrganizationWhatsAppProviderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CommunicationEventListView(ProviderManagementView):
    def get(self, request):
        events = CommunicationEvent.objects.filter(
            Q(campaign__task__created_by=request.user) | 
            Q(execution__automation__owner=request.user)
        ).order_by("-created_at")[:200]
        serializer = CommunicationEventSerializer(
            events,
            many=True,
        )
        return Response(serializer.data)

