from django.core.mail import send_mail
from django.conf import settings


class SendEmailAction:

    def execute(
        self,
        execution,
        node,
        config,
    ):

        recipient = config.get(
            "recipient"
        )

        subject = config.get(
            "subject"
        )

        message = config.get(
            "message"
        )

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [recipient],
            fail_silently=False,
        )

        return {
            "success": True,
            "message": "Email sent."
        }