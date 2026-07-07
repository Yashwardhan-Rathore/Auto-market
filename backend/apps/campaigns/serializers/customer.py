from rest_framework import serializers
from ..models import CustomerUpload,Campaign

class CustomerUploadSerializer(serializers.Serializer):
    file = serializers.FileField()

    def validate_file(self, value):
        allowed_extensions = [".csv", ".xlsx", ".xls"]

        file_name = value.name.lower()

        if not any(file_name.endswith(ext) for ext in allowed_extensions):
            raise serializers.ValidationError(
                "Only CSV, XLSX and XLS files are allowed."
            )

        return value
    
class CustomerUploadListSerializer(serializers.ModelSerializer):
    uploaded_by = serializers.CharField(source="uploaded_by.username")

    class Meta:
        model = CustomerUpload
        fields = [
            "id",
            "file_name",
            "file_type",
            "uploaded_by",
            "uploaded_at",
            "total_records",
            "imported_records",
            "failed_records",
            "status",
        ]

class CampaignCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Campaign
        fields = [
            "task",
            "name",
            "description",
        ]