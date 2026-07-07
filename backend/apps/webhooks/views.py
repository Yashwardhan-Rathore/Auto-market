from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.webhooks.models import WebhookEvent
from apps.webhooks.services.dispatcher import (
    dispatch_webhook_event,
    matching_webhook_automations,
)
from apps.webhooks.services.signatures import is_valid_signature


class IncomingWebhookView(APIView):
    permission_classes = [
        AllowAny,
    ]
    authentication_classes = []

    def post(self, request, secret):
        automations = list(
            matching_webhook_automations(secret)
        )

        if not automations:
            return Response(
                {
                    "detail": "Invalid webhook secret.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        signature = (
            request.headers.get("X-Automarket-Signature")
            or request.headers.get("X-Hub-Signature-256")
        )

        if not is_valid_signature(secret, request.body, signature):
            return Response(
                {
                    "detail": "Invalid webhook signature.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        event = WebhookEvent.objects.create(
            secret=secret,
            payload=request.data,
            headers=dict(request.headers),
        )
        executions = dispatch_webhook_event(event)

        return Response(
            {
                "success": True,
                "event_id": event.id,
                "execution_ids": [
                    execution.id
                    for execution in executions
                ],
            },
            status=status.HTTP_202_ACCEPTED,
        )

