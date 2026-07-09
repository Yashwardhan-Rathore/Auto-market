from rest_framework import serializers
from ..models import Campaign

class CampaignListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campaign
        fields = [
            "id",
            "name",
            "status",
            "created_at",
            "scheduled_at",
        ]
