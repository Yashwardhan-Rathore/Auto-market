from apps.communications.services.push import send_notification


class SendNotificationAction:
    def execute(self, execution, node, config):
        send_notification(
            recipient=config.get("recipient"),
            title=config.get("title", ""),
            body=config.get("body", ""),
            config=config,
            execution=execution,
        )

        return {
            "success": True,
            "message": "Notification sent.",
        }

