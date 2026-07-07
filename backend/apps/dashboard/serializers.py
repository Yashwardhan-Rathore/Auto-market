from rest_framework import serializers


# ==========================================================
# Campaign Statistics
# ==========================================================

class CampaignStatsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    draft = serializers.IntegerField()
    scheduled = serializers.IntegerField()
    sending = serializers.IntegerField()
    completed = serializers.IntegerField()


# ==========================================================
# Delivery Statistics
# ==========================================================

class DeliveryStatsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    sent = serializers.IntegerField()
    failed = serializers.IntegerField()
    pending = serializers.IntegerField()
    delivered = serializers.IntegerField()
    success_rate = serializers.FloatField()


# ==========================================================
# Recent Campaign
# ==========================================================

class RecentCampaignSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    status = serializers.CharField()
    scheduled_at = serializers.DateTimeField(allow_null=True)
    started_at = serializers.DateTimeField(allow_null=True)
    completed_at = serializers.DateTimeField(allow_null=True)
    created_at = serializers.DateTimeField()


# ==========================================================
# Customer
# ==========================================================

class CustomerSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    data = serializers.JSONField()


# ==========================================================
# Campaign
# ==========================================================

class CampaignSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()


# ==========================================================
# Recent Delivery
# ==========================================================

class RecentDeliverySerializer(serializers.Serializer):
    id = serializers.IntegerField()

    campaign = CampaignSerializer()

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

    created_at = serializers.DateTimeField()


# ==========================================================
# Dashboard
# ==========================================================

class DashboardSerializer(serializers.Serializer):
    campaigns = CampaignStatsSerializer()

    deliveries = DeliveryStatsSerializer()

    recent_campaigns = RecentCampaignSerializer(
        many=True,
    )

    recent_deliveries = RecentDeliverySerializer(
        many=True,
    )