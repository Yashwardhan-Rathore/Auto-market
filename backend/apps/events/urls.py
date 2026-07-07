from django.urls import path

from apps.events.views import TrackEventView


urlpatterns = [
    path(
        "track/",
        TrackEventView.as_view(),
    ),
]

