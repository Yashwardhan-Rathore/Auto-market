from apps.communications.models import CommunicationEvent
from apps.communications.providers.whatsapp import MetaWhatsAppProvider


def get_whatsapp_provider():
    from apps.communications.models import OrganizationWhatsAppProvider

    organization_provider = (
        OrganizationWhatsAppProvider.objects.filter(
            is_active=True,
        )
        .order_by("-created_at")
        .first()
    )

    if not organization_provider:
        raise ValueError(f"No active WhatsApp provider configured")

    return MetaWhatsAppProvider(
        access_token=organization_provider.access_token,
        phone_number_id=organization_provider.phone_number_id,
    )


def send_whatsapp(to, message, config=None, execution=None, campaign=None):
    config = config or {}
    provider = get_whatsapp_provider()
    response = provider.send(
        to,
        message,
        metadata=config.get("metadata", {}),
    )

    CommunicationEvent.objects.create(
        execution=execution,
        campaign=campaign,
        channel="WHATSAPP",
        event_name="WHATSAPP_SENT",
        recipient=to,
        status="SENT",
        provider_message_id=str(getattr(response, "id", "")),
        metadata=config.get("metadata", {}),
    )

    return True

