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