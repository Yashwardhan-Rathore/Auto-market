from apps.communications.models import CommunicationEvent
from apps.communications.providers.push import (
    BrowserPushProvider,
    MobilePushProvider,
)


def send_notification(execution, recipient, title, body, config):
    provider_name = (config.get("provider") or "BROWSER").upper()
    provider = (
        MobilePushProvider()
        if provider_name == "MOBILE"
        else BrowserPushProvider()
    )
    provider.send(
        recipient,
        title,
        body,
        metadata=config.get("metadata", {}),
    )

    CommunicationEvent.objects.create(
        organization=execution.automation.owner,
        execution=execution,
        channel="NOTIFICATION",
        event_name="NOTIFICATION_SENT",
        recipient=recipient,
        status="SENT",
        metadata={
            "title": title,
            **config.get("metadata", {}),
        },
    )

    return True
