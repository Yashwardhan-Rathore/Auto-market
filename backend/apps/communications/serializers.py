from rest_framework import serializers

from apps.communications.models import (
    CommunicationEvent,
    OrganizationEmailProvider,
)


class OrganizationEmailProviderSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationEmailProvider
        fields = "__all__"
        read_only_fields = [
            "id",
            "organization",
            "created_at",
            "updated_at",
        ]
        extra_kwargs = {
            "aws_secret_key": {
                "write_only": True,
                "required": False,
            },
        }


class CommunicationEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunicationEvent
        fields = "__all__"
        read_only_fields = [
            "id",
            "organization",
            "execution",
            "created_at",
        ]

