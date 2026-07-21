from rest_framework import serializers

from apps.campaigns.models import CustomerUpload , Audience
from apps.common.utils import filter_by_tenant


class AudiencePreviewSerializer(serializers.Serializer):

    customer_upload = serializers.PrimaryKeyRelatedField(
        queryset=CustomerUpload.objects.all(),
    )

    audience_definition = serializers.JSONField()

    def validate_customer_upload(self, value):
        request = self.context.get("request")
        if request and not filter_by_tenant(
            CustomerUpload.objects.filter(id=value.id),
            request.user,
            "uploaded_by",
        ).exists():
            raise serializers.ValidationError("Select a contact source you have access to.")
        return value


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

    def validate_customer_upload(self, value):
        request = self.context.get("request")
        if request and not filter_by_tenant(
            CustomerUpload.objects.filter(id=value.id),
            request.user,
            "uploaded_by",
        ).exists():
            raise serializers.ValidationError("Select a contact source you have access to.")
        return value

class AudienceSerializer(serializers.ModelSerializer):

    type = serializers.SerializerMethodField()
    contacts_count = serializers.SerializerMethodField()

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
            "type",
            "contacts_count",

            "created_by",
            "created_by_name",

            "created_at",
            "updated_at",
        ]

    def get_type(self, obj):
        return str((obj.definition or {}).get("type", "DYNAMIC")).upper()

    def get_contacts_count(self, obj):
        from apps.campaigns.services import AudienceService

        try:
            return AudienceService.get_customers(
                customer_upload=obj.customer_upload,
                audience_definition=obj.definition or {},
            ).count()
        except (KeyError, TypeError, ValueError):
            return obj.customer_upload.records.count()
