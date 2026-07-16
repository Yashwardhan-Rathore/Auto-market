from apps.communications.services.email import send_email


class SendEmailAction:

    def execute(
        self,
        execution,
        node,
        config,
    ):

        recipient = config.get("recipient")
        recipients = config.get("recipients") or [recipient]

        subject = config.get(
            "subject"
        )

        message = config.get(
            "message"
        )

        send_email(
            subject=subject,
            message=message,
            recipients=recipients,
            sender=config.get("sender"),
            execution=execution,
        )

        return {
            "success": True,
            "message": "Email sent."
        }


class SendBulkEmailAction(SendEmailAction):
    pass
