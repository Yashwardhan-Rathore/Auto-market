from django.urls import path

from apps.campaigns.views import (
    CampaignCreateAPIView,
)

urlpatterns = [
    path(
        "",
        CampaignCreateAPIView.as_view(),
        name="campaign-create",
    ),
]