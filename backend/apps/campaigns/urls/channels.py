from django.urls import path

from apps.campaigns.views import (
    AssignChannelsView,
    ChannelListAPIView,
)

urlpatterns = [
    path(
        "",
        ChannelListAPIView.as_view(),
        name="list-channels",
    ),
    path(
        "<int:campaign_id>/",
        AssignChannelsView.as_view(),
        name="assign-channels",
    ),
]