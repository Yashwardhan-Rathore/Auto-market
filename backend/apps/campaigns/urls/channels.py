from django.urls import path

from apps.campaigns.views import (
    AssignChannelsView,
)

urlpatterns = [
    path(
        "<int:campaign_id>/",
        AssignChannelsView.as_view(),
        name="assign-channels",
    ),
]