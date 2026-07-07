from django.urls import path

from apps.communications.views import (
    CommunicationEventListView,
    EmailProviderListCreateView,
)


urlpatterns = [
    path(
        "email-providers/",
        EmailProviderListCreateView.as_view(),
    ),
    path(
        "events/",
        CommunicationEventListView.as_view(),
    ),
]

