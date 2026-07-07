from django.urls import path

from apps.campaigns.views import (
    CustomerUploadAPIView,
    CustomerUploadListAPIView,
)

urlpatterns = [
    path(
        "uploads/",
        CustomerUploadAPIView.as_view(),
        name="customer-upload",
    ),
    path(
        "uploads/list/",
        CustomerUploadListAPIView.as_view(),
        name="customer-upload-list",
    ),
]