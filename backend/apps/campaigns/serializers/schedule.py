from rest_framework import serializers

from apps.campaigns.models import Campaign


class CampaignScheduleSerializer(serializers.Serializer):

    campaign = serializers.PrimaryKeyRelatedField(
        queryset=Campaign.objects.filter(
            is_active=True,
            is_deleted=False,
        )
    )

    scheduled_at = serializers.DateTimeField()