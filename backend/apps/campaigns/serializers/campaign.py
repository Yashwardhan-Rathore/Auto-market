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



class CampaignInfoSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    status = serializers.CharField()
    scheduled_at = serializers.DateTimeField(allow_null=True)
    started_at = serializers.DateTimeField(allow_null=True)
    completed_at = serializers.DateTimeField(allow_null=True)


class CampaignSummarySerializer(serializers.Serializer):
    total = serializers.IntegerField()
    sent = serializers.IntegerField()
    failed = serializers.IntegerField()
    pending = serializers.IntegerField()
    delivered = serializers.IntegerField()
    success_rate = serializers.FloatField()


class ChannelAnalyticsSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    total = serializers.IntegerField()
    sent = serializers.IntegerField()
    failed = serializers.IntegerField()
    pending = serializers.IntegerField()
    delivered = serializers.IntegerField()


class CustomerSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    data = serializers.JSONField()


class RecentDeliverySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    customer = CustomerSerializer()
    channel = serializers.CharField()
    status = serializers.CharField()
    provider_message_id = serializers.CharField(
        allow_null=True,
        allow_blank=True,
    )
    sent_at = serializers.DateTimeField(
        allow_null=True,
    )


class CampaignAnalyticsSerializer(serializers.Serializer):
    campaign = CampaignInfoSerializer()
    summary = CampaignSummarySerializer()
    channels = ChannelAnalyticsSerializer(many=True)
    recent_deliveries = RecentDeliverySerializer(many=True)