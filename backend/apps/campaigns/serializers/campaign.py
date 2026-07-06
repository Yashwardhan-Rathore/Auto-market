from rest_framework import serializers
from ..models import CustomerUpload,Campaign

class CampaignCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Campaign
        fields = [
            "task",
            "name",
            "description",
        ]
    def validate_name(self, value):
        value = value.strip()

        if len(value) < 3:
            raise serializers.ValidationError(
                "Campaign name must be at least 3 characters."
            )

        return value
    

class CampaignPreviewSerializer(serializers.Serializer):

    campaign = serializers.PrimaryKeyRelatedField(
        queryset=Campaign.objects.all(),
    )

class CampaignSendSerializer(serializers.Serializer):

    campaign = serializers.PrimaryKeyRelatedField(
        queryset=Campaign.objects.filter(
            is_active=True,
            is_deleted=False,
        )
    )

class CampaignAnalyticsSerializer(serializers.Serializer):

    campaign = serializers.IntegerField()

    campaign_name = serializers.CharField()

    status = serializers.CharField()

    total = serializers.IntegerField()

    sent = serializers.IntegerField()

    failed = serializers.IntegerField()

    pending = serializers.IntegerField()

    delivered = serializers.IntegerField()

    success_rate = serializers.FloatField()