import os
import uuid

from django.conf import settings
from django.core.files.storage import default_storage
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Asset
from .serializers import AssetCreateSerializer, AssetSerializer


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _detect_type(filename: str, mime: str | None = None) -> str:
    ext = os.path.splitext(filename)[1].lower().lstrip(".")
    image_exts = {"jpg", "jpeg", "png", "webp", "gif", "svg", "bmp", "tiff"}
    video_exts = {"mp4", "mov", "avi", "mkv", "webm", "m4v"}
    doc_exts   = {"pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv"}
    if ext in image_exts:
        return Asset.AssetType.IMAGE
    if ext in video_exts:
        return Asset.AssetType.VIDEO
    if ext in doc_exts:
        return Asset.AssetType.DOCUMENT
    return Asset.AssetType.OTHER


class AssetPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = "size"
    max_page_size = 200


# ─── Views ────────────────────────────────────────────────────────────────────

class AssetListCreateView(APIView):
    """
    GET  /api/assets/   – list assets visible to the requesting user
    POST /api/assets/   – upload a new asset (multipart/form-data)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Asset.objects.filter(uploaded_by=request.user).select_related("uploaded_by").prefetch_related("tags")

        # Optional filters
        asset_type = request.query_params.get("type")
        if asset_type:
            qs = qs.filter(asset_type=asset_type.upper())

        search = request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(name__icontains=search)

        paginator = AssetPagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = AssetSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = AssetCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        file_url = data.get("file_url", "")

        # Handle file upload
        uploaded_file = data.get("file")
        if uploaded_file:
            ext = os.path.splitext(uploaded_file.name)[1]
            save_path = f"assets/{uuid.uuid4().hex}{ext}"
            saved_name = default_storage.save(save_path, uploaded_file)
            file_url = request.build_absolute_uri(
                settings.MEDIA_URL + saved_name
            )

        # Auto-detect type if not provided
        asset_type = data.get("asset_type") or _detect_type(
            data["name"],
            uploaded_file.content_type if uploaded_file else None,
        )

        asset = Asset.objects.create(
            name=data["name"],
            file_url=file_url,
            asset_type=asset_type,
            is_personal=data.get("is_personal", False),
            uploaded_by=request.user,
        )

        return Response(AssetSerializer(asset).data, status=status.HTTP_201_CREATED)


class AssetDetailView(APIView):
    """
    GET    /api/assets/<pk>/
    DELETE /api/assets/<pk>/
    """
    permission_classes = [IsAuthenticated]

    def _get_asset(self, pk, user):
        try:
            return Asset.objects.get(pk=pk, uploaded_by=user)
        except Asset.DoesNotExist:
            return None

    def get(self, request, pk):
        asset = self._get_asset(pk, request.user)
        if not asset:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(AssetSerializer(asset).data)

    def delete(self, request, pk):
        asset = self._get_asset(pk, request.user)
        if not asset:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        asset.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
