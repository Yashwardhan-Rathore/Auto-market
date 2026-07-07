from apps.communications.services.push import send_notification


class SendNotificationAction:
    def execute(self, execution, node, config):
        send_notification(
            execution,
            config.get("recipient"),
            config.get("title", ""),
            config.get("body", ""),
            config,
        )

        return {
            "success": True,
            "message": "Notification sent.",
        }

