from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import redirect
from apps.integrations.models import SocialConnection
from apps.integrations.serializers import SocialConnectionSerializer, OAuthConnectSerializer, OAuthCallbackSerializer
from apps.integrations.services.oauth_service import OAuthService

class SocialConnectionViewSet(viewsets.ModelViewSet):
    """
    API endpoints for managing social media connections.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = SocialConnectionSerializer
    
    def get_queryset(self):
        # We need to query via MAUser mapping
        from apps.accounts.models import MAUser
        ma_user = getattr(self.request.user, 'ma_user', None)
        if not ma_user:
            ma_user = MAUser.objects.filter(user=self.request.user).first()
            
        if ma_user:
            return SocialConnection.objects.filter(user=ma_user)
        return SocialConnection.objects.none()

    @action(detail=False, methods=['get'], url_path='connect/(?P<platform>[^/.]+)')
    def connect(self, request, platform=None):
        """
        Returns the authorization URL for the requested platform.
        """
        try:
            url = OAuthService.generate_auth_url(request.user, platform)
            return Response({"authorization_url": url}, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": "Failed to generate authorization URL.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get', 'post'], url_path='callback/(?P<platform>[^/.]+)', permission_classes=[])
    def callback(self, request, platform=None):
        """
        Handles the OAuth callback from the platform.
        No IsAuthenticated needed here because the 'state' token handles security.
        """
        data = request.GET if request.method == 'GET' else request.data
        serializer = OAuthCallbackSerializer(data=data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        state = serializer.validated_data['state']
        code = serializer.validated_data['code']
        
        try:
            connection = OAuthService.handle_callback(state, code, platform)
            return Response(SocialConnectionSerializer(connection).data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": "OAuth callback failed.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def validate(self, request, pk=None):
        """
        Validates if the connection's token is still active.
        """
        connection = self.get_object()
        # Ensure we pass the MAUser
        is_valid = OAuthService.validate_connection(str(connection.id), connection.user)
        
        # Refresh from db to get updated status
        connection.refresh_from_db()
        return Response({
            "is_valid": is_valid,
            "status": connection.connection_status
        }, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        """
        Disconnects the social account.
        """
        connection = self.get_object()
        try:
            OAuthService.disconnect_account(str(connection.id), connection.user)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": "Failed to disconnect account.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
