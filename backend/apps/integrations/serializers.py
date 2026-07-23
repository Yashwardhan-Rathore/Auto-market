from rest_framework import serializers
from apps.integrations.models import SocialConnection

class SocialConnectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialConnection
        fields = [
            'id', 'platform', 'platform_account_id', 'account_name',
            'connection_status', 'token_expires_at', 'metadata',
            'created_at', 'updated_at'
        ]
        read_only_fields = fields

class OAuthConnectSerializer(serializers.Serializer):
    platform = serializers.ChoiceField(choices=SocialConnection.PlatformChoices.choices)

class OAuthCallbackSerializer(serializers.Serializer):
    state = serializers.CharField(required=True)
    code = serializers.CharField(required=True)
