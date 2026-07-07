from rest_framework import serializers

from apps.campaigns.models import (
    Template,
    Channel,
    CampaignTemplate
)


class TemplateCreateSerializer(serializers.ModelSerializer):

    channel = serializers.PrimaryKeyRelatedField(
        queryset=Channel.objects.filter(
            is_active=True,
        )
    )

    class Meta:
        model = Template

        fields = [
            "id",
            "name",
            "channel",
            "subject",
            "body",
            "status",
        ]


class TemplateSerializer(serializers.ModelSerializer):

    channel_name = serializers.CharField(
        source="channel.name",
        read_only=True,
    )

    created_by_name = serializers.CharField(
        source="created_by.email",
        read_only=True,
    )

    class Meta:
        model = Template

        fields = [
            "id",

            "name",

            "channel",
            "channel_name",

            "subject",
            "body",

            "status",

            "created_by",
            "created_by_name",

            "created_at",
            "updated_at",
        ]


class CampaignTemplateAssignSerializer(serializers.ModelSerializer):

    class Meta:
        model = CampaignTemplate
        fields = [
            "campaign",
            "channel",
            "template",
        ]
        validators=[]