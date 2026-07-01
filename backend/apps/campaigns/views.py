from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import CustomerUpload
from .serializers import CustomerUploadSerializer , CustomerUploadListSerializer
from .services import CustomerImportService


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

        uploads = CustomerUpload.objects.all().order_by("-uploaded_at")

        serializer = CustomerUploadListSerializer(
            uploads,
            many=True,
        )

        return Response(serializer.data)