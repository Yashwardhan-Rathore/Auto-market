from django.urls import path

from apps.webhooks.views import IncomingWebhookView


urlpatterns = [
    path(
        "<str:secret>/",
        IncomingWebhookView.as_view(),
    ),
]

