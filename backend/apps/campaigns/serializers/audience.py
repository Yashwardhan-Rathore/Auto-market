from rest_framework import serializers
from apps.campaigns.models import CustomerUpload, Audience
from apps.common.ownership import filter_by_tenant


class AudiencePreviewSerializer(serializers.Serializer):
    audience_definition = serializers.JSONField()
    # customer_upload is now optional (kept for legacy callers)
    customer_upload = serializers.PrimaryKeyRelatedField(
        queryset=CustomerUpload.objects.all(),
        required=False,
        allow_null=True,
    )


class AudienceCreateSerializer(serializers.ModelSerializer):
    customer_upload = serializers.PrimaryKeyRelatedField(
        queryset=CustomerUpload.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Audience
        fields = ["id", "name", "customer_upload", "definition"]


class AudienceSerializer(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()
    contacts_count = serializers.SerializerMethodField()
    customer_upload_name = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source="created_by.email", read_only=True)

    class Meta:
        model = Audience
        fields = [
            "id", "name",
            "customer_upload", "customer_upload_name",
            "definition", "type", "contacts_count",
            "created_by", "created_by_name",
            "created_at", "updated_at",
        ]

    def get_customer_upload_name(self, obj):
        if obj.customer_upload:
            return obj.customer_upload.file_name
        return "All Contacts"

    def get_type(self, obj):
        return str((obj.definition or {}).get("type", "DYNAMIC")).upper()

    def get_contacts_count(self, obj):
        from apps.campaigns.services import AudienceService
        request = self.context.get("request")
        user = request.user if request else None
        try:
            return AudienceService.get_customers(
                user=user,
                customer_upload=obj.customer_upload,
                audience_definition=obj.definition or {},
            ).count()
        except (KeyError, TypeError, ValueError):
            return 0
