from rest_framework import serializers

from apps.campaigns.models import CustomerUpload , Audience


class AudiencePreviewSerializer(serializers.Serializer):

    customer_upload = serializers.PrimaryKeyRelatedField(
        queryset=CustomerUpload.objects.all(),
    )

    audience_definition = serializers.JSONField()


class AudienceCreateSerializer(serializers.ModelSerializer):

    customer_upload = serializers.PrimaryKeyRelatedField(
        queryset=CustomerUpload.objects.all(),
    )

    class Meta:
        model = Audience

        fields = [
            "id",
            "name",
            "customer_upload",
            "definition",
        ]

class AudienceSerializer(serializers.ModelSerializer):

    customer_upload_name = serializers.CharField(
        source="customer_upload.file_name",
        read_only=True,
    )

    created_by_name = serializers.CharField(
        source="created_by.email",
        read_only=True,
    )

    class Meta:
        model = Audience

        fields = [
            "id",
            "name",

            "customer_upload",
            "customer_upload_name",

            "definition",

            "created_by",
            "created_by_name",

            "created_at",
            "updated_at",
        ]