from rest_framework import serializers
from ..models import CustomerRecord

class CustomerRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerRecord
        fields = [
            "id",
            "upload",
            "data",
            "created_at",
        ]
        read_only_fields = fields
