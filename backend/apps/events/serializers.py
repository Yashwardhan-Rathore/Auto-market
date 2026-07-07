from rest_framework import serializers

from apps.events.models import WebsiteEvent


class WebsiteEventTrackSerializer(serializers.Serializer):
    event = serializers.ChoiceField(
        choices=WebsiteEvent.SUPPORTED_EVENTS
    )
    user = serializers.CharField(
        max_length=255
    )
    session_id = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
    )
    url = serializers.CharField(
        max_length=2048,
        required=False,
        allow_blank=True,
    )
    metadata = serializers.JSONField(
        required=False
    )


class WebsiteEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebsiteEvent
        fields = "__all__"
        read_only_fields = [
            "id",
            "organization",
            "created_at",
        ]

