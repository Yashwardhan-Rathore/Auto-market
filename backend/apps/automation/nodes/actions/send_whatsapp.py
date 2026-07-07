from apps.communications.services.whatsapp import send_whatsapp


class SendWhatsAppAction:
    def execute(self, execution, node, config):
        send_whatsapp(
            execution,
            config.get("to"),
            config.get("message", ""),
            config,
        )

        return {
            "success": True,
            "message": "WhatsApp message sent.",
        }

