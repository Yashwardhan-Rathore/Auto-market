from apps.campaigns.services.senders.email import EmailSender
from apps.campaigns.services.senders.sms import SmsSender
from apps.campaigns.services.senders.whatsapp import WhatsAppSender


class Dispatcher:
    """
    Routes a delivery to the correct sender.
    """

    SENDERS = {
        "EMAIL": EmailSender,
        "SMS": SmsSender,
        "WHATSAPP": WhatsAppSender,
    }

    @classmethod
    def send(cls, *, delivery):

        sender = cls.SENDERS.get(
            delivery.channel.code.upper()
        )

        if sender is None:
            raise ValueError(
                f"No sender configured for channel "
                f"{delivery.channel.code}"
            )

        return sender.send(
            delivery=delivery,
        )