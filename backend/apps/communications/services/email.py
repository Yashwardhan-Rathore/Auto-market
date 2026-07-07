from apps.communications.models import CommunicationEvent
from apps.communications.providers.email import (
    default_sender,
    get_email_provider,
)


def send_email(execution, subject, message, recipients, sender=None):
    organization = execution.automation.owner
    provider = get_email_provider(organization)
    organization_provider = getattr(
        provider,
        "organization_provider",
        None,
    )
    sender = sender or default_sender(organization_provider)

    provider.send(
        subject,
        message,
        sender,
        recipients,
    )

    for recipient in recipients:
        CommunicationEvent.objects.create(
            organization=organization,
            execution=execution,
            channel="EMAIL",
            event_name="EMAIL_SENT",
            recipient=recipient,
            status="SENT",
            metadata={
                "subject": subject,
            },
        )

    return True

