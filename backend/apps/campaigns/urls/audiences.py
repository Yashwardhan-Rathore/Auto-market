from django.urls import path

from apps.campaigns.views import (
    AudienceCreateAPIView,
    AudienceListAPIView,
    AudiencePreviewAPIView,
    AudienceDetailAPIView,
)

urlpatterns = [
    path(
        "",
        AudienceListAPIView.as_view(),
        name="audience-list",
    ),
    path(
        "create/",
        AudienceCreateAPIView.as_view(),
        name="audience-create",
    ),
    path(
        "preview/",
        AudiencePreviewAPIView.as_view(),
        name="audience-preview",
    ),
    path(
        "<int:audience_id>/",
        AudienceDetailAPIView.as_view(),
        name="audience-detail",
    ),
]
