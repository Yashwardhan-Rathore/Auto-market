from rest_framework import serializers

from apps.automation.models import (
    AutomationNode,
    AutomationEdge,
)


class AutomationNodeSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = AutomationNode

        fields = "__all__"

        read_only_fields = [
            "automation",
            "created_at",
            "updated_at",
        ]


class AutomationEdgeSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = AutomationEdge

        fields = "__all__"

        read_only_fields = [
            "automation",
            "created_at",
        ]