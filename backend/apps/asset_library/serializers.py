from rest_framework import serializers
from .models import Asset, AssetFolder, AssetTag


class AssetTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetTag
        fields = ["id", "name"]


class AssetSerializer(serializers.ModelSerializer):
    tags = AssetTagSerializer(many=True, read_only=True)
    uploaded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Asset
        fields = [
            "id",
            "name",
            "file_url",
            "asset_type",
            "is_personal",
            "tags",
            "uploaded_by_name",
            "created_at",
        ]

    def get_uploaded_by_name(self, obj):
        u = obj.uploaded_by
        full = f"{u.first_name or ''} {u.last_name or ''}".strip()
        return full or u.email


class AssetCreateSerializer(serializers.Serializer):
    """Handles file upload to media, or a direct URL."""
    name = serializers.CharField(max_length=255)
    file = serializers.FileField(required=False)
    file_url = serializers.URLField(required=False, allow_blank=True)
    asset_type = serializers.ChoiceField(
        choices=Asset.AssetType.choices,
        default=Asset.AssetType.OTHER,
        required=False,
    )
    is_personal = serializers.BooleanField(default=False, required=False)

    def validate(self, data):
        if not data.get("file") and not data.get("file_url"):
            raise serializers.ValidationError("Provide either a file or a file_url.")
        return data
