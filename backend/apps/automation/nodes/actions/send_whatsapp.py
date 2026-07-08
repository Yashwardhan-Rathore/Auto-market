from apps.communications.services.whatsapp import send_whatsapp


class SendWhatsAppAction:
    def execute(self, execution, node, config):
        send_whatsapp(
            organization=execution.automation.owner,
            to=config.get("to"),
            message=config.get("message", ""),
            config=config,
            execution=execution,
        )

        return {
            "success": True,
            "message": "WhatsApp message sent.",
        }

