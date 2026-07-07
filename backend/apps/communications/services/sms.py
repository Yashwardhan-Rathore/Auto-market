from apps.communications.models import CommunicationEvent
from apps.communications.providers.sms import MSG91Provider, TwilioProvider


def get_sms_provider(config):
    provider = (config.get("provider") or "TWILIO").upper()

    if provider == "MSG91":
        return MSG91Provider(
            auth_key=config.get("auth_key"),
            sender_id=config.get("sender_id"),
        )

    return TwilioProvider(
        account_sid=config.get("account_sid"),
        auth_token=config.get("auth_token"),
        from_number=config.get("from_number"),
    )


def send_sms(execution, to, message, config):
    provider = get_sms_provider(config)
    response = provider.send(
        to,
        message,
        metadata=config.get("metadata", {}),
    )

    CommunicationEvent.objects.create(
        organization=execution.automation.owner,
        execution=execution,
        channel="SMS",
        event_name="SMS_SENT",
        recipient=to,
        status="SENT",
        provider_message_id=str(getattr(response, "sid", "")),
        metadata=config.get("metadata", {}),
    )

    return True

