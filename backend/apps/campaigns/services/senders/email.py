import logging
import uuid

from django.conf import settings
from django.core.mail import EmailMessage


logger = logging.getLogger(__name__)


class EmailSender:
    """
    SMTP Email Sender.

    Sends emails using Django's email backend.
    """

    @staticmethod
    def send(*, delivery):

        recipient = delivery.customer.data.get("email")

        if not recipient:
            return {
                "success": False,
                "error": "Customer email not found.",
            }

        try:

            email = EmailMessage(
                subject=delivery.campaign.name,
                body=delivery.rendered_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[recipient],
            )

            email.send(
                fail_silently=False,
            )

            provider_message_id = (
                f"EMAIL-{uuid.uuid4().hex[:12].upper()}"
            )

            logger.info(
                "Email sent | Campaign=%s Customer=%s Email=%s",
                delivery.campaign.id,
                delivery.customer.id,
                recipient,
            )

            return {
                "success": True,
                "provider_message_id": provider_message_id,
            }

        except Exception as exc:

            logger.exception(
                "Failed to send email | Campaign=%s Customer=%s",
                delivery.campaign.id,
                delivery.customer.id,
            )

            return {
                "success": False,
                "error": str(exc),
            }