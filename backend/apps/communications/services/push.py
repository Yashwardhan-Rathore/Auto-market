from apps.communications.models import CommunicationEvent
from apps.communications.providers.push import (
    BrowserPushProvider,
    MobilePushProvider,
)


def get_push_provider(provider_name):
    from apps.communications.models import OrganizationPushProvider

    organization_provider = (
        OrganizationPushProvider.objects.filter(
            is_active=True,
            provider="FCM" if provider_name == "MOBILE" else "VAPID",
        )
        .order_by("-created_at")
        .first()
    )

    if not organization_provider:
        raise ValueError(f"No active {provider_name} push provider configured")

    provider = (
        MobilePushProvider()
        if provider_name == "MOBILE"
        else BrowserPushProvider()
    )
    # The provider models should have the server_key, but BasePushProvider implementations
    # in the codebase currently raise RuntimeError. We'll set the key for completeness.
    provider.server_key = organization_provider.server_key
    return provider


def send_notification(recipient, title, body, config=None, execution=None, campaign=None):
    config = config or {}
    provider_name = (config.get("provider") or "BROWSER").upper()
    provider = get_push_provider(provider_name)

    provider.send(
        recipient,
        title,
        body,
        metadata=config.get("metadata", {}),
    )

    CommunicationEvent.objects.create(
        execution=execution,
        campaign=campaign,
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
