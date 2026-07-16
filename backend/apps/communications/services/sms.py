from apps.communications.models import CommunicationEvent
from apps.communications.providers.sms import MSG91Provider


def get_sms_provider():
    from apps.communications.models import OrganizationSMSProvider

    organization_provider = (
        OrganizationSMSProvider.objects.filter(
            is_active=True,
        )
        .order_by("-created_at")
        .first()
    )

    if not organization_provider:
        raise ValueError(f"No active SMS provider configured")

    # Only MSG91 is supported currently
    return MSG91Provider(
        auth_key=organization_provider.auth_key,
        sender_id=organization_provider.sender_id,
    )


def send_sms(to, message, config=None, execution=None, campaign=None):
    config = config or {}
    provider = get_sms_provider()
    response = provider.send(
        to,
        message,
        metadata=config.get("metadata", {}),
    )

    CommunicationEvent.objects.create(
        execution=execution,
        campaign=campaign,
        channel="SMS",
        event_name="SMS_SENT",
        recipient=to,
        status="SENT",
        provider_message_id=str(getattr(response, "sid", "")),
        metadata=config.get("metadata", {}),
    )

    return True

