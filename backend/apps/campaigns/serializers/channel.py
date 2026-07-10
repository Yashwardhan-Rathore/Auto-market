from rest_framework import serializers

from apps.campaigns.models import Channel


class ChannelListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Channel
        fields = [
            "id",
            "name",
            "code",
            "description",
            "icon",
        ]

class CampaignChannelSerializer(serializers.Serializer):
    channels = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False,
    )

    def validate_channels(self, value):
        """
        Validate that all channel IDs exist and are active.
        """

        channels = Channel.objects.filter(
            id__in=value,
            is_active=True,
        )

        if channels.count() != len(set(value)):
            raise serializers.ValidationError(
                "One or more selected channels are invalid."
            )

        return value