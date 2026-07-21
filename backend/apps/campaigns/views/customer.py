from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.campaigns.models import CustomerUpload
from ..serializers import CustomerUploadSerializer,CustomerUploadListSerializer, CampaignCreateSerializer
from ..serializers.customer_record import CustomerRecordSerializer
from ..services import CustomerImportService , CampaignService
from ..models import CustomerRecord
from apps.common.ownership import filter_customer_records_for_admin, filter_customer_uploads_for_admin
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated


class CustomerUploadAPIView(APIView):
    def post(self, request):
        serializer = CustomerUploadSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        result = CustomerImportService.import_file(
            uploaded_file=serializer.validated_data["file"],
            uploaded_by=request.user,
        )

        return Response(
            result,
            status=status.HTTP_200_OK,
        )

class CustomerUploadListAPIView(APIView):

    def get(self, request):

        uploads = filter_customer_uploads_for_admin(CustomerUpload.objects.all(), request.user).order_by("-uploaded_at")

        serializer = CustomerUploadListSerializer(
            uploads,
            many=True,
        )

        return Response(serializer.data)


class CustomerRecordListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        customers = filter_customer_records_for_admin(CustomerRecord.objects.all(), request.user).order_by("-created_at")[:100]
        serializer = CustomerRecordSerializer(customers, many=True)
        return Response(serializer.data)

    def post(self, request):
        contact = _validated_contact(request.data)
        upload, _ = CustomerUpload.objects.get_or_create(
            uploaded_by=request.user,
            file_name="Manual contacts",
            defaults={"file_type": "manual", "status": CustomerUpload.Status.COMPLETED},
        )
        customer = CustomerRecord.objects.create(upload=upload, data=contact)
        upload.total_records = upload.records.count()
        upload.imported_records = upload.total_records
        upload.save(update_fields=["total_records", "imported_records"])
        return Response(CustomerRecordSerializer(customer).data, status=status.HTTP_201_CREATED)


class CustomerRecordDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, pk):
        queryset = filter_customer_records_for_admin(CustomerRecord.objects.all(), request.user)
        return get_object_or_404(queryset, pk=pk)

    def patch(self, request, pk):
        customer = self.get_object(request, pk)
        customer.data = _validated_contact({**customer.data, **request.data})
        customer.save(update_fields=["data"])
        return Response(CustomerRecordSerializer(customer).data)

    def delete(self, request, pk):
        customer = self.get_object(request, pk)
        upload = customer.upload
        customer.delete()
        upload.total_records = upload.records.count()
        upload.imported_records = upload.total_records
        upload.save(update_fields=["total_records", "imported_records"])
        return Response(status=status.HTTP_204_NO_CONTENT)


def _validated_contact(payload):
    name = str(payload.get("name", "")).strip()
    email = str(payload.get("email", "")).strip().lower()
    if not name or not email:
        from rest_framework.exceptions import ValidationError
        raise ValidationError({"detail": "Name and email are required."})
    return {
        "name": name,
        "email": email,
        "phone_no": str(payload.get("phone_no", payload.get("phone", ""))).strip(),
        "tags": payload.get("tags", []),
        "list": str(payload.get("list", "General")).strip() or "General",
        "score": max(0, min(100, int(payload.get("score", 0) or 0))),
        "status": str(payload.get("status", "Active")),
        "activity": str(payload.get("activity", "Just added")),
    }

class CampaignCreateAPIView(APIView):

    def post(self, request):

        serializer = CampaignCreateSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        campaign = CampaignService.create_campaign(
            serializer.validated_data,
            request.user,
        )

        return Response(
            {
                "id": campaign.id,
                "name": campaign.name,
                "status": campaign.status,
            },
            status=status.HTTP_201_CREATED,
        )
    
