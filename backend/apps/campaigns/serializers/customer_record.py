from rest_framework import serializers
from ..models import CustomerRecord

class CustomerRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerRecord
        fields = [
            "id",
            "email",
            "phone",
            "first_name",
            "last_name",
            "data",
            "is_active",
            "created_at",
        ]
