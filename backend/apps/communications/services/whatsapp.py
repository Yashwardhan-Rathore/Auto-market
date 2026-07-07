from apps.communications.models import CommunicationEvent
from apps.communications.providers.whatsapp import MetaWhatsAppProvider


def send_whatsapp(execution, to, message, config):
    provider = MetaWhatsAppProvider(
        access_token=config.get("access_token"),
        phone_number_id=config.get("phone_number_id"),
    )
    response = provider.send(
        to,
        message,
        metadata=config.get("metadata", {}),
    )

    CommunicationEvent.objects.create(
        organization=execution.automation.owner,
        execution=execution,
        channel="WHATSAPP",
        event_name="WHATSAPP_SENT",
        recipient=to,
        status="SENT",
        provider_message_id=str(getattr(response, "id", "")),
        metadata=config.get("metadata", {}),
    )

    return True

